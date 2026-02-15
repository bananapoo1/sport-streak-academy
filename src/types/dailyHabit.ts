export type UserId = string;

export interface StreakState {
  current: number;
  longest: number;
  lastActiveISO: string | null;
  freezeTokens: number;
}

export interface XPState {
  xp: number;
  level: number;
  xpToNextLevel: number;
}

export type DrillOutcome = "success" | "partial" | "fail";

export interface Drill {
  id: string;
  title: string;
  category: string;
  difficultyScore: number;
  content: {
    summary: string;
    durationMinutes: number;
  };
  tags?: string[];
}

export interface UserCategoryState {
  category: string;
  confidence: number;
  lastPracticedISO?: string;
  recentSuccessRate?: number;
}

export interface AssignMeta {
  confidenceBefore: number;
  dTarget: number;
  window: { low: number; high: number };
  isReinforcement: boolean;
  reason: string;
}

export interface AssignResponse {
  drill: Drill;
  meta: AssignMeta;
}

export interface SessionStartRequest {
  userId: UserId;
  dateISO: string;
  suggestedDuration: number;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
}

export interface SessionStartResponse {
  sessionId: string;
  assignedDrill?: Drill;
}

export interface SessionCompleteRequest {
  sessionId: string;
  durationMinutes: number;
  xpEarned: number;
  completed: boolean;
  drillId?: string;
  drillOutcome?: DrillOutcome;
  confidenceAfter?: number;
}

export interface SessionCompleteResponse {
  xpState: XPState;
  streakState: StreakState;
  xpAwarded: number;
  badgesEarned: string[];
  updatedCategoryConfidence?: number;
}

export interface DrillResultRequest {
  userId: UserId;
  drillId: string;
  outcome: DrillOutcome;
  durationMinutes: number;
  confidenceAfter?: number;
}

export interface DrillResultResponse {
  updatedConfidence: number;
  xpAwarded: number;
  streakUpdated: boolean;
}
