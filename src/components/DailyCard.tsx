import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressRing from "@/components/ProgressRing";
import CompletionModal from "@/components/CompletionModal";
import { trackEvent } from "@/services/analytics";
import type { DrillOutcome } from "@/types/dailyHabit";
import { useDailyHabitSession } from "@/hooks/useDailyHabitSession";

type Props = {
  userId: string;
  defaultCategory?: string;
  onNavigateToSession?: (drillId?: string) => void;
};

export default function DailyCard({ userId, defaultCategory = "shooting", onNavigateToSession }: Props) {
  const {
    beginSession,
    finishSession,
    assignedDrill,
    completion,
    ctaVariant,
    flags,
    starting,
    completing,
    streakState,
  } = useDailyHabitSession(userId, defaultCategory);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<DrillOutcome | undefined>(undefined);

  const progress = useMemo(() => {
    if (!assignedDrill) {
      return 0;
    }
    return Math.min(100, Math.max(15, Math.round((assignedDrill.difficultyScore / 100) * 100)));
  }, [assignedDrill]);

  useEffect(() => {
    trackEvent("home_daily_card_view", { category: defaultCategory }, userId);
  }, [defaultCategory, userId]);

  if (!flags.dailyCardEnabled) {
    return null;
  }

  const handleStart = async () => {
    const response = await beginSession({
      category: defaultCategory,
      duration: 10,
      difficulty: "medium",
      adaptiveEnabled: flags.adaptiveEnabled,
    });
    trackEvent("home_cta_click", { category: defaultCategory, ctaVariant: ctaVariant.id }, userId);
    onNavigateToSession?.(response.assignedDrill?.id);
  };

  const handleComplete = async (outcome: DrillOutcome) => {
    if (!assignedDrill) return;

    trackEvent("drill_attempt", {
      drillId: assignedDrill.id,
      category: assignedDrill.category,
      outcome,
    }, userId);

    const result = await finishSession({
      durationMinutes: assignedDrill.content.durationMinutes,
      xpEarned: 25,
      completed: true,
      drillId: assignedDrill.id,
      drillOutcome: outcome,
    });

    if (result) {
      setLastOutcome(outcome);
      setCompletionOpen(true);
    }
  };

  return (
    <Card className="text-left" aria-label="Daily home card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Daily Habit
        </CardTitle>
        <CardDescription>One focused drill. One tap to start.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Current streak</div>
            <div className="text-lg font-bold text-streak">{streakState.current} days</div>
          </div>
          <ProgressRing progress={progress} size={86} stroke={8} label="Readiness" animate />
        </div>

        <div className="rounded-xl border bg-card p-3">
          <div className="text-xs uppercase text-muted-foreground">Assigned drill</div>
          {assignedDrill ? (
            <>
              <div className="mt-1 font-semibold text-foreground">{assignedDrill.title}</div>
              <div className="text-sm text-muted-foreground">{assignedDrill.content.summary}</div>
              <div className="mt-2 text-xs text-muted-foreground">Difficulty {assignedDrill.difficultyScore}/100 • {assignedDrill.category}</div>
            </>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">Tap start to get your personalized drill.</div>
          )}
        </div>

        <Button
          onClick={handleStart}
          disabled={starting}
          className="w-full"
          aria-label="Start daily session"
        >
          {starting ? "Assigning drill..." : ctaVariant.text}
          <ArrowRight className="h-4 w-4" />
        </Button>

        {assignedDrill ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => handleComplete("partial")}
              disabled={completing}
              aria-label="Complete session with partial outcome"
            >
              Mark Partial
            </Button>
            <Button
              onClick={() => handleComplete("success")}
              disabled={completing}
              aria-label="Complete session successfully"
            >
              Complete
              <CircleCheck className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <a href="/drills" className="inline-block text-sm text-primary underline" aria-label="Show drill alternatives">
          Show alternatives
        </a>

        <CompletionModal
          open={completionOpen}
          onOpenChange={setCompletionOpen}
          result={completion}
          drillOutcome={lastOutcome}
          showConfetti={flags.confettiEnabled}
        />
      </CardContent>
    </Card>
  );
}
