import { Flame } from "lucide-react";

interface StreakCounterProps {
  days: number;
  isActive?: boolean;
}

export const StreakCounter = ({ days, isActive = true }: StreakCounterProps) => {
  return (
    <div className="flex items-center gap-2 bg-card border-2 border-border rounded-2xl px-4 py-2 shadow-soft">
      <div className={`${isActive ? "animate-streak-fire text-streak" : "text-muted-foreground"}`}>
        <Flame className="w-6 h-6 fill-current" />
      </div>
      <span className="font-extrabold text-xl text-foreground">{days}</span>
      <span className="text-muted-foreground font-medium text-sm">day streak</span>
    </div>
  );
};

export default StreakCounter;
