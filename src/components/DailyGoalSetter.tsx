import { useState } from "react";
import { Target, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DailyGoalSetterProps {
  currentGoal: number;
  onGoalChange: (goal: number) => void;
  compact?: boolean;
}

const goalOptions = [
  { minutes: 5, label: "Quick", description: "Perfect for busy days", icon: "🌱" },
  { minutes: 10, label: "Daily", description: "Build consistent habits", icon: "⚡", recommended: true },
  { minutes: 15, label: "Focused", description: "See real improvement", icon: "🔥" },
  { minutes: 20, label: "Committed", description: "Serious progress", icon: "💪" },
];

const DailyGoalSetter = ({ currentGoal, onGoalChange, compact = false }: DailyGoalSetterProps) => {
  const [selectedGoal, setSelectedGoal] = useState(currentGoal);

  const handleSelect = (minutes: number) => {
    setSelectedGoal(minutes);
    onGoalChange(minutes);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Daily Goal:</span>
        <div className="flex gap-1">
          {goalOptions.map((option) => (
            <button
              key={option.minutes}
              onClick={() => handleSelect(option.minutes)}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-all",
                selectedGoal === option.minutes
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {option.minutes}m
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Set Your Daily Goal</h3>
          <p className="text-sm text-muted-foreground">How much time can you commit today?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {goalOptions.map((option) => (
          <button
            key={option.minutes}
            onClick={() => handleSelect(option.minutes)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left group hover-lift",
              selectedGoal === option.minutes
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/30 hover:border-primary/50"
            )}
          >
            {selectedGoal === option.minutes && (
              <div className="absolute top-2 right-2">
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
            <span className="text-2xl mb-2 block">{option.icon}</span>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-foreground">{option.minutes}</span>
              <span className="text-sm text-muted-foreground">min</span>
            </div>
            <p className="text-sm font-medium text-foreground">{option.label}</p>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Your goal resets daily at midnight</span>
      </div>
    </div>
  );
};

export default DailyGoalSetter;
