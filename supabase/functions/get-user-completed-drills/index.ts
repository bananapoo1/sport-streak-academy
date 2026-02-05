import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(step: string, details?: unknown) {
  console.log(`[get-user-completed-drills] ${step}`, details ? JSON.stringify(details) : "");
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

    const url = new URL(req.url);
    const date = url.searchParams.get("date"); // Optional: YYYY-MM-DD format
    const sport = url.searchParams.get("sport"); // Optional

    log("Fetching completed drills", { date, sport });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
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

    // Build query
    let query = supabaseAdmin
      .from("completed_drills")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (date) {
      // Filter by specific date
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte("completed_at", startOfDay).lte("completed_at", endOfDay);
    }

    if (sport) {
      query = query.eq("sport", sport);
    }

    const { data: completedDrills, error: completedError } = await query.limit(100);

    if (completedError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch completed drills" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get drill details for enrichment
    const drillIds = [...new Set(completedDrills?.map(c => c.drill_id) || [])];
    
    let drillDetails: Record<string, unknown> = {};
    if (drillIds.length > 0) {
      const { data: drills } = await supabaseAdmin
        .from("drills")
        .select("id, title, category, category_name, level")
        .in("id", drillIds);

      drills?.forEach(d => {
        drillDetails[d.id] = d;
      });
    }

    // Enrich completed drills with drill details
    const enrichedDrills = completedDrills?.map(c => ({
      id: c.id,
      drill_id: c.drill_id,
      sport: c.sport,
      completed_at: c.completed_at,
      duration_minutes: c.duration_minutes,
      xp_earned: c.xp_earned,
      score_data: c.score_data,
      drill: drillDetails[c.drill_id] || null
    })) || [];

    // Also get daily summary if date provided
    let dailySummary = null;
    if (date) {
      const { data: progress } = await supabaseAdmin
        .from("daily_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();

      if (progress) {
        dailySummary = {
          date: progress.date,
          minutes_completed: progress.minutes_completed,
          xp_earned: progress.xp_earned,
          drills_completed: progress.drills_completed,
          goal_minutes: progress.goal_minutes
        };
      }
    }

    log("Returning completed drills", { count: enrichedDrills.length });

    return new Response(
      JSON.stringify({
        completed_drills: enrichedDrills,
        total: enrichedDrills.length,
        daily_summary: dailySummary
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[get-user-completed-drills] Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
