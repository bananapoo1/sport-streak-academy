import { useMemo, useState } from "react";
import { completeSession, startSession } from "@/services/drillAssignment";
import { getCtaVariant, isFeatureEnabled } from "@/services/featureFlags";
import type { Drill, DrillOutcome, SessionCompleteResponse, SessionStartResponse, XPState, StreakState } from "@/types/dailyHabit";

const defaultXpState: XPState = { xp: 0, level: 1, xpToNextLevel: 250 };
const defaultStreak: StreakState = { current: 0, longest: 0, lastActiveISO: null, freezeTokens: 0 };

export function useDailyHabitSession(userId: string, defaultCategory = "shooting") {
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [session, setSession] = useState<SessionStartResponse | null>(null);
  const [xpState, setXpState] = useState<XPState>(defaultXpState);
  const [streakState, setStreakState] = useState<StreakState>(defaultStreak);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [completion, setCompletion] = useState<SessionCompleteResponse | null>(null);

  const ctaVariant = useMemo(() => getCtaVariant(userId), [userId]);
  const flags = useMemo(() => ({
    dailyCardEnabled: isFeatureEnabled("daily_card_v2", userId),
    adaptiveEnabled: isFeatureEnabled("adaptive_assignment", userId),
    confettiEnabled: isFeatureEnabled("celebration_confetti", userId),
  }), [userId]);

  async function beginSession(
    options?: {
      duration?: number;
      difficulty?: "easy" | "medium" | "hard";
      category?: string;
      adaptiveEnabled?: boolean;
    },
  ) {
    setStarting(true);
    try {
      if (options?.adaptiveEnabled === false) {
        const fallback: SessionStartResponse = {
          sessionId: `session_static_${Math.random().toString(36).slice(2, 10)}`,
          assignedDrill: {
            id: `${defaultCategory}_fallback_1`,
            title: `${defaultCategory[0].toUpperCase()}${defaultCategory.slice(1)} Foundations`,
            category: defaultCategory,
            difficultyScore: 30,
            content: {
              summary: "Foundational technique set for consistency and confidence.",
              durationMinutes: options?.duration ?? 10,
            },
            tags: ["fundamentals"],
          },
        };

        setSession(fallback);
        setCompletion(null);
        return fallback;
      }

      const response = await startSession({
        userId,
        dateISO: new Date().toISOString(),
        suggestedDuration: options?.duration ?? 10,
        difficulty: options?.difficulty ?? "medium",
        category: options?.category ?? defaultCategory,
      });

      setSession(response);
      setCompletion(null);
      return response;
    } finally {
      setStarting(false);
    }
  }

  async function finishSession(params: {
    durationMinutes: number;
    xpEarned: number;
    completed: boolean;
    drillId?: string;
    drillOutcome?: DrillOutcome;
    confidenceAfter?: number;
  }) {
    if (!session?.sessionId) {
      throw new Error("No active session");
    }

    setCompleting(true);
    try {
      const response = await completeSession({
        sessionId: session.sessionId,
        ...params,
      });

      setXpState(response.xpState);
      setStreakState(response.streakState);
      setConfidence(response.updatedCategoryConfidence);
      setCompletion(response);
      return response;
    } finally {
      setCompleting(false);
    }
  }

  return {
    starting,
    completing,
    session,
    assignedDrill: session?.assignedDrill as Drill | undefined,
    xpState,
    streakState,
    confidence,
    completion,
    ctaVariant,
    flags,
    beginSession,
    finishSession,
  };
}
