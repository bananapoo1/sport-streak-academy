import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(step: string, details?: unknown) {
  console.log(`[get-drill] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const drillId = url.searchParams.get("id");

    if (!drillId) {
      return new Response(
        JSON.stringify({ error: "Missing drill id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("Fetching drill", { drillId });

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

    // Fetch drill
    const { data: drill, error: drillError } = await supabaseAdmin
      .from("drills")
      .select("*")
      .eq("id", drillId)
      .single();

    if (drillError || !drill) {
      return new Response(
        JSON.stringify({ error: "Drill not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to get user for personalized status
    let isCompleted = false;
    let unlockStatus: "locked" | "unlocked" | "completed" = "locked";
    let hasSubscription = false;

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user } } = await supabaseWithAuth.auth.getUser();
      if (user) {
        // Check if completed
        const { data: completed } = await supabaseAdmin
          .from("completed_drills")
          .select("id")
          .eq("user_id", user.id)
          .eq("drill_id", drillId)
          .maybeSingle();

        isCompleted = !!completed;

        // Check subscription
        const testAccountsEnv = Deno.env.get("TEST_ACCOUNTS_WITH_PAID_ACCESS") ?? "";
        const testAccounts = testAccountsEnv.split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
        hasSubscription = user.email ? testAccounts.includes(user.email.toLowerCase()) : false;

        // Determine unlock status
        if (isCompleted) {
          unlockStatus = "completed";
        } else if (hasSubscription) {
          unlockStatus = "unlocked";
        } else if (drill.free && drill.level === 1) {
          unlockStatus = "unlocked";
        } else if (drill.level > 1 && drill.unlock_requires) {
          // Check unlock requirements
          const levelMatch = drill.unlock_requires.match(/complete_any_in_category_level_(\d+)/);
          if (levelMatch) {
            const requiredLevel = parseInt(levelMatch[1], 10);
            
            // Get drills at required level in same category
            const { data: categoryDrills } = await supabaseAdmin
              .from("drills")
              .select("id")
              .eq("category", drill.category)
              .eq("level", requiredLevel);

            if (categoryDrills && categoryDrills.length > 0) {
              const categoryDrillIds = categoryDrills.map(d => d.id);
              
              const { count } = await supabaseAdmin
                .from("completed_drills")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .in("drill_id", categoryDrillIds);

              unlockStatus = (count ?? 0) > 0 ? "unlocked" : "locked";
            }
          }
        }
      }
    } else {
      // No auth - basic unlock status
      unlockStatus = (drill.free && drill.level === 1) ? "unlocked" : "locked";
    }

    log("Returning drill", { drillId, unlockStatus, isCompleted });

    return new Response(
      JSON.stringify({
        drill: {
          id: drill.id,
          sport: drill.sport,
          category: drill.category,
          category_name: drill.category_name,
          level: drill.level,
          title: drill.title,
          description: drill.description,
          duration_minutes: drill.duration_minutes,
          solo_or_duo: drill.solo_or_duo,
          equipment: drill.equipment,
          steps: drill.steps,
          metric: drill.metric,
          xp: drill.xp,
          free: drill.free,
          unlock_requires: drill.unlock_requires,
          unlock_status: unlockStatus,
          is_completed: isCompleted
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[get-drill] Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
