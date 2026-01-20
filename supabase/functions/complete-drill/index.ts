import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  Logger, 
  getAppConfig, 
  corsHeaders, 
  jsonResponse, 
  errorResponse, 
  optionsResponse,
  createSupabaseClients,
  type AppConfig 
} from "../_shared/config.ts";

// ============================================================
// TYPES
// ============================================================
interface CompleteDrillRequest {
  drill_id: string;
  duration_minutes?: number;
  score_data?: Record<string, unknown>;
  challenge_id?: string;
}

interface DrillRow {
  id: string;
  sport: string;
  category: string;
  category_name: string | null;
  level: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  xp: number;
  free: boolean;
  unlock_requires: string | null;
  metric: Record<string, unknown> | null;
}

interface ChallengeRow {
  id: string;
  challenger_id: string;
  challenged_id: string;
  drill_id: string;
  sport: string;
  status: string;
  challenger_score: number | null;
  challenged_score: number | null;
  winner_id: string | null;
  expires_at: string;
  xp_bonus: number;
}

// ============================================================
// SUBSCRIPTION HELPERS
// ============================================================
async function checkSubscription(
  userId: string,
  email: string | undefined,
  supabaseAdmin: unknown,
  stripeSecretKey: string,
  logger: Logger
): Promise<{ hasSubscription: boolean; subscriptionType: "none" | "single_sport" | "pro"; subscribedSport?: string }> {
  // Check for test accounts with paid access
  const testAccountsEnv = Deno.env.get("TEST_ACCOUNTS_WITH_PAID_ACCESS") ?? "";
  const testAccounts = testAccountsEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
  
  if (email && testAccounts.includes(email.toLowerCase())) {
    logger.event("test_account_pro", { email });
    return { hasSubscription: true, subscriptionType: "pro" };
  }

  // Check Stripe subscription
  if (stripeSecretKey && email) {
    try {
      logger.apiCall("stripe", "customer_search", { email });
      const customerSearchResponse = await fetch(
        `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email)}'`,
        { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
      );

      if (customerSearchResponse.ok) {
        const customerData = await customerSearchResponse.json();
        if (customerData.data && customerData.data.length > 0) {
          const customerId = customerData.data[0].id;

          logger.apiCall("stripe", "list_subscriptions", { customer_id: customerId });
          const subscriptionsResponse = await fetch(
            `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=10`,
            { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
          );

          if (subscriptionsResponse.ok) {
            const subscriptionsData = await subscriptionsResponse.json();
            if (subscriptionsData.data && subscriptionsData.data.length > 0) {
              for (const sub of subscriptionsData.data) {
                const productId = sub.items?.data?.[0]?.price?.product;
                if (productId) {
                  logger.apiCall("stripe", "get_product", { product_id: productId });
                  const productResponse = await fetch(
                    `https://api.stripe.com/v1/products/${productId}`,
                    { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
                  );
                  if (productResponse.ok) {
                    const product = await productResponse.json();
                    const subType = product.metadata?.subscription_type || "pro";
                    const sport = product.metadata?.sport;
                    
                    if (subType === "single_sport" && sport) {
                      logger.event("subscription_found", { type: "single_sport", sport });
                      return { hasSubscription: true, subscriptionType: "single_sport", subscribedSport: sport };
                    }
                    logger.event("subscription_found", { type: "pro" });
                    return { hasSubscription: true, subscriptionType: "pro" };
                  }
                }
              }
              return { hasSubscription: true, subscriptionType: "pro" };
            }
          }
        }
      }
    } catch (error) {
      logger.error("stripe_subscription_check", error);
    }
  }

  logger.event("no_subscription");
  return { hasSubscription: false, subscriptionType: "none" };
}

// ============================================================
// UNLOCK VALIDATION
// ============================================================
async function validateUnlockRequirements(
  drill: DrillRow,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  hasSubscription: boolean,
  subscriptionType: string,
  subscribedSport: string | undefined,
  logger: Logger
): Promise<{ unlocked: boolean; reason?: string }> {
  // Pro users bypass all unlock requirements
  if (subscriptionType === "pro") {
    logger.event("unlock_bypass", { reason: "pro_subscription" });
    return { unlocked: true };
  }

  // SingleSport subscribers get unlimited for their sport
  if (subscriptionType === "single_sport" && subscribedSport === drill.sport) {
    logger.event("unlock_bypass", { reason: "single_sport_match" });
    return { unlocked: true };
  }

  // Free drills at level 1 are always unlocked
  if (drill.free && drill.level === 1) {
    logger.event("unlock_free_level1");
    return { unlocked: true };
  }

  // Free users can only do level 1 free drills
  if (!hasSubscription) {
    if (drill.level > 1) {
      logger.event("unlock_denied", { reason: "free_user_level_restriction", drill_level: drill.level });
      return { unlocked: false, reason: "Upgrade to access higher level drills" };
    }
    if (!drill.free) {
      logger.event("unlock_denied", { reason: "drill_not_free" });
      return { unlocked: false, reason: "This drill requires a subscription" };
    }
  }

  // Check unlock_requires for progression rules
  const unlockRequires = drill.unlock_requires;
  if (!unlockRequires || unlockRequires === "none") {
    return { unlocked: true };
  }

  // Parse unlock_requires: "complete_any_in_category_level_N"
  const levelMatch = unlockRequires.match(/complete_any_in_category_level_(\d+)/);
  if (levelMatch) {
    const requiredLevel = parseInt(levelMatch[1], 10);
    
    logger.dbOperation("select", "drills", { category: drill.category, level: requiredLevel });
    const { data: categoryDrills, error: drillsError } = await supabaseAdmin
      .from("drills")
      .select("id")
      .eq("category", drill.category)
      .eq("level", requiredLevel);

    if (drillsError || !categoryDrills || categoryDrills.length === 0) {
      logger.error("unlock_validation_failed", drillsError);
      return { unlocked: false, reason: "Failed to verify unlock requirements" };
    }

    const categoryDrillIds = (categoryDrills as { id: string }[]).map(d => d.id);
    
    logger.dbOperation("count", "completed_drills", { user_id: userId, drill_ids_count: categoryDrillIds.length });
    const { count, error: countError } = await supabaseAdmin
      .from("completed_drills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("drill_id", categoryDrillIds);

    if (countError) {
      logger.error("unlock_count_failed", countError);
      return { unlocked: false, reason: "Failed to verify unlock requirements" };
    }

    if ((count ?? 0) === 0) {
      logger.event("unlock_denied", { reason: "prerequisite_not_met", required_level: requiredLevel });
      return { unlocked: false, reason: `Complete a level ${requiredLevel} drill in ${drill.category_name || drill.category} first` };
    }
  }

  logger.event("unlock_granted");
  return { unlocked: true };
}

// ============================================================
// COMPUTE SCORE FROM METRIC
// ============================================================
function computeScoreFromMetric(
  metric: Record<string, unknown> | null,
  scoreData: Record<string, unknown> | undefined,
  xp: number
): number {
  if (!metric || !scoreData) {
    return xp;
  }

  const metricType = metric.type as string | undefined;
  
  if (metricType === "time" && typeof scoreData.time === "number") {
    return Math.max(0, 100 - Math.floor(scoreData.time));
  }
  
  if (metricType === "reps" && typeof scoreData.reps === "number") {
    return Math.floor(scoreData.reps);
  }
  
  if (metricType === "accuracy" && typeof scoreData.accuracy === "number") {
    return Math.floor(scoreData.accuracy);
  }
  
  if (typeof scoreData.score === "number") {
    return Math.floor(scoreData.score);
  }

  return xp;
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  const logger = new Logger("complete-drill");

  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  try {
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logger.warn("auth_missing");
      return errorResponse("Missing or invalid authorization header", 401);
    }

    // ========== PARSE REQUEST ==========
    let body: CompleteDrillRequest;
    try {
      body = await req.json();
    } catch {
      logger.warn("invalid_json");
      return errorResponse("Invalid JSON body", 400);
    }

    const { drill_id, duration_minutes, score_data, challenge_id } = body;

    if (!drill_id || typeof drill_id !== "string" || drill_id.length > 100) {
      logger.warn("invalid_drill_id", { drill_id });
      return errorResponse("Invalid drill_id", 400);
    }

    logger.requestStart(req.method, "/complete-drill", { drill_id, challenge_id, duration_minutes });

    // ========== SETUP SUPABASE CLIENTS ==========
    const { supabaseWithAuth, supabaseAdmin, error: clientError } = createSupabaseClients(authHeader);
    if (clientError) {
      logger.error("client_setup", clientError);
      return errorResponse(clientError, 500);
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    // ========== LOAD CONFIG FROM DB ==========
    const config = await getAppConfig(supabaseAdmin);
    logger.event("config_loaded", { 
      daily_goal: config.DAILY_GOAL_MINUTES, 
      free_limit: config.FREE_DRILL_LIMIT_PER_DAY,
      xp_multiplier: config.XP_MULTIPLIER 
    });

    // ========== VERIFY USER ==========
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      logger.warn("auth_invalid", { error: userError?.message });
      return errorResponse("Invalid authorization", 401);
    }

    logger.event("user_authenticated", { user_id: user.id });

    // ========== FETCH DRILL FROM DATABASE ==========
    logger.dbOperation("select", "drills", { drill_id });
    const { data: drill, error: drillError } = await supabaseAdmin
      .from("drills")
      .select("*")
      .eq("id", drill_id)
      .maybeSingle();

    if (drillError) {
      logger.error("drill_fetch", drillError);
      return errorResponse("Failed to fetch drill", 500);
    }

    if (!drill) {
      logger.warn("drill_not_found", { drill_id });
      return errorResponse("Drill not found", 404, "DRILL_NOT_FOUND", { drill_id });
    }

    logger.event("drill_fetched", { drill_id: drill.id, title: drill.title, level: drill.level, xp: drill.xp });

    // ========== CHECK SUBSCRIPTION ==========
    const { hasSubscription, subscriptionType, subscribedSport } = await checkSubscription(
      user.id,
      user.email,
      supabaseAdmin,
      stripeSecretKey,
      logger
    );

    logger.event("subscription_checked", { hasSubscription, subscriptionType, subscribedSport });

    // ========== DETECT ACTIVE CHALLENGE ==========
    let activeChallenge: ChallengeRow | null = null;
    
    if (challenge_id) {
      logger.dbOperation("select", "challenges", { challenge_id });
      const { data: challengeById } = await supabaseAdmin
        .from("challenges")
        .select("*")
        .eq("id", challenge_id)
        .eq("status", "accepted")
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .maybeSingle();
      
      activeChallenge = challengeById;
    } else {
      logger.dbOperation("select", "challenges", { drill_id, status: "accepted" });
      const { data: challengeByDrill } = await supabaseAdmin
        .from("challenges")
        .select("*")
        .eq("drill_id", drill_id)
        .eq("status", "accepted")
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      
      activeChallenge = challengeByDrill;
    }

    const isChallengeDrill = !!activeChallenge;

    if (isChallengeDrill) {
      logger.event("challenge_detected", { challenge_id: activeChallenge!.id });
    }

    // ========== FREE DRILL LIMIT CHECK ==========
    if (!hasSubscription) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      logger.dbOperation("count", "completed_drills", { user_id: user.id, date: todayStart.toISOString() });
      const { count: regularCount } = await supabaseAdmin
        .from("completed_drills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", todayStart.toISOString())
        .lt("completed_at", todayEnd.toISOString());

      logger.dbOperation("count", "challenges", { user_id: user.id, date: todayStart.toISOString() });
      const { count: challengeCount } = await supabaseAdmin
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .or(`and(challenger_id.eq.${user.id},challenger_score.not.is.null),and(challenged_id.eq.${user.id},challenged_score.not.is.null)`)
        .gte("created_at", todayStart.toISOString())
        .lt("created_at", todayEnd.toISOString());

      const completedToday = (regularCount ?? 0) + (challengeCount ?? 0);

      logger.event("free_limit_check", { 
        regular_count: regularCount, 
        challenge_count: challengeCount, 
        completed_today: completedToday, 
        limit: config.FREE_DRILL_LIMIT_PER_DAY 
      });

      if (completedToday >= config.FREE_DRILL_LIMIT_PER_DAY) {
        logger.warn("drill_limit_reached", { completed_today: completedToday, limit: config.FREE_DRILL_LIMIT_PER_DAY });
        return errorResponse("Daily free drill limit reached", 403, "DRILL_LIMIT_REACHED", {
          limit: config.FREE_DRILL_LIMIT_PER_DAY,
          completedToday
        });
      }
    }

    // ========== UNLOCK VALIDATION (for non-challenge drills) ==========
    if (!isChallengeDrill) {
      const unlockResult = await validateUnlockRequirements(
        drill as DrillRow,
        user.id,
        supabaseAdmin,
        hasSubscription,
        subscriptionType,
        subscribedSport,
        logger
      );

      if (!unlockResult.unlocked) {
        logger.warn("drill_locked", { reason: unlockResult.reason });
        return errorResponse(unlockResult.reason || "Drill is locked", 403, "DRILL_LOCKED");
      }
    }

    // Calculate values
    const xpEarned = Math.floor(drill.xp * config.XP_MULTIPLIER);
    const actualDuration = duration_minutes ?? drill.duration_minutes;
    const today = new Date().toISOString().split("T")[0];

    // ========== CHALLENGE DRILL PATH ==========
    if (isChallengeDrill && activeChallenge) {
      const challenge = activeChallenge;
      const isChallenger = challenge.challenger_id === user.id;

      const hasSubmitted = isChallenger 
        ? challenge.challenger_score !== null 
        : challenge.challenged_score !== null;

      if (hasSubmitted) {
        logger.event("challenge_already_submitted", { challenge_id: challenge.id });
        logger.requestEnd(200, { already_completed: true });
        return jsonResponse({
          success: true,
          message: "You have already submitted your score for this challenge",
          already_completed: true,
          challenge_submitted: true
        });
      }

      const score = computeScoreFromMetric(drill.metric as Record<string, unknown> | null, score_data, xpEarned);

      const updateData: Record<string, unknown> = isChallenger
        ? { challenger_score: score }
        : { challenged_score: score };

      const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
      let challengeCompleted = false;
      let won: boolean | null = null;
      let bonusXp = 0;

      if (otherScore !== null) {
        const winnerId = score > otherScore
          ? user.id
          : score < otherScore
            ? (isChallenger ? challenge.challenged_id : challenge.challenger_id)
            : null;

        updateData.status = "completed";
        updateData.winner_id = winnerId;
        updateData.completed_at = new Date().toISOString();

        challengeCompleted = true;
        won = winnerId === user.id;
        
        if (won) {
          bonusXp = challenge.xp_bonus || config.CHALLENGE_XP_BONUS;
        }

        logger.event("challenge_completed", { 
          challenge_id: challenge.id, 
          winner_id: winnerId, 
          user_score: score, 
          opponent_score: otherScore,
          won, 
          bonus_xp: bonusXp 
        });
      }

      logger.dbOperation("update", "challenges", { challenge_id: challenge.id });
      const { error: updateError } = await supabaseAdmin
        .from("challenges")
        .update(updateData)
        .eq("id", challenge.id);

      if (updateError) {
        logger.error("challenge_update", updateError);
        return errorResponse("Failed to submit challenge score", 500);
      }

      const totalXp = xpEarned + bonusXp;

      // Update daily progress
      logger.dbOperation("upsert", "daily_progress", { user_id: user.id, date: today });
      const { error: progressError } = await supabaseAdmin
        .from("daily_progress")
        .upsert({
          user_id: user.id,
          date: today,
          minutes_completed: actualDuration,
          xp_earned: totalXp,
          drills_completed: 1,
          goal_minutes: config.DAILY_GOAL_MINUTES
        }, {
          onConflict: "user_id,date",
          ignoreDuplicates: false
        });

      if (progressError) {
        logger.warn("daily_progress_upsert_fallback", { error: progressError.message });
        const { data: existingProgress } = await supabaseAdmin
          .from("daily_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        if (existingProgress) {
          await supabaseAdmin
            .from("daily_progress")
            .update({
              minutes_completed: (existingProgress.minutes_completed ?? 0) + actualDuration,
              xp_earned: (existingProgress.xp_earned ?? 0) + totalXp,
              drills_completed: (existingProgress.drills_completed ?? 0) + 1,
            })
            .eq("id", existingProgress.id);
        } else {
          await supabaseAdmin.from("daily_progress").insert({
            user_id: user.id,
            date: today,
            minutes_completed: actualDuration,
            xp_earned: totalXp,
            drills_completed: 1,
            goal_minutes: config.DAILY_GOAL_MINUTES
          });
        }
      }

      // Update profile XP
      logger.dbOperation("select", "profiles", { user_id: user.id });
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      if (profile) {
        logger.dbOperation("update", "profiles", { user_id: user.id, xp_delta: totalXp });
        await supabaseAdmin
          .from("profiles")
          .update({ total_xp: (profile.total_xp ?? 0) + totalXp })
          .eq("id", user.id);
      }

      logger.requestEnd(200, { 
        challenge_id: challenge.id, 
        score, 
        xp_earned: totalXp, 
        challenge_completed: challengeCompleted 
      });

      return jsonResponse({
        success: true,
        message: challengeCompleted
          ? (won === true ? "You won the challenge!" : won === false ? "Challenge complete - opponent won." : "It's a tie!")
          : "Challenge score submitted! Waiting for opponent.",
        earned_xp: totalXp,
        new_total_xp: (profile?.total_xp ?? 0) + totalXp,
        day_minutes: actualDuration,
        challenge_submitted: true,
        challenge_completed: challengeCompleted,
        won,
        already_completed: false,
        unlocked_new_drills: []
      });
    }

    // ========== REGULAR DRILL PATH ==========
    
    // Check idempotency
    logger.dbOperation("select", "completed_drills", { user_id: user.id, drill_id });
    const { data: existingDrill } = await supabaseAdmin
      .from("completed_drills")
      .select("id")
      .eq("user_id", user.id)
      .eq("drill_id", drill_id)
      .maybeSingle();

    if (existingDrill) {
      logger.event("drill_already_completed", { drill_id });
      logger.requestEnd(200, { already_completed: true });
      return jsonResponse({
        success: true,
        message: "Drill already completed",
        already_completed: true,
        earned_xp: 0,
        challenge_submitted: false,
        unlocked_new_drills: []
      });
    }

    // Insert completed drill
    logger.dbOperation("insert", "completed_drills", { user_id: user.id, drill_id, xp_earned: xpEarned });
    const { error: insertError } = await supabaseAdmin
      .from("completed_drills")
      .insert({
        user_id: user.id,
        sport: drill.sport,
        drill_id: drill_id,
        duration_minutes: actualDuration,
        xp_earned: xpEarned,
        score_data: score_data ?? null,
        completed_at: new Date().toISOString(),
      });

    if (insertError) {
      logger.error("completed_drill_insert", insertError);
      return errorResponse("Failed to record drill completion", 500);
    }

    // Upsert daily progress
    logger.dbOperation("upsert", "daily_progress", { user_id: user.id, date: today });
    const { error: progressError } = await supabaseAdmin
      .from("daily_progress")
      .upsert({
        user_id: user.id,
        date: today,
        minutes_completed: actualDuration,
        xp_earned: xpEarned,
        drills_completed: 1,
        goal_minutes: config.DAILY_GOAL_MINUTES
      }, {
        onConflict: "user_id,date",
        ignoreDuplicates: false
      });

    if (progressError) {
      logger.warn("daily_progress_upsert_fallback", { error: progressError.message });
      const { data: existingProgress } = await supabaseAdmin
        .from("daily_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (existingProgress) {
        await supabaseAdmin
          .from("daily_progress")
          .update({
            minutes_completed: (existingProgress.minutes_completed ?? 0) + actualDuration,
            xp_earned: (existingProgress.xp_earned ?? 0) + xpEarned,
            drills_completed: (existingProgress.drills_completed ?? 0) + 1,
          })
          .eq("id", existingProgress.id);
      } else {
        await supabaseAdmin.from("daily_progress").insert({
          user_id: user.id,
          date: today,
          minutes_completed: actualDuration,
          xp_earned: xpEarned,
          drills_completed: 1,
          goal_minutes: config.DAILY_GOAL_MINUTES
        });
      }
    }

    // Update profile XP and streak
    logger.dbOperation("select", "profiles", { user_id: user.id });
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_xp, current_streak, longest_streak")
      .eq("id", user.id)
      .single();

    let newStreak = profile?.current_streak ?? 0;
    let longestStreak = profile?.longest_streak ?? 0;
    let newTotalXp = (profile?.total_xp ?? 0) + xpEarned;

    // Check if daily goal met for streak
    const { data: todayProgress } = await supabaseAdmin
      .from("daily_progress")
      .select("minutes_completed")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const todayMinutes = todayProgress?.minutes_completed ?? 0;
    const wasGoalMetBefore = (todayMinutes - actualDuration) >= config.DAILY_GOAL_MINUTES;
    const isGoalMetNow = todayMinutes >= config.DAILY_GOAL_MINUTES;

    if (isGoalMetNow && !wasGoalMetBefore) {
      newStreak += 1;
      longestStreak = Math.max(longestStreak, newStreak);
      logger.event("streak_incremented", { new_streak: newStreak, longest_streak: longestStreak });
    }

    if (profile) {
      logger.dbOperation("update", "profiles", { user_id: user.id, new_total_xp: newTotalXp, new_streak: newStreak });
      await supabaseAdmin
        .from("profiles")
        .update({
          total_xp: newTotalXp,
          current_streak: newStreak,
          longest_streak: longestStreak,
        })
        .eq("id", user.id);
    }

    // Find newly unlocked drills
    const unlockedDrills: string[] = [];
    
    logger.dbOperation("select", "drills", { category: drill.category, level: drill.level + 1 });
    const { data: nextLevelDrills } = await supabaseAdmin
      .from("drills")
      .select("id")
      .eq("category", drill.category)
      .eq("level", drill.level + 1)
      .limit(10);

    if (nextLevelDrills) {
      for (const nextDrill of nextLevelDrills) {
        unlockedDrills.push(nextDrill.id);
      }
    }

    logger.event("drill_completed", { 
      drill_id, 
      xp_earned: xpEarned, 
      new_total_xp: newTotalXp, 
      new_streak: newStreak,
      unlocked_count: unlockedDrills.length 
    });

    logger.requestEnd(200, { 
      drill_id, 
      xp_earned: xpEarned, 
      day_minutes: todayMinutes, 
      unlocked_count: unlockedDrills.length 
    });

    return jsonResponse({
      success: true,
      message: "Drill completed successfully",
      earned_xp: xpEarned,
      new_total_xp: newTotalXp,
      day_minutes: todayMinutes,
      already_completed: false,
      challenge_submitted: false,
      unlocked_new_drills: unlockedDrills
    });

  } catch (error) {
    logger.error("unexpected_error", error);
    logger.requestEnd(500);
    return errorResponse("Internal server error", 500);
  }
});
