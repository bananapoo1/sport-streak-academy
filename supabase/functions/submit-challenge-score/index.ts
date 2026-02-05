import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHALLENGE_XP_BONUS = 50;
const MAX_SCORE = 10000;
const MIN_SCORE = 0;

function log(step: string, details?: unknown) {
  console.log(`[submit-challenge-score] ${step}`, details ? JSON.stringify(details) : "");
}

function logError(step: string, error: unknown) {
  console.error(`[submit-challenge-score] ERROR - ${step}`, error);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { challenge_id, score, score_data } = body;

    // Validate inputs
    if (!challenge_id || typeof challenge_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid challenge_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof score !== "number" || isNaN(score)) {
      return new Response(
        JSON.stringify({ error: "Score must be a valid number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (score < MIN_SCORE || score > MAX_SCORE) {
      return new Response(
        JSON.stringify({ error: `Score must be between ${MIN_SCORE} and ${MAX_SCORE}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedScore = Math.floor(score);

    log("Processing score submission", { challenge_id, score: validatedScore });

    // Setup Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

    // Verify user
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("User authenticated", { userId: user.id });

    // Fetch challenge
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("id", challenge_id)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: "Challenge not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is part of challenge
    const isChallenger = challenge.challenger_id === user.id;
    const isChallenged = challenge.challenged_id === user.id;

    if (!isChallenger && !isChallenged) {
      return new Response(
        JSON.stringify({ error: "You are not part of this challenge" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify challenge status
    if (challenge.status !== "accepted") {
      return new Response(
        JSON.stringify({ error: "Challenge is not in accepted status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already submitted
    if (isChallenger && challenge.challenger_score !== null) {
      return new Response(
        JSON.stringify({ error: "You have already submitted a score" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isChallenged && challenge.challenged_score !== null) {
      return new Response(
        JSON.stringify({ error: "You have already submitted a score" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = isChallenger
      ? { challenger_score: validatedScore }
      : { challenged_score: validatedScore };

    const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
    let completed = false;
    let won: boolean | null = null;
    let winnerId: string | null = null;
    let bonusXp = 0;

    if (otherScore !== null) {
      // Both scores present - determine winner
      winnerId = validatedScore > otherScore
        ? user.id
        : validatedScore < otherScore
          ? (isChallenger ? challenge.challenged_id : challenge.challenger_id)
          : null;

      updateData.status = "completed";
      updateData.winner_id = winnerId;
      updateData.completed_at = new Date().toISOString();

      completed = true;
      won = winnerId === user.id;
      
      if (won) {
        bonusXp = challenge.xp_bonus || CHALLENGE_XP_BONUS;
      }

      log("Challenge completed", { winnerId, validatedScore, otherScore, won });
    }

    // Update challenge
    const { error: updateError } = await supabaseAdmin
      .from("challenges")
      .update(updateData)
      .eq("id", challenge_id);

    if (updateError) {
      logError("Updating challenge", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to submit score" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Award XP bonus to winner
    if (completed && won && bonusXp > 0) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabaseAdmin
          .from("profiles")
          .update({ total_xp: (profile.total_xp ?? 0) + bonusXp })
          .eq("id", user.id);

        log("Awarded bonus XP", { userId: user.id, bonusXp });
      }
    }

    log("Score submitted successfully", { challenge_id, score: validatedScore, completed, won });

    return new Response(
      JSON.stringify({
        success: true,
        message: completed
          ? (won === true ? "You won the challenge!" : won === false ? "Challenge complete - opponent won." : "It's a tie!")
          : "Score submitted successfully. Waiting for opponent.",
        completed,
        won,
        winner_id: winnerId,
        bonus_xp: bonusXp
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
