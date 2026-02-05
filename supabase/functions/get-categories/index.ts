import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(step: string, details?: unknown) {
  console.log(`[get-categories] ${step}`, details ? JSON.stringify(details) : "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sport = url.searchParams.get("sport");

    log("Fetching categories", { sport });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch categories
    let query = supabaseAdmin
      .from("drill_categories")
      .select("*")
      .order("name");

    if (sport) {
      query = query.eq("sport", sport);
    }

    const { data: categories, error: categoriesError } = await query;

    if (categoriesError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch categories" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also get drill counts per category
    const { data: drills } = await supabaseAdmin
      .from("drills")
      .select("category, level")
      .eq("sport", sport || "");

    // Calculate level map with boss markers (every 10 levels)
    const categoriesWithLevelMap = categories?.map(cat => {
      const categoryDrills = drills?.filter(d => d.category === cat.id) || [];
      const maxLevel = Math.max(...categoryDrills.map(d => d.level), 0);
      const drillCount = categoryDrills.length;
      
      // Generate level map
      const levels = [];
      for (let i = 1; i <= cat.levels; i++) {
        const drillsAtLevel = categoryDrills.filter(d => d.level === i).length;
        levels.push({
          level: i,
          drill_count: drillsAtLevel,
          is_boss_level: i % 10 === 0
        });
      }

      return {
        id: cat.id,
        sport: cat.sport,
        name: cat.name,
        total_levels: cat.levels,
        drills_per_level: cat.drills_per_level,
        total_drills: drillCount,
        max_level_with_drills: maxLevel,
        level_map: levels
      };
    }) || [];

    log("Returning categories", { count: categoriesWithLevelMap.length });

    return new Response(
      JSON.stringify({ 
        categories: categoriesWithLevelMap,
        total: categoriesWithLevelMap.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[get-categories] Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
