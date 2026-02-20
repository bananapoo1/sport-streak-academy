import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ClientErrorEvent = {
  message: string;
  stack?: string;
  timestampISO?: string;
  level?: "error" | "fatal";
  source?: string;
  context?: Record<string, unknown>;
};

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null) as { events?: ClientErrorEvent[] } | null;
    const events = body?.events;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return badRequest("events[] is required");
    }

    const acceptedEvents = events.slice(0, 50);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await supabaseWithAuth.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const insertRows = acceptedEvents
      .filter((event) => typeof event?.message === "string" && event.message.length > 0)
      .map((event) => ({
        user_id: userId,
        message: event.message.slice(0, 2000),
        stack: event.stack?.slice(0, 10000) ?? null,
        level: event.level === "fatal" ? "fatal" : "error",
        source: event.source?.slice(0, 255) ?? null,
        context: event.context ?? {},
        occurred_at: event.timestampISO ?? new Date().toISOString(),
        user_agent: req.headers.get("user-agent"),
      }));

    if (insertRows.length === 0) {
      return badRequest("No valid events to insert");
    }

    const { error } = await supabaseAdmin.from("client_error_reports").insert(insertRows);

    if (error) {
      console.error("[report-client-error] insert failed", error);
      return new Response(JSON.stringify({ error: "Failed to store events" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, accepted: insertRows.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[report-client-error] unexpected error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
