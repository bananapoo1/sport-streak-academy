import { Link, useNavigate } from "react-router-dom";
import { Lock, Check, Play, Crown, Star } from "lucide-react";
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
    
    // Not unlocked by progression = not accessible
    if (!unlocked) return false;
    
    // Subscribed users can access all unlocked drills
    if (hasSubscription) return true;
    
    // Completed drills are always viewable
    if (isCompleted) return true;
    
    // Free users can only access new drills if they haven't hit the limit
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

  return (
    <div className="relative py-8">
      {/* Winding path background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Level nodes */}
      <div className="relative space-y-0">
        {drills.map((drill, index) => {
          const isCompleted = completedDrillIds.has(drill.id);
          const unlocked = isUnlocked(index);
          const accessible = isAccessible(index);
          const isLocked = !accessible;
          const isBoss = drill.isBoss;
          
          // Alternate left/right positioning for Mario-style path
          const isLeft = index % 2 === 0;
          
          return (
            <div key={drill.id} className="relative">
              {/* Connection line to next level */}
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
                {/* Level number badge */}
                <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                  <span className={`text-sm font-bold ${
                    isCompleted ? "text-success" : isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
                  }`}>
                    Level {index + 1}
                  </span>
                </div>

                {/* Level node */}
                <Link
                  to={accessible ? `/drill/${sportSlug}/${drill.id}` : "#"}
                  onClick={(e) => handleDrillClick(e, index, drill.id)}
                  className={`
                    relative flex items-center justify-center shrink-0 transition-all duration-300
                    ${isBoss ? "w-20 h-20" : "w-16 h-16"}
                    ${isCompleted 
                      ? "scale-100" 
                      : accessible 
                        ? "scale-110 animate-pulse" 
                        : "scale-90 opacity-60"
                    }
                  `}
                >
                  {/* Glow effect for accessible drills */}
                  {accessible && !isCompleted && (
                    <div 
                      className="absolute inset-0 rounded-full blur-lg opacity-50"
                      style={{ backgroundColor: sportColor }}
                    />
                  )}
                  
                  {/* Node circle */}
                  <div
                    className={`
                      relative w-full h-full rounded-full flex items-center justify-center
                      border-4 transition-all shadow-lg
                      ${isCompleted
                        ? "bg-success border-success/50"
                        : isLocked
                          ? "bg-muted border-border"
                          : isBoss 
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300"
                            : "bg-card border-primary"
                      }
                    `}
                    style={{
                      borderColor: isCompleted ? undefined : accessible && !isBoss ? sportColor : undefined,
                      boxShadow: accessible && !isCompleted ? `0 0 20px ${sportColor}40` : undefined
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : isBoss ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  {/* Stars for completed */}
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
                          : isBoss
                            ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/50 hover:border-amber-400 cursor-pointer"
                            : "bg-card border-border hover:border-primary hover:shadow-card cursor-pointer"
                      }
                    `}
                  >
                    <div className={`flex items-center gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
                      {isBoss && <Crown className="w-4 h-4 text-amber-500" />}
                      <h4 className={`font-bold text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                        {drill.title}
                      </h4>
                    </div>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${isLeft ? "" : "flex-row-reverse"}`}>
                      <span className="text-muted-foreground">{drill.duration} min</span>
                      <span className={`font-bold ${isBoss ? "text-amber-500" : "text-xp"}`}>+{drill.xp} XP</span>
                      {drill.isPremium && (
                        <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">PRO</span>
                      )}
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
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Star className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-bold text-muted-foreground mt-2">Complete all levels!</p>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
