export interface UserCategoryState {
  category: string;
  confidence: number; // 0..1
  lastPracticedISO?: string;
  recentSuccessRate?: number; // 0..1 computed over N attempts
}

export interface AssignResponse {
  drill: Drill;
  meta: {
    confidenceBefore: number;
    dTarget: number;
    isReinforcement: boolean;
    reason: string;
  };
}