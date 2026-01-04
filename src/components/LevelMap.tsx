import { Link, useNavigate } from "react-router-dom";
import { Lock, Check, Play, Star, Zap } from "lucide-react";
import { DrillInfo } from "@/data/drillsData";
import { useFreeDrillLimit } from "@/hooks/useFreeDrillLimit";
import { toast } from "sonner";

interface LevelMapProps {
  drills: DrillInfo[];
  sportSlug: string;
  completedDrillIds: Set<string>;
  sportColor: string;
}

const LevelMap = ({ drills, sportSlug, completedDrillIds, sportColor }: LevelMapProps) => {
  const navigate = useNavigate();
  const { canDoMoreDrills, hasSubscription, remainingFreeDrills } = useFreeDrillLimit();

  // Calculate which drills are unlocked (progression-based)
  const isUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    return completedDrillIds.has(drills[index - 1].id);
  };

  // Check if drill is accessible (considers free limit)
  const isAccessible = (index: number): boolean => {
    const drill = drills[index];
    const isCompleted = completedDrillIds.has(drill.id);
    const unlocked = isUnlocked(index);
    
    if (!unlocked) return false;
    if (hasSubscription) return true;
    if (isCompleted) return true;
    return canDoMoreDrills;
  };

  const handleDrillClick = (e: React.MouseEvent, index: number, drillId: string) => {
    const unlocked = isUnlocked(index);
    const accessible = isAccessible(index);
    const isCompleted = completedDrillIds.has(drillId);

    if (!unlocked) {
      e.preventDefault();
      toast.error("Complete the previous drill first!");
      return;
    }

    if (!accessible && !isCompleted) {
      e.preventDefault();
      toast.error("You've used your free drill! Upgrade to Pro for unlimited access.", {
        action: {
          label: "View Plans",
          onClick: () => navigate("/#pricing"),
        },
      });
      return;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-success";
      case "intermediate": return "text-primary";
      case "advanced": return "text-streak";
      case "elite": return "text-xp";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="relative py-8">
      {/* Level nodes */}
      <div className="relative space-y-0">
        {drills.map((drill, index) => {
          const isCompleted = completedDrillIds.has(drill.id);
          const unlocked = isUnlocked(index);
          const accessible = isAccessible(index);
          const isLocked = !accessible;
          const isLeft = index % 2 === 0;
          
          return (
            <div key={drill.id} className="relative">
              {/* Connection line */}
              {index < drills.length - 1 && (
                <div 
                  className={`absolute left-1/2 top-full w-1 h-8 -translate-x-1/2 z-0 transition-colors ${
                    isCompleted ? "bg-success" : "bg-border"
                  }`}
                />
              )}
              
              <div 
                className={`flex items-center gap-4 py-4 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Level badge */}
                <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                  <span className={`text-sm font-bold ${
                    isCompleted ? "text-success" : isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
                  }`}>
                    Level {drill.level}
                  </span>
                </div>

                {/* Level node */}
                <Link
                  to={accessible ? `/drill/${sportSlug}/${drill.id}` : "#"}
                  onClick={(e) => handleDrillClick(e, index, drill.id)}
                  className={`
                    relative flex items-center justify-center shrink-0 transition-all duration-300
                    w-16 h-16
                    ${isCompleted 
                      ? "scale-100" 
                      : accessible 
                        ? "scale-110" 
                        : "scale-90 opacity-60"
                    }
                  `}
                >
                  {accessible && !isCompleted && (
                    <div 
                      className="absolute inset-0 rounded-full blur-lg opacity-50 animate-pulse"
                      style={{ backgroundColor: sportColor }}
                    />
                  )}
                  
                  <div
                    className={`
                      relative w-full h-full rounded-full flex items-center justify-center
                      border-4 transition-all shadow-lg
                      ${isCompleted
                        ? "bg-success border-success/50"
                        : isLocked
                          ? "bg-muted border-border"
                          : "bg-card border-primary"
                      }
                    `}
                    style={{
                      borderColor: isCompleted ? undefined : accessible ? sportColor : undefined,
                      boxShadow: accessible && !isCompleted ? `0 0 20px ${sportColor}40` : undefined
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 text-primary-foreground" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <Play className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-5 h-5 text-xp fill-xp" />
                    </div>
                  )}
                </Link>

                {/* Drill info card */}
                <div className={`flex-1 ${isLeft ? "text-left" : "text-right"}`}>
                  <Link
                    to={accessible ? `/drill/${sportSlug}/${drill.id}` : "#"}
                    onClick={(e) => handleDrillClick(e, index, drill.id)}
                    className={`
                      inline-block p-3 rounded-xl border-2 transition-all
                      ${isLocked 
                        ? "bg-muted/50 border-border cursor-not-allowed opacity-60" 
                        : isCompleted
                          ? "bg-success/10 border-success/30 hover:border-success"
                          : "bg-card border-border hover:border-primary hover:shadow-lg cursor-pointer"
                      }
                    `}
                  >
                    <h4 className={`font-bold text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                      {drill.title}
                    </h4>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${isLeft ? "" : "flex-row-reverse"}`}>
                      <span className="text-muted-foreground">{drill.duration} min</span>
                      <span className={`font-bold ${getDifficultyColor(drill.difficulty)}`}>
                        {drill.difficulty}
                      </span>
                      <span className="text-xp font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        +{drill.xp} XP
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* End trophy */}
      <div className="flex justify-center pt-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-streak to-streak/80 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Star className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-sm font-bold text-muted-foreground mt-2">Master all levels!</p>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
