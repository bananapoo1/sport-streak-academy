import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_DRILL_LIMIT_PER_DAY = 1;

function log(step: string, details?: unknown) {
  console.log(`[get-drills] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sport = url.searchParams.get("sport");
    const category = url.searchParams.get("category");
    const level = url.searchParams.get("level");

    log("Fetching drills", { sport, category, level });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Build query
    let query = supabaseAdmin
      .from("drills")
      .select("*")
      .order("category")
      .order("level")
      .order("title");

    if (sport) query = query.eq("sport", sport);
    if (category) query = query.eq("category", category);
    if (level) query = query.eq("level", parseInt(level, 10));

    const { data: drills, error: drillsError } = await query;

    if (drillsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch drills" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to get user for personalized unlock status
    let userId: string | null = null;
    let completedDrillIds: string[] = [];
    let hasSubscription = false;

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user } } = await supabaseWithAuth.auth.getUser();
      if (user) {
        userId = user.id;

        // Fetch completed drills
        const { data: completed } = await supabaseAdmin
          .from("completed_drills")
          .select("drill_id")
          .eq("user_id", userId);

        completedDrillIds = completed?.map(c => c.drill_id) || [];

        // Check subscription (simplified - just check test accounts for now)
        const testAccountsEnv = Deno.env.get("TEST_ACCOUNTS_WITH_PAID_ACCESS") ?? "";
        const testAccounts = testAccountsEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
        hasSubscription = user.email ? testAccounts.includes(user.email.toLowerCase()) : false;
      }
    }

    // Compute unlock status for each drill
    const drillsWithStatus = drills?.map(drill => {
      const isCompleted = completedDrillIds.includes(drill.id);
      
      // Determine unlock status
      let unlock_status: "locked" | "unlocked" | "completed" = "locked";
      
      if (isCompleted) {
        unlock_status = "completed";
      } else if (hasSubscription) {
        unlock_status = "unlocked";
      } else if (drill.free && drill.level === 1) {
        unlock_status = "unlocked";
      } else if (drill.level > 1) {
        // Check if user has completed any drill at previous level in same category
        const previousLevelCompleted = drills?.some(d => 
          d.category === drill.category && 
          d.level === drill.level - 1 &&
          completedDrillIds.includes(d.id)
        );
        unlock_status = previousLevelCompleted ? "unlocked" : "locked";
      }

      return {
        id: drill.id,
        sport: drill.sport,
        category: drill.category,
        category_name: drill.category_name,
        level: drill.level,
        title: drill.title,
        description: drill.description,
        duration_minutes: drill.duration_minutes,
        solo_or_duo: drill.solo_or_duo,
        xp: drill.xp,
        free: drill.free,
        unlock_status,
        is_completed: isCompleted
      };
    }) || [];

    log("Returning drills", { count: drillsWithStatus.length });

    return new Response(
      JSON.stringify({ 
        drills: drillsWithStatus,
        total: drillsWithStatus.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[get-drills] Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
