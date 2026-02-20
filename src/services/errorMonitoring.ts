type ErrorLevel = "error" | "fatal";

interface ErrorReport {
  message: string;
  stack?: string;
  timestampISO: string;
  level: ErrorLevel;
  source?: string;
  context?: Record<string, unknown>;
}

const ERROR_QUEUE_KEY = "ssa.error.queue.v1";
const MAX_QUEUE = 50;
let initialized = false;

function getErrorReportEndpoint() {
  if (import.meta.env.VITE_ERROR_REPORT_ENDPOINT) {
    return import.meta.env.VITE_ERROR_REPORT_ENDPOINT;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    return "";
  }

  return `${supabaseUrl}/functions/v1/report-client-error`;
}

function readQueue(): ErrorReport[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(ERROR_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ErrorReport[];
  } catch {
    return [];
  }
}

function writeQueue(queue: ErrorReport[]) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ERROR_QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
}

function toErrorReport(error: unknown, context?: Record<string, unknown>, source?: string): ErrorReport {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      timestampISO: new Date().toISOString(),
      level: "error",
      source,
      context,
    };
  }

  return {
    message: String(error),
    timestampISO: new Date().toISOString(),
    level: "error",
    source,
    context,
  };
}

export function reportError(error: unknown, context?: Record<string, unknown>, source?: string) {
  const queue = readQueue();
  queue.push(toErrorReport(error, context, source));
  writeQueue(queue);
}

export async function flushErrorQueue() {
  const endpoint = getErrorReportEndpoint();
  if (!endpoint || typeof window === "undefined") {
    return;
  }

  const queue = readQueue();
  if (queue.length === 0) {
    return;
  }

  const payload = JSON.stringify({ events: queue });

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(endpoint, payload);
    if (sent) {
      localStorage.removeItem(ERROR_QUEUE_KEY);
      return;
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });

    if (response.ok) {
      localStorage.removeItem(ERROR_QUEUE_KEY);
    }
  } catch {
    // no-op; retry on next session
  }
}

export function initGlobalErrorMonitoring() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, { filename: event.filename, lineno: event.lineno, colno: event.colno }, "window.error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, undefined, "window.unhandledrejection");
  });

  void flushErrorQueue();
}
