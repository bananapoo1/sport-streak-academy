import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressRing from "@/components/ProgressRing";
import CompletionModal from "@/components/CompletionModal";
import { trackEvent } from "@/services/analytics";
import type { DrillOutcome } from "@/types/dailyHabit";
import { useDailyHabitSession } from "@/hooks/useDailyHabitSession";

type Props = {
  userId: string;
  defaultCategory?: string;
  sport?: string;
  sessionMinutes?: number;
  skillLevel?: string | null;
  goal?: string | null;
  onNavigateToSession?: (drillId?: string) => void;
};

export default function DailyCard({ userId, defaultCategory = "shooting", sport = "football", sessionMinutes = 10, skillLevel = null, goal = null, onNavigateToSession }: Props) {
  const {
    beginSession,
    finishSession,
    session,
    assignedDrill,
    completion,
    ctaVariant,
    flags,
    starting,
    completing,
  } = useDailyHabitSession(userId, defaultCategory);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<DrillOutcome | undefined>(undefined);
  const [selectedOutcome, setSelectedOutcome] = useState<DrillOutcome>("success");

  const progress = useMemo(() => {
    if (!assignedDrill) return 0;
    return Math.min(100, Math.max(15, Math.round((assignedDrill.difficultyScore / 100) * 100)));
  }, [assignedDrill]);

  useEffect(() => {
    trackEvent("home_daily_card_view", { category: defaultCategory }, userId);
  }, [defaultCategory, userId]);

  if (!flags.dailyCardEnabled) {
    return null;
  }

  const handleStart = async () => {
    const difficultyFromSkill =
      skillLevel === "beginner"
        ? "easy"
        : skillLevel === "advanced"
          ? "hard"
          : "medium";

    await beginSession({
      category: defaultCategory,
      duration: sessionMinutes,
      difficulty: difficultyFromSkill,
      adaptiveEnabled: flags.adaptiveEnabled,
      skillLevel,
      goal,
    });
    trackEvent("home_cta_click", { category: defaultCategory, ctaVariant: ctaVariant.id }, userId);
    setSelectedOutcome("success");
  };

  const handleComplete = async (outcome: DrillOutcome) => {
    if (!assignedDrill) return;

    const confidenceAfter =
      outcome === "success"
        ? 0.76
        : outcome === "partial"
          ? 0.52
          : 0.38;

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
      confidenceAfter,
    });

    if (result) {
      setLastOutcome(outcome);
      setCompletionOpen(true);
    }
  };

  return (
    <Card className="text-left overflow-hidden border-2 hover:border-primary/50 transition-colors" aria-label="Daily home card">
      <CardContent className="p-0">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-streak to-xp" />

        <div className="p-4 space-y-4">
          {/* Header row: title + readiness ring */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">Today's Drill</h3>
                <p className="text-xs text-muted-foreground">Personalized for you</p>
              </div>
            </div>
            <ProgressRing progress={progress} size={56} stroke={5} label="" animate />
          </div>

          {/* Drill info or prompt */}
          {assignedDrill ? (
            <div className="rounded-xl bg-secondary/50 p-3 space-y-2">
              <div className="font-semibold text-foreground">{assignedDrill.title}</div>
              <p className="text-sm text-muted-foreground leading-snug">{assignedDrill.content.summary}</p>
              {session?.assignmentExplanation?.showWhy && (
                <div className="text-xs bg-primary/10 text-primary rounded-lg px-2.5 py-2">
                  <span className="font-semibold">Why this drill:</span> {session.assignmentExplanation.message}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {assignedDrill.content.durationMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-xp" />
                  +25 XP
                </span>
                <span className="capitalize">{assignedDrill.category}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">Tap below to get your personalized drill</p>
            </div>
          )}

          {/* Single primary action */}
          {!assignedDrill ? (
            <Button
              onClick={handleStart}
              disabled={starting}
              className="w-full h-12 text-base font-bold"
              aria-label="Start daily session"
            >
              {starting ? "Finding your drill..." : "Get Today's Drill"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => handleComplete(selectedOutcome)}
              disabled={completing}
              className="w-full h-12 text-base font-bold bg-success hover:bg-success/90"
              aria-label="Complete drill"
            >
              {completing ? "Saving..." : "Save Result"}
            </Button>
          )}

          {assignedDrill && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedOutcome === "success" ? "default" : "outline"}
                className="h-9 text-xs font-semibold"
                onClick={() => setSelectedOutcome("success")}
                disabled={completing}
              >
                Easy
              </Button>
              <Button
                type="button"
                variant={selectedOutcome === "partial" ? "default" : "outline"}
                className="h-9 text-xs font-semibold"
                onClick={() => setSelectedOutcome("partial")}
                disabled={completing}
              >
                Good
              </Button>
              <Button
                type="button"
                variant={selectedOutcome === "fail" ? "default" : "outline"}
                className="h-9 text-xs font-semibold"
                onClick={() => setSelectedOutcome("fail")}
                disabled={completing}
              >
                Hard
              </Button>
            </div>
          )}
        </div>

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
