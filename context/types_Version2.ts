export type UserId = string;

export interface Streak {
  current: number;
  lastActiveISO: string | null;
  freezeTokens: number;
}

export interface XPState {
  xp: number;
  level: number;
  xpToNextLevel: number;
}

export interface DailyCardState {
  dateISO: string;
  completed: boolean;
  progressPercent: number;
  suggestedDurationMinutes: number;
  difficulty: "easy"|"medium"|"hard";
  assignedDrillId?: string;
}

export interface SessionResult {
  userId: UserId;
  dateISO: string;
  durationMinutes: number;
  xpEarned: number;
  streakExtended: boolean;
  newStreakCount: number;
  drillId?: string;
  drillOutcome?: "success"|"partial"|"fail";
  confidenceAfter?: number; // 0-1
}

export interface Drill {
  id: string;
  title: string;
  category: string;
  difficultyScore: number; // e.g., 0..100
  content: any; // instructions / payload, opaque to engine
  tags?: string[];
}