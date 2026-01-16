import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Maximum allowed score for any challenge drill
const MAX_SCORE = 100;
const MIN_SCORE = 0;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { challengeId, score } = body;

    // Validate required fields
    if (!challengeId || typeof challengeId !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid challenge ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate score is a number within valid range
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

    // Ensure score is an integer
    const validatedScore = Math.floor(score);

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the challenge to validate
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: "Challenge not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is part of this challenge
    const isChallenger = challenge.challenger_id === user.id;
    const isChallenged = challenge.challenged_id === user.id;

    if (!isChallenger && !isChallenged) {
      return new Response(
        JSON.stringify({ error: "You are not part of this challenge" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify challenge is in accepted status
    if (challenge.status !== "accepted") {
      return new Response(
        JSON.stringify({ error: "Challenge is not in accepted status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already submitted a score
    if (isChallenger && challenge.challenger_score !== null) {
      return new Response(
        JSON.stringify({ error: "You have already submitted a score for this challenge" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isChallenged && challenge.challenged_score !== null) {
      return new Response(
        JSON.stringify({ error: "You have already submitted a score for this challenge" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = isChallenger
      ? { challenger_score: validatedScore }
      : { challenged_score: validatedScore };

    // Check if both scores will be available after this update
    const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
    if (otherScore !== null) {
      // Determine winner
      const winnerId =
        validatedScore > otherScore
          ? user.id
          : validatedScore < otherScore
          ? isChallenger
            ? challenge.challenged_id
            : challenge.challenger_id
          : null; // Tie

      updateData.status = "completed";
      updateData.winner_id = winnerId;
      updateData.completed_at = new Date().toISOString();
    }

    // Update the challenge
    const { error: updateError } = await supabase
      .from("challenges")
      .update(updateData)
      .eq("id", challengeId);

    if (updateError) {
      console.error("Error updating challenge:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to submit score" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: otherScore !== null ? "Challenge completed!" : "Score submitted successfully",
        completed: otherScore !== null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in submit-challenge-score:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
