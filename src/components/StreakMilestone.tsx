import { useEffect, useState } from "react";
import { Flame, Trophy, Star, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface StreakMilestoneProps {
  streak: number;
  previousStreak: number;
}

interface Milestone {
  days: number;
  title: string;
  subtitle: string;
  emoji: string;
  icon: React.ReactNode;
  xpBonus: number;
  color: string;
}

const MILESTONES: Milestone[] = [
  { days: 3, title: "3-Day Streak!", subtitle: "You're building a habit. Don't stop now!", emoji: "🔥", icon: <Flame className="w-16 h-16" />, xpBonus: 25, color: "text-streak" },
  { days: 7, title: "1 Week Streak!", subtitle: "Incredible consistency! You're in the top 20% of athletes.", emoji: "⭐", icon: <Star className="w-16 h-16" />, xpBonus: 50, color: "text-league-gold" },
  { days: 14, title: "2 Week Streak!", subtitle: "This is real dedication. Your skills are leveling up!", emoji: "🏆", icon: <Trophy className="w-16 h-16" />, xpBonus: 100, color: "text-league-gold" },
  { days: 30, title: "30-Day Streak!", subtitle: "You're a LEGEND. One month of daily training!", emoji: "👑", icon: <Crown className="w-16 h-16" />, xpBonus: 250, color: "text-xp" },
  { days: 50, title: "50-Day Streak!", subtitle: "Absolutely elite. You're unstoppable!", emoji: "💎", icon: <Zap className="w-16 h-16" />, xpBonus: 500, color: "text-primary" },
  { days: 100, title: "100-Day Streak!", subtitle: "One hundred days. This is legendary status.", emoji: "🐉", icon: <Crown className="w-16 h-16" />, xpBonus: 1000, color: "text-league-gold" },
];

/**
 * Shows a celebration dialog when a user hits a streak milestone.
 * Only triggers when crossing a milestone threshold (previousStreak < milestone <= streak).
 */
export default function StreakMilestone({ streak, previousStreak }: StreakMilestoneProps) {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    // Find the highest milestone that was just crossed
    const crossed = MILESTONES.filter(m => previousStreak < m.days && streak >= m.days);
    if (crossed.length > 0) {
      const highest = crossed[crossed.length - 1];
      setActiveMilestone(highest);

      // Generate confetti
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["hsl(var(--primary))", "hsl(var(--streak-gold))", "hsl(var(--xp-purple))", "hsl(var(--success))"][i % 4],
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);
    }
  }, [streak, previousStreak]);

  if (!activeMilestone) return null;

  return (
    <Dialog open={!!activeMilestone} onOpenChange={() => setActiveMilestone(null)}>
      <DialogContent className="sm:max-w-sm overflow-hidden border-2 border-primary/30">
        {/* Confetti layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2.5 h-2.5 rounded-sm animate-confetti"
              style={{
                left: `${piece.x}%`,
                top: "-10px",
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center py-4 space-y-4 relative z-10">
          {/* Icon */}
          <div className={`mx-auto ${activeMilestone.color} animate-bounce`}>
            {activeMilestone.icon}
          </div>

          {/* Emoji */}
          <div className="text-5xl">{activeMilestone.emoji}</div>

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-foreground">
            {activeMilestone.title}
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground">{activeMilestone.subtitle}</p>

          {/* XP Bonus */}
          <div className="inline-flex items-center gap-2 bg-xp/20 text-xp px-5 py-2.5 rounded-full">
            <Zap className="w-5 h-5" />
            <span className="text-xl font-bold">+{activeMilestone.xpBonus} XP Bonus</span>
          </div>

          {/* Streak display */}
          <div className="flex items-center justify-center gap-2 text-streak">
            <Flame className="w-6 h-6 fill-current" />
            <span className="text-2xl font-extrabold">{streak} days</span>
          </div>

          <Button
            onClick={() => setActiveMilestone(null)}
            size="lg"
            className="w-full mt-2"
          >
            Keep Going!
          </Button>
        </div>

        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(80vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti {
            animation: confetti-fall 3s ease-out forwards;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
