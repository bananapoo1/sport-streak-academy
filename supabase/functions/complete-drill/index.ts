import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free users can only complete 1 drill per day
const FREE_DRILL_LIMIT = 1;

// Server-side XP calculation based on drill level
// XP formula: base 20 XP * level * 1.5 (matches drillsData.ts)
const DRILL_XP_BY_LEVEL: Record<number, number> = {
  1: 30,   // 20 * 1 * 1.5
  2: 60,   // 20 * 2 * 1.5
  3: 90,   // 20 * 3 * 1.5
  4: 120,  // 20 * 4 * 1.5
  5: 150,  // 20 * 5 * 1.5
};

// Duration by level (matches drillsData.ts: 5 + level * 2)
const DRILL_DURATION_BY_LEVEL: Record<number, number> = {
  1: 7,   // 5 + 1 * 2
  2: 9,   // 5 + 2 * 2
  3: 11,  // 5 + 3 * 2
  4: 13,  // 5 + 4 * 2
  5: 15,  // 5 + 5 * 2
};

// Default values for unknown drills
const DEFAULT_XP = 30;
const DEFAULT_DURATION = 7;

// Extract drill level from drill ID (format: sport-category-drillNum-level-X)
function getDrillLevel(drillId: string): number {
  const levelMatch = drillId.match(/-level-(\d+)$/);
  if (levelMatch) {
    const level = parseInt(levelMatch[1], 10);
    if (level >= 1 && level <= 5) {
      return level;
    }
  }
  return 1; // Default to level 1
}

// Calculate XP server-side based on drill ID
function calculateDrillXp(drillId: string): number {
  const level = getDrillLevel(drillId);
  return DRILL_XP_BY_LEVEL[level] ?? DEFAULT_XP;
}

// Calculate duration server-side based on drill ID
function calculateDrillDuration(drillId: string): number {
  const level = getDrillLevel(drillId);
  return DRILL_DURATION_BY_LEVEL[level] ?? DEFAULT_DURATION;
}

interface CompleteDrillRequest {
  drillId: string;
  sport: string;
}

interface Challenge {
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
}

// Simple logging helper
function logStep(step: string, details?: unknown) {
  console.log(`[complete-drill] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("Missing or invalid auth header");
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body: CompleteDrillRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { drillId, sport } = body;

    // Validate required fields
    if (!drillId || typeof drillId !== "string" || drillId.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid drill ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sport || typeof sport !== "string" || sport.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid sport" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate XP and duration server-side based on drill ID
    const xpEarned = calculateDrillXp(drillId);
    const durationMinutes = calculateDrillDuration(drillId);
    
    logStep("Server-calculated drill metrics", { drillId, xpEarned, durationMinutes, level: getDrillLevel(drillId) });

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      logStep("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      logStep("Invalid user auth", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Create admin client for checking subscription and updating data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if user has a subscription
    let hasSubscription = false;

    // Check for test accounts with paid access
    const testAccountsEnv = Deno.env.get("TEST_ACCOUNTS_WITH_PAID_ACCESS") ?? "";
    const testAccounts = testAccountsEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
    if (user.email && testAccounts.includes(user.email.toLowerCase())) {
      logStep("User is a test account with paid access");
      hasSubscription = true;
    }

    // Check Stripe subscription if not a test account
    if (!hasSubscription && stripeSecretKey && user.email) {
      try {
        // Search for customer by email in Stripe
        const customerSearchResponse = await fetch(
          `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(user.email)}'`,
          {
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
            },
          }
        );

        if (customerSearchResponse.ok) {
          const customerData = await customerSearchResponse.json();
          if (customerData.data && customerData.data.length > 0) {
            const customerId = customerData.data[0].id;

            // Check for active subscriptions
            const subscriptionsResponse = await fetch(
              `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`,
              {
                headers: {
                  Authorization: `Bearer ${stripeSecretKey}`,
                },
              }
            );

            if (subscriptionsResponse.ok) {
              const subscriptionsData = await subscriptionsResponse.json();
              if (subscriptionsData.data && subscriptionsData.data.length > 0) {
                hasSubscription = true;
                logStep("User has active Stripe subscription");
              }
            }
          }
        }
      } catch (stripeError) {
        logStep("Error checking Stripe subscription", { error: String(stripeError) });
        // Continue without subscription - will enforce free limit
      }
    }

    // ============================================================
    // CHALLENGE DETECTION: Check if this drill is part of an active challenge
    // ============================================================
    const { data: activeChallenge, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("drill_id", drillId)
      .eq("status", "accepted")
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (challengeError) {
      logStep("Error checking for active challenge", { error: challengeError.message });
      // Don't fail - continue with normal drill completion
    }

    const isChallengeDrill = !!activeChallenge;
    let challengeResult: { submitted: boolean; completed: boolean; won: boolean | null } | null = null;

    if (isChallengeDrill) {
      logStep("Active challenge found for drill", { 
        challengeId: activeChallenge.id, 
        drillId,
        challenger: activeChallenge.challenger_id,
        challenged: activeChallenge.challenged_id
      });

      // Check if user already submitted a score for this challenge
      const isChallenger = activeChallenge.challenger_id === user.id;
      const hasAlreadySubmitted = isChallenger 
        ? activeChallenge.challenger_score !== null 
        : activeChallenge.challenged_score !== null;

      if (hasAlreadySubmitted) {
        logStep("User already submitted score for this challenge");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "You have already submitted your score for this challenge",
            isChallenge: true,
            alreadySubmitted: true
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ============================================================
    // FREE DRILL LIMIT CHECK (applies to both regular and challenge drills)
    // ============================================================
    if (!hasSubscription) {
      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Count drills completed today (from completed_drills table)
      const { count: todayDrillCount, error: countError } = await supabaseAdmin
        .from("completed_drills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", todayStart.toISOString())
        .lt("completed_at", todayEnd.toISOString());

      if (countError) {
        logStep("Error counting today's drills", { error: countError.message });
        return new Response(
          JSON.stringify({ error: "Failed to check drill limit" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Also count challenge drill completions today (from challenges table)
      const { count: todayChallengeCount, error: challengeCountError } = await supabaseAdmin
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .or(`and(challenger_id.eq.${user.id},challenger_score.not.is.null),and(challenged_id.eq.${user.id},challenged_score.not.is.null)`)
        .gte("created_at", todayStart.toISOString())
        .lt("created_at", todayEnd.toISOString());

      const completedToday = (todayDrillCount ?? 0) + (todayChallengeCount ?? 0);
      logStep("Free user drill count check", { 
        regularDrills: todayDrillCount ?? 0, 
        challengeDrills: todayChallengeCount ?? 0,
        total: completedToday, 
        limit: FREE_DRILL_LIMIT 
      });

      if (completedToday >= FREE_DRILL_LIMIT) {
        return new Response(
          JSON.stringify({ 
            error: "Daily free drill limit reached", 
            code: "DRILL_LIMIT_REACHED",
            limit: FREE_DRILL_LIMIT,
            completedToday 
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ============================================================
    // CHALLENGE DRILL PATH: Submit score, update daily progress, but DON'T affect tree
    // ============================================================
    if (isChallengeDrill && activeChallenge) {
      const isChallenger = activeChallenge.challenger_id === user.id;
      const score = xpEarned; // Use XP as the score

      // Build update data for challenge
      const updateData: Record<string, unknown> = isChallenger
        ? { challenger_score: score }
        : { challenged_score: score };

      // Check if both scores will be available after this update (to determine winner)
      const otherScore = isChallenger ? activeChallenge.challenged_score : activeChallenge.challenger_score;
      
      challengeResult = {
        submitted: true,
        completed: otherScore !== null,
        won: null
      };

      if (otherScore !== null) {
        // Both players have submitted - determine winner
        const winnerId =
          score > otherScore
            ? user.id
            : score < otherScore
            ? isChallenger
              ? activeChallenge.challenged_id
              : activeChallenge.challenger_id
            : null; // Tie

        updateData.status = "completed";
        updateData.winner_id = winnerId;
        updateData.completed_at = new Date().toISOString();

        challengeResult.won = winnerId === user.id;
        logStep("Challenge completed - winner determined", { 
          winnerId, 
          userScore: score, 
          otherScore,
          isTie: winnerId === null 
        });
      }

      // Update the challenge with the score
      const { error: updateError } = await supabaseAdmin
        .from("challenges")
        .update(updateData)
        .eq("id", activeChallenge.id);

      if (updateError) {
        logStep("Error updating challenge", { error: updateError.message });
        return new Response(
          JSON.stringify({ error: "Failed to submit challenge score" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      logStep("Challenge score submitted successfully", { 
        challengeId: activeChallenge.id, 
        score,
        isChallenger 
      });

      // Update daily progress (challenge drills count toward daily stats)
      const today = new Date().toISOString().split("T")[0];
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
            minutes_completed: existingProgress.minutes_completed + Math.floor(durationMinutes),
            xp_earned: existingProgress.xp_earned + Math.floor(xpEarned),
            drills_completed: existingProgress.drills_completed + 1,
          })
          .eq("id", existingProgress.id);
      } else {
        await supabaseAdmin.from("daily_progress").insert({
          user_id: user.id,
          date: today,
          minutes_completed: Math.floor(durationMinutes),
          xp_earned: Math.floor(xpEarned),
          drills_completed: 1,
        });
      }

      // Update profile total XP (but NOT streak - that's based on actual training)
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabaseAdmin
          .from("profiles")
          .update({
            total_xp: profile.total_xp + Math.floor(xpEarned),
          })
          .eq("id", user.id);
      }

      // NOTE: We deliberately do NOT insert into completed_drills for challenge drills
      // This ensures challenge drills don't affect the drill tree/level progression

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: challengeResult.completed 
            ? `Challenge completed! ${challengeResult.won === true ? "You won!" : challengeResult.won === false ? "You lost." : "It's a tie!"}`
            : "Challenge score submitted! Waiting for opponent.",
          isChallenge: true,
          challengeCompleted: challengeResult.completed,
          won: challengeResult.won,
          xpEarned: Math.floor(xpEarned),
          hasSubscription
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================================
    // REGULAR DRILL PATH: Full completion with tree progression
    // ============================================================
    
    // Check if drill was already completed by this user
    const { data: existingDrill, error: existingError } = await supabaseAdmin
      .from("completed_drills")
      .select("id")
      .eq("user_id", user.id)
      .eq("drill_id", drillId)
      .maybeSingle();

    if (existingError) {
      logStep("Error checking existing drill", { error: existingError.message });
      return new Response(
        JSON.stringify({ error: "Failed to check drill status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingDrill) {
      logStep("Drill already completed by user");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Drill already completed",
          alreadyCompleted: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All validations passed - complete the drill
    const today = new Date().toISOString().split("T")[0];

    // Record completed drill (this affects tree/level progression)
    const { error: insertError } = await supabaseAdmin
      .from("completed_drills")
      .insert({
        user_id: user.id,
        sport,
        drill_id: drillId,
        duration_minutes: Math.floor(durationMinutes),
        xp_earned: Math.floor(xpEarned),
        completed_at: new Date().toISOString(),
      });

    if (insertError) {
      logStep("Error inserting completed drill", { error: insertError.message });
      return new Response(
        JSON.stringify({ error: "Failed to record drill completion" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update daily progress
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
          minutes_completed: existingProgress.minutes_completed + Math.floor(durationMinutes),
          xp_earned: existingProgress.xp_earned + Math.floor(xpEarned),
          drills_completed: existingProgress.drills_completed + 1,
        })
        .eq("id", existingProgress.id);
    } else {
      await supabaseAdmin.from("daily_progress").insert({
        user_id: user.id,
        date: today,
        minutes_completed: Math.floor(durationMinutes),
        xp_earned: Math.floor(xpEarned),
        drills_completed: 1,
      });
    }

    // Update profile total XP and streak
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_xp, current_streak, longest_streak")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newStreak = profile.current_streak + (existingProgress ? 0 : 1);
      await supabaseAdmin
        .from("profiles")
        .update({
          total_xp: profile.total_xp + Math.floor(xpEarned),
          current_streak: newStreak,
          longest_streak: Math.max(profile.longest_streak, newStreak),
        })
        .eq("id", user.id);
    }

    logStep("Drill completed successfully", { drillId, xpEarned });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Drill completed successfully",
        xpEarned: Math.floor(xpEarned),
        hasSubscription
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Unexpected error", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
