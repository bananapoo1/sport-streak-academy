export type EventName =
  | "home_daily_card_view"
  | "home_cta_click"
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

export interface AnalyticsEvent {
  name: EventName;
  userId?: string;
  timestampISO: string;
  properties?: Record<string, any>;
}