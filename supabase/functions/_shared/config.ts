// ============================================================
// SHARED CONFIG & LOGGING UTILITIES FOR EDGE FUNCTIONS
// ============================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// ============================================================
// TYPES
// ============================================================
export interface AppConfig {
  DAILY_GOAL_MINUTES: number;
  FREE_DRILL_LIMIT_PER_DAY: number;
  XP_MULTIPLIER: number;
  CHALLENGE_XP_BONUS: number;
  STREAK_FREEZE_MAX: number;
  MIN_SCORE: number;
  MAX_SCORE: number;
}

export interface LogMetrics {
  duration_ms?: number;
  user_id?: string;
  drill_id?: string;
  challenge_id?: string;
  xp_earned?: number;
  error_code?: string;
  subscription_type?: string;
  [key: string]: unknown;
}

// ============================================================
// DEFAULT CONFIG (fallback if DB fetch fails)
// ============================================================
const DEFAULT_CONFIG: AppConfig = {
  DAILY_GOAL_MINUTES: 30,
  FREE_DRILL_LIMIT_PER_DAY: 1,
  XP_MULTIPLIER: 1,
  CHALLENGE_XP_BONUS: 50,
  STREAK_FREEZE_MAX: 3,
  MIN_SCORE: 0,
  MAX_SCORE: 1000,
};

// ============================================================
// CONFIG CACHE (simple in-memory cache with TTL)
// ============================================================
let cachedConfig: AppConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// ============================================================
// FETCH CONFIG FROM DATABASE
// ============================================================
export async function getAppConfig(supabaseAdmin: unknown): Promise<AppConfig> {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const client = supabaseAdmin as SupabaseClient;
    const { data, error } = await client
      .from("app_config")
      .select("key, value");

    if (error) {
      console.error("[config] Failed to fetch app_config:", error);
      return cachedConfig || DEFAULT_CONFIG;
    }

    if (!data || data.length === 0) {
      console.warn("[config] No config found in app_config table, using defaults");
      return DEFAULT_CONFIG;
    }

    // Build config object from rows
    const config: AppConfig = { ...DEFAULT_CONFIG };
    
    for (const row of data) {
      const key = row.key as keyof AppConfig;
      if (key in config) {
        const value = typeof row.value === "string" ? parseFloat(row.value) : row.value;
        if (!isNaN(value)) {
          (config as unknown as Record<string, number>)[key] = value;
        }
      }
    }

    // Update cache
    cachedConfig = config;
    cacheTimestamp = now;

    console.log("[config] Loaded config from DB:", JSON.stringify(config));
    return config;

  } catch (err) {
    console.error("[config] Unexpected error fetching config:", err);
    return cachedConfig || DEFAULT_CONFIG;
  }
}

// ============================================================
// STRUCTURED LOGGER
// ============================================================
export class Logger {
  private functionName: string;
  private requestId: string;
  private startTime: number;

  constructor(functionName: string) {
    this.functionName = functionName;
    this.requestId = crypto.randomUUID().slice(0, 8);
    this.startTime = Date.now();
  }

  private formatMessage(level: string, step: string, metrics?: LogMetrics): string {
    const elapsed = Date.now() - this.startTime;
    const baseLog = {
      fn: this.functionName,
      req_id: this.requestId,
      level,
      step,
      elapsed_ms: elapsed,
      ts: new Date().toISOString(),
      ...metrics,
    };
    return JSON.stringify(baseLog);
  }

  info(step: string, metrics?: LogMetrics): void {
    console.log(this.formatMessage("INFO", step, metrics));
  }

  warn(step: string, metrics?: LogMetrics): void {
    console.warn(this.formatMessage("WARN", step, metrics));
  }

  error(step: string, error?: unknown, metrics?: LogMetrics): void {
    const errorInfo = error instanceof Error 
      ? { error_message: error.message, error_stack: error.stack?.slice(0, 500) }
      : { error_raw: String(error) };
    console.error(this.formatMessage("ERROR", step, { ...metrics, ...errorInfo }));
  }

  // Convenience method to log request start
  requestStart(method: string, path: string, params?: Record<string, unknown>): void {
    this.info("request_start", { method, path, params });
  }

  // Convenience method to log request end with duration
  requestEnd(statusCode: number, metrics?: LogMetrics): void {
    const duration_ms = Date.now() - this.startTime;
    this.info("request_end", { status_code: statusCode, duration_ms, ...metrics });
  }

  // Log database operation
  dbOperation(operation: string, table: string, metrics?: LogMetrics): void {
    this.info(`db_${operation}`, { table, ...metrics });
  }

  // Log external API call
  apiCall(service: string, operation: string, metrics?: LogMetrics): void {
    this.info("api_call", { service, operation, ...metrics });
  }

  // Log business logic event
  event(eventName: string, metrics?: LogMetrics): void {
    this.info(`event_${eventName}`, metrics);
  }

  getRequestId(): string {
    return this.requestId;
  }

  getElapsedMs(): number {
    return Date.now() - this.startTime;
  }
}

// ============================================================
// CORS HEADERS
// ============================================================
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// SUPABASE CLIENT FACTORY
// ============================================================
export function createSupabaseClients(authHeader: string | null): {
  supabaseWithAuth: SupabaseClient;
  supabaseAdmin: SupabaseClient;
  error?: string;
} {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return {
      supabaseWithAuth: null as unknown as SupabaseClient,
      supabaseAdmin: null as unknown as SupabaseClient,
      error: "Server configuration error: Missing Supabase credentials",
    };
  }

  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  return { supabaseWithAuth, supabaseAdmin };
}

// ============================================================
// RESPONSE HELPERS
// ============================================================
export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status: number = 400, code?: string, details?: Record<string, unknown>): Response {
  return new Response(
    JSON.stringify({ error: message, code, ...(details || {}) }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

export function optionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}
