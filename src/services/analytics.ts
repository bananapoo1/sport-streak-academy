export type EventName =
  | "home_daily_card_view"
  | "home_cta_click"
  | "onboarding_completed"
  | "session_start"
  | "session_complete"
  | "drill_assigned"
  | "drill_attempt"
  | "drill_result"
  | "streak_broken"
  | "streak_extended"
  | "xp_awarded"
  | "push_open"
  | "share_click";

interface AnalyticsEvent {
  name: EventName;
  userId?: string;
  timestampISO: string;
  properties?: Record<string, unknown>;
}

const EVENTS_KEY = "ssa.analytics.events";

export function trackEvent(name: EventName, properties?: Record<string, unknown>, userId?: string) {
  const event: AnalyticsEvent = {
    name,
    userId,
    timestampISO: new Date().toISOString(),
    properties,
  };

  const existing = getTrackedEvents();
  const next = [...existing.slice(-99), event];
  localStorage.setItem(EVENTS_KEY, JSON.stringify(next));

  if (import.meta.env.DEV) {
    console.info("[analytics]", event);
  }
}

export function getTrackedEvents(): AnalyticsEvent[] {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

export function clearTrackedEvents() {
  localStorage.removeItem(EVENTS_KEY);
}
