import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// SHARED CONSTANTS (mirrored from src/lib/constants.ts)
// ============================================================
const FREE_DRILL_LIMIT_PER_DAY = 1;
const DAILY_GOAL_MINUTES = 30;
const XP_MULTIPLIER = 1;
const CHALLENGE_XP_BONUS = 50;

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
// LOGGING HELPER
// ============================================================
function log(step: string, details?: unknown) {
  console.log(`[complete-drill] ${step}`, details ? JSON.stringify(details) : "");
}

function logError(step: string, error: unknown) {
  console.error(`[complete-drill] ERROR - ${step}`, error);
}

// ============================================================
// SUBSCRIPTION HELPERS
// ============================================================
async function checkSubscription(
  userId: string,
  email: string | undefined,
  supabaseAdmin: any,
  stripeSecretKey: string
): Promise<{ hasSubscription: boolean; subscriptionType: "none" | "single_sport" | "pro"; subscribedSport?: string }> {
  // Check for test accounts with paid access
  const testAccountsEnv = Deno.env.get("TEST_ACCOUNTS_WITH_PAID_ACCESS") ?? "";
  const testAccounts = testAccountsEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
  
  if (email && testAccounts.includes(email.toLowerCase())) {
    log("Test account with Pro access", { email });
    return { hasSubscription: true, subscriptionType: "pro" };
  }

  // Check Stripe subscription
  if (stripeSecretKey && email) {
    try {
      const customerSearchResponse = await fetch(
        `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email)}'`,
        { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
      );

      if (customerSearchResponse.ok) {
        const customerData = await customerSearchResponse.json();
        if (customerData.data && customerData.data.length > 0) {
          const customerId = customerData.data[0].id;

          const subscriptionsResponse = await fetch(
            `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=10`,
            { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
          );

          if (subscriptionsResponse.ok) {
            const subscriptionsData = await subscriptionsResponse.json();
            if (subscriptionsData.data && subscriptionsData.data.length > 0) {
              // Check subscription metadata for type
              for (const sub of subscriptionsData.data) {
                const productId = sub.items?.data?.[0]?.price?.product;
                if (productId) {
                  // Fetch product to check metadata
                  const productResponse = await fetch(
                    `https://api.stripe.com/v1/products/${productId}`,
                    { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
                  );
                  if (productResponse.ok) {
                    const product = await productResponse.json();
                    const subType = product.metadata?.subscription_type || "pro";
                    const sport = product.metadata?.sport;
                    
                    if (subType === "single_sport" && sport) {
                      return { hasSubscription: true, subscriptionType: "single_sport", subscribedSport: sport };
                    }
                    return { hasSubscription: true, subscriptionType: "pro" };
                  }
                }
              }
              // Default to pro if we found a subscription but couldn't determine type
              return { hasSubscription: true, subscriptionType: "pro" };
            }
          }
        }
      }
    } catch (error) {
      logError("Stripe subscription check", error);
    }
  }

  return { hasSubscription: false, subscriptionType: "none" };
}

// ============================================================
// UNLOCK VALIDATION
// ============================================================
async function validateUnlockRequirements(
  drill: DrillRow,
  userId: string,
  supabaseAdmin: any,
  hasSubscription: boolean,
  subscriptionType: string,
  subscribedSport?: string
): Promise<{ unlocked: boolean; reason?: string }> {
  // Pro users bypass all unlock requirements
  if (subscriptionType === "pro") {
    return { unlocked: true };
  }

  // SingleSport subscribers get unlimited for their sport
  if (subscriptionType === "single_sport" && subscribedSport === drill.sport) {
    return { unlocked: true };
  }

  // Free drills at level 1 are always unlocked
  if (drill.free && drill.level === 1) {
    return { unlocked: true };
  }

  // Free users can only do level 1 free drills
  if (!hasSubscription) {
    if (drill.level > 1) {
      return { unlocked: false, reason: "Upgrade to access higher level drills" };
    }
    if (!drill.free) {
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
    
    // Get all drills in this category at the required level
    const { data: categoryDrills, error: drillsError } = await supabaseAdmin
      .from("drills")
      .select("id")
      .eq("category", drill.category)
      .eq("level", requiredLevel);

    if (drillsError || !categoryDrills || categoryDrills.length === 0) {
      return { unlocked: false, reason: "Failed to verify unlock requirements" };
    }

    const categoryDrillIds = (categoryDrills as { id: string }[]).map(d => d.id);
    
    // Check if any completed drill matches
    const { count, error: countError } = await supabaseAdmin
      .from("completed_drills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("drill_id", categoryDrillIds);

    if (countError) {
      return { unlocked: false, reason: "Failed to verify unlock requirements" };
    }

    if ((count ?? 0) === 0) {
      return { unlocked: false, reason: `Complete a level ${requiredLevel} drill in ${drill.category_name || drill.category} first` };
    }
  }

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
  // If no metric or score_data, use XP as score
  if (!metric || !scoreData) {
    return xp;
  }

  // Try to extract score from score_data based on metric type
  const metricType = metric.type as string | undefined;
  
  if (metricType === "time" && typeof scoreData.time === "number") {
    return Math.max(0, 100 - Math.floor(scoreData.time)); // Lower time = higher score
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

  // Default to XP as score
  return xp;
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== PARSE REQUEST ==========
    let body: CompleteDrillRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { drill_id, duration_minutes, score_data, challenge_id } = body;

    if (!drill_id || typeof drill_id !== "string" || drill_id.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid drill_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("Processing drill completion", { drill_id, challenge_id, duration_minutes });

    // ========== SETUP SUPABASE CLIENTS ==========
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ========== VERIFY USER ==========
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("User authenticated", { userId: user.id, email: user.email });

    // ========== FETCH DRILL FROM DATABASE ==========
    const { data: drill, error: drillError } = await supabaseAdmin
      .from("drills")
      .select("*")
      .eq("id", drill_id)
      .maybeSingle();

    if (drillError) {
      logError("Fetching drill", drillError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch drill" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!drill) {
      return new Response(
        JSON.stringify({ error: "Drill not found", drill_id }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("Drill fetched", { id: drill.id, title: drill.title, level: drill.level, xp: drill.xp });

    // ========== CHECK SUBSCRIPTION ==========
    const { hasSubscription, subscriptionType, subscribedSport } = await checkSubscription(
      user.id,
      user.email,
      supabaseAdmin,
      stripeSecretKey
    );

    log("Subscription status", { hasSubscription, subscriptionType, subscribedSport });

    // ========== DETECT ACTIVE CHALLENGE ==========
    let activeChallenge: ChallengeRow | null = null;
    
    // Check if challenge_id was provided or find active challenge for this drill
    if (challenge_id) {
      const { data: challengeById } = await supabaseAdmin
        .from("challenges")
        .select("*")
        .eq("id", challenge_id)
        .eq("status", "accepted")
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .maybeSingle();
      
      activeChallenge = challengeById;
    } else {
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
      log("Active challenge detected", { challengeId: activeChallenge!.id });
    }

    // ========== FREE DRILL LIMIT CHECK ==========
    if (!hasSubscription) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Count regular drills completed today
      const { count: regularCount } = await supabaseAdmin
        .from("completed_drills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", todayStart.toISOString())
        .lt("completed_at", todayEnd.toISOString());

      // Count challenge drills where user submitted a score today
      const { count: challengeCount } = await supabaseAdmin
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .or(`and(challenger_id.eq.${user.id},challenger_score.not.is.null),and(challenged_id.eq.${user.id},challenged_score.not.is.null)`)
        .gte("created_at", todayStart.toISOString())
        .lt("created_at", todayEnd.toISOString());

      const completedToday = (regularCount ?? 0) + (challengeCount ?? 0);

      log("Free limit check", { regularCount, challengeCount, completedToday, limit: FREE_DRILL_LIMIT_PER_DAY });

      if (completedToday >= FREE_DRILL_LIMIT_PER_DAY) {
        return new Response(
          JSON.stringify({ 
            error: "Daily free drill limit reached",
            code: "DRILL_LIMIT_REACHED",
            limit: FREE_DRILL_LIMIT_PER_DAY,
            completedToday
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
        subscribedSport
      );

      if (!unlockResult.unlocked) {
        log("Drill locked", { reason: unlockResult.reason });
        return new Response(
          JSON.stringify({ 
            error: unlockResult.reason || "Drill is locked",
            code: "DRILL_LOCKED"
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate values
    const xpEarned = Math.floor(drill.xp * XP_MULTIPLIER);
    const actualDuration = duration_minutes ?? drill.duration_minutes;
    const today = new Date().toISOString().split("T")[0];

    // ========== CHALLENGE DRILL PATH ==========
    if (isChallengeDrill && activeChallenge) {
      const challenge = activeChallenge;
      const isChallenger = challenge.challenger_id === user.id;

      // Check if already submitted
      const hasSubmitted = isChallenger 
        ? challenge.challenger_score !== null 
        : challenge.challenged_score !== null;

      if (hasSubmitted) {
        return new Response(
          JSON.stringify({ 
            success: true,
            message: "You have already submitted your score for this challenge",
            already_completed: true,
            challenge_submitted: true
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Compute score from metric/score_data or use XP
      const score = computeScoreFromMetric(drill.metric as Record<string, unknown> | null, score_data, xpEarned);

      // Build update data
      const updateData: Record<string, unknown> = isChallenger
        ? { challenger_score: score }
        : { challenged_score: score };

      const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
      let challengeCompleted = false;
      let won: boolean | null = null;
      let bonusXp = 0;

      if (otherScore !== null) {
        // Both players have submitted - determine winner
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
          bonusXp = challenge.xp_bonus || CHALLENGE_XP_BONUS;
        }

        log("Challenge completed", { winnerId, score, otherScore, won, bonusXp });
      }

      // Update challenge
      const { error: updateError } = await supabaseAdmin
        .from("challenges")
        .update(updateData)
        .eq("id", challenge.id);

      if (updateError) {
        logError("Updating challenge", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to submit challenge score" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update daily progress (challenge drills count toward daily stats)
      const totalXp = xpEarned + bonusXp;

      const { error: progressError } = await supabaseAdmin
        .from("daily_progress")
        .upsert({
          user_id: user.id,
          date: today,
          minutes_completed: actualDuration,
          xp_earned: totalXp,
          drills_completed: 1,
          goal_minutes: DAILY_GOAL_MINUTES
        }, {
          onConflict: "user_id,date",
          ignoreDuplicates: false
        });

      if (progressError) {
        // Fallback: try update
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
            goal_minutes: DAILY_GOAL_MINUTES
          });
        }
      }

      // Update profile XP (NOT completing drill tree)
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabaseAdmin
          .from("profiles")
          .update({ total_xp: (profile.total_xp ?? 0) + totalXp })
          .eq("id", user.id);
      }

      log("Challenge score submitted", { challengeId: challenge.id, score, xpEarned: totalXp });

      return new Response(
        JSON.stringify({
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
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== REGULAR DRILL PATH ==========
    
    // Check idempotency - already completed?
    const { data: existingDrill } = await supabaseAdmin
      .from("completed_drills")
      .select("id")
      .eq("user_id", user.id)
      .eq("drill_id", drill_id)
      .maybeSingle();

    if (existingDrill) {
      log("Drill already completed - idempotent return");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Drill already completed",
          already_completed: true,
          earned_xp: 0,
          challenge_submitted: false,
          unlocked_new_drills: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert completed drill (affects tree progression)
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
      logError("Inserting completed drill", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to record drill completion" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert daily progress
    const { error: progressError } = await supabaseAdmin
      .from("daily_progress")
      .upsert({
        user_id: user.id,
        date: today,
        minutes_completed: actualDuration,
        xp_earned: xpEarned,
        drills_completed: 1,
        goal_minutes: DAILY_GOAL_MINUTES
      }, {
        onConflict: "user_id,date",
        ignoreDuplicates: false
      });

    if (progressError) {
      // Fallback logic
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
          goal_minutes: DAILY_GOAL_MINUTES
        });
      }
    }

    // Update profile XP and streak
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_xp, current_streak, longest_streak")
      .eq("id", user.id)
      .single();

    let newStreak = profile?.current_streak ?? 0;
    let longestStreak = profile?.longest_streak ?? 0;
    let newTotalXp = (profile?.total_xp ?? 0) + xpEarned;

    // Check if this is first drill of the day (for streak)
    const { data: todayProgress } = await supabaseAdmin
      .from("daily_progress")
      .select("minutes_completed")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const todayMinutes = todayProgress?.minutes_completed ?? 0;
    const wasGoalMetBefore = (todayMinutes - actualDuration) >= DAILY_GOAL_MINUTES;
    const isGoalMetNow = todayMinutes >= DAILY_GOAL_MINUTES;

    // Only increment streak when goal is first met today
    if (isGoalMetNow && !wasGoalMetBefore) {
      newStreak += 1;
      longestStreak = Math.max(longestStreak, newStreak);
      log("Daily goal met - streak incremented", { newStreak, longestStreak });
    }

    if (profile) {
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
    
    // Check if completing this drill unlocks any level+1 drills
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

    log("Drill completed successfully", { drill_id, xpEarned, newTotalXp, newStreak, unlockedDrills });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Drill completed successfully",
        earned_xp: xpEarned,
        new_total_xp: newTotalXp,
        day_minutes: todayMinutes,
        already_completed: false,
        challenge_submitted: false,
        unlocked_new_drills: unlockedDrills
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logError("Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
