import { Clock, Zap, Users, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrillCardProps {
  title: string;
  sport: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  players: string;
  isPremium?: boolean;
  onStart?: () => void;
}

const difficultyConfig = {
  Beginner: {
    color: "bg-success/20 text-success",
    dots: 1,
  },
  Intermediate: {
    color: "bg-streak/20 text-streak",
    dots: 2,
  },
  Advanced: {
    color: "bg-primary/20 text-primary",
    dots: 3,
  },
};

export const DrillCard = ({
  title,
  sport,
  duration,
  difficulty,
  players,
  isPremium = false,
  onStart,
}: DrillCardProps) => {
  const diffConfig = difficultyConfig[difficulty];

  return (
    <div className="group bg-card border-2 border-border rounded-2xl p-5 shadow-soft hover:shadow-card hover:border-primary/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {sport}
        </span>
        {isPremium && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
            PRO
          </span>
        )}
      </div>

      <h3 className="font-bold text-lg text-foreground mb-4 group-hover:text-primary transition-colors">
        {title}
      </h3>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {duration}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {players}
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-lg ${diffConfig.color}`}>
          <Zap className="w-4 h-4" />
          {difficulty}
        </div>
      </div>

      <Button
        onClick={onStart}
        variant={isPremium ? "outline" : "default"}
        size="sm"
        className="w-full"
      >
        <Play className="w-4 h-4" />
        {isPremium ? "Unlock to Start" : "Start Drill"}
      </Button>
    </div>
  );
};

export default DrillCard;
