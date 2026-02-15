import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DrillOutcome, SessionCompleteResponse } from "@/types/dailyHabit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SessionCompleteResponse | null;
  drillOutcome?: DrillOutcome;
  showConfetti?: boolean;
};

function ConfettiBurst() {
  const particles = useMemo(
    () => Array.from({ length: 20 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      delay: `${(index % 6) * 35}ms`,
      colorClass: index % 3 === 0 ? "bg-primary" : index % 3 === 1 ? "bg-accent" : "bg-streak",
    })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`absolute top-1 h-2 w-2 rounded-full ${particle.colorClass} animate-confetti-drop`}
          style={{ left: particle.left, animationDelay: particle.delay }}
        />
      ))}
    </div>
  );
}

export default function CompletionModal({ open, onOpenChange, result, drillOutcome, showConfetti = true }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="session-completion-description" className="overflow-hidden">
        {showConfetti ? <ConfettiBurst /> : null}
        <DialogHeader>
          <DialogTitle className="pr-6">Session complete</DialogTitle>
          <DialogDescription id="session-completion-description">
            {drillOutcome === "success" ? "Great work — momentum unlocked." : "Nice session — consistency compounds."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-xs uppercase text-muted-foreground">XP</div>
            <div className="text-2xl font-bold text-xp">+{result?.xpAwarded ?? 0}</div>
          </div>
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-xs uppercase text-muted-foreground">Streak</div>
            <div className="text-2xl font-bold text-streak">{result?.streakState.current ?? 0} days</div>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} aria-label="Close completion modal">Continue</Button>
      </DialogContent>
    </Dialog>
  );
}
