import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free users can only complete 1 drill per day
const FREE_DRILL_LIMIT = 1;

// Maximum allowed duration for any drill (in minutes)
const MAX_DURATION = 120;
const MIN_DURATION = 1;

// Maximum XP per drill
const MAX_XP = 500;
const MIN_XP = 0;

interface CompleteDrillRequest {
  drillId: string;
  sport: string;
  durationMinutes: number;
  xpEarned: number;
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

    const { drillId, sport, durationMinutes, xpEarned } = body;

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

    if (typeof durationMinutes !== "number" || isNaN(durationMinutes)) {
      return new Response(
        JSON.stringify({ error: "Duration must be a valid number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (durationMinutes < MIN_DURATION || durationMinutes > MAX_DURATION) {
      return new Response(
        JSON.stringify({ error: `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof xpEarned !== "number" || isNaN(xpEarned)) {
      return new Response(
        JSON.stringify({ error: "XP must be a valid number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (xpEarned < MIN_XP || xpEarned > MAX_XP) {
      return new Response(
        JSON.stringify({ error: `XP must be between ${MIN_XP} and ${MAX_XP}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Check free drill limit if user doesn't have a subscription
    if (!hasSubscription) {
      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Count drills completed today
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

      const completedToday = todayDrillCount ?? 0;
      logStep("Free user drill count check", { completedToday, limit: FREE_DRILL_LIMIT });

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

    // Record completed drill
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
