import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Star } from "lucide-react";
import type { DrillOutcome, SessionCompleteResponse } from "@/types/dailyHabit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SessionCompleteResponse | null;
  drillOutcome?: DrillOutcome;
  showConfetti?: boolean;
};

/** Motivational messages that rotate randomly */
const successMessages = [
  "You're building something special. 🔥",
  "Winners show up every day. That's you. 💪",
  "Another step closer to greatness. ⭐",
  "Consistency beats talent. Keep going! 🏆",
  "Your future self will thank you. 🙌",
];

const getRandomMessage = () => successMessages[Math.floor(Math.random() * successMessages.length)];

function ConfettiBurst() {
  const particles = useMemo(
    () => Array.from({ length: 30 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      delay: `${(index % 8) * 30}ms`,
      colorClass: index % 4 === 0 ? "bg-primary" : index % 4 === 1 ? "bg-accent" : index % 4 === 2 ? "bg-streak" : "bg-xp",
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
  const message = useMemo(() => getRandomMessage(), []);
  const streakDays = result?.streakState?.current ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="session-completion-description" className="overflow-hidden">
        {showConfetti ? <ConfettiBurst /> : null}
        <DialogHeader>
          <DialogTitle className="pr-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-league-gold" />
            Session Complete!
          </DialogTitle>
          <DialogDescription id="session-completion-description">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-xp/10 border border-xp/20 p-4 text-center">
            <Zap className="w-5 h-5 text-xp mx-auto mb-1" />
            <div className="text-2xl font-bold text-xp">+{result?.xpAwarded ?? 0}</div>
            <div className="text-xs text-muted-foreground">XP Earned</div>
          </div>
          <div className="rounded-xl bg-streak/10 border border-streak/20 p-4 text-center">
            <Flame className="w-5 h-5 text-streak mx-auto mb-1" />
            <div className="text-2xl font-bold text-streak">{streakDays} days</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} aria-label="Close completion modal">Continue</Button>
      </DialogContent>
    </Dialog>
  );
}
