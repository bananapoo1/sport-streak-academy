import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Play, Crown, ChevronRight, Star, Target } from "lucide-react";
import { DrillCategory, DrillInfo } from "@/data/drillsData";

interface CategoryMapProps {
  categories: DrillCategory[];
  sportSlug: string;
  completedDrillIds: Set<string>;
  sportColor: string;
}

const CategoryMap = ({ categories, sportSlug, completedDrillIds, sportColor }: CategoryMapProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Filter out boss challenges from categories (they'll be shown at the end)
  const regularCategories = categories.filter(c => c.name !== "Boss Challenge");
  const bossCategory = categories.find(c => c.name === "Boss Challenge");

  const getCategoryProgress = (category: DrillCategory) => {
    const completed = category.drills.filter(d => completedDrillIds.has(d.id)).length;
    return { completed, total: category.drills.length };
  };

  const isUnlockedInCategory = (drill: DrillInfo, categoryDrills: DrillInfo[]): boolean => {
    const drillIndex = categoryDrills.findIndex(d => d.id === drill.id);
    if (drillIndex === 0) return true;
    return completedDrillIds.has(categoryDrills[drillIndex - 1].id);
  };

  return (
    <div className="space-y-4">
      {regularCategories.map((category) => {
        const progress = getCategoryProgress(category);
        const isExpanded = expandedCategory === category.name;
        const isComplete = progress.completed === progress.total;

        return (
          <div key={category.name} className="overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                ${isComplete 
                  ? "bg-success/10 border-success/30 hover:border-success" 
                  : "bg-card border-border hover:border-primary"
                }
              `}
            >
              {/* Category Icon */}
              <div 
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                  ${isComplete ? "bg-success" : "bg-primary/10"}
                `}
                style={{ backgroundColor: isComplete ? undefined : `${sportColor}20` }}
              >
                <Target 
                  className="w-7 h-7"
                  style={{ color: isComplete ? "white" : sportColor }}
                />
              </div>

              {/* Category Info */}
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[150px]">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(progress.completed / progress.total) * 100}%`,
                        backgroundColor: isComplete ? "hsl(var(--success))" : sportColor
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              </div>

              {/* Expand Arrow */}
              <ChevronRight 
                className={`w-6 h-6 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>

            {/* Expanded Drills */}
            {isExpanded && (
              <div className="mt-2 pl-4 space-y-2 animate-fade-in">
                {category.drills.map((drill, index) => {
                  const isCompleted = completedDrillIds.has(drill.id);
                  const unlocked = isUnlockedInCategory(drill, category.drills);
                  const isLocked = !unlocked;

                  return (
                    <Link
                      key={drill.id}
                      to={isLocked ? "#" : `/drill/${sportSlug}/${drill.id}`}
                      onClick={(e) => isLocked && e.preventDefault()}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                        ${isLocked 
                          ? "bg-muted/50 border-border cursor-not-allowed opacity-60" 
                          : isCompleted
                            ? "bg-success/10 border-success/30 hover:border-success"
                            : "bg-card border-border hover:border-primary hover:shadow-soft"
                        }
                      `}
                    >
                      {/* Level indicator */}
                      <div 
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
                          ${isCompleted 
                            ? "bg-success border-success/50" 
                            : isLocked 
                              ? "bg-muted border-border" 
                              : "bg-card border-primary"
                          }
                        `}
                        style={{ borderColor: !isCompleted && !isLocked ? sportColor : undefined }}
                      >
                        {isCompleted ? (
                          <Star className="w-5 h-5 text-white fill-white" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <span className="font-bold" style={{ color: sportColor }}>{index + 1}</span>
                        )}
                      </div>

                      {/* Drill info */}
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                          {drill.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{drill.duration} min</span>
                          <span className="text-xp font-bold">+{drill.xp} XP</span>
                        </div>
                      </div>

                      {/* Play icon for unlocked */}
                      {!isLocked && !isCompleted && (
                        <Play className="w-5 h-5" style={{ color: sportColor }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Boss Challenges Section */}
      {bossCategory && bossCategory.drills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Boss Challenges
          </h3>
          <div className="space-y-3">
            {bossCategory.drills.map((drill) => {
              const isCompleted = completedDrillIds.has(drill.id);
              // Boss drills unlock based on overall completion
              const totalCompleted = completedDrillIds.size;
              const requiredForBoss = drill.difficulty === "intermediate" ? 5 : 10;
              const unlocked = totalCompleted >= requiredForBoss;
              const isLocked = !unlocked;

              return (
                <Link
                  key={drill.id}
                  to={isLocked ? "#" : `/drill/${sportSlug}/${drill.id}`}
                  onClick={(e) => isLocked && e.preventDefault()}
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                    ${isLocked 
                      ? "bg-muted/50 border-border cursor-not-allowed opacity-60" 
                      : isCompleted
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400"
                        : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/50 hover:border-amber-400 hover:shadow-lg"
                    }
                  `}
                >
                  {/* Boss node */}
                  <div 
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4
                      ${isCompleted 
                        ? "bg-amber-500 border-amber-300" 
                        : isLocked 
                          ? "bg-muted border-border" 
                          : "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 animate-pulse"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Star className="w-7 h-7 text-white fill-white" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <Crown className="w-7 h-7 text-white" />
                    )}
                  </div>

                  {/* Boss info */}
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                      {drill.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{drill.duration} min</span>
                      <span className="text-amber-500 font-bold">+{drill.xp} XP</span>
                      {isLocked && (
                        <span className="text-xs text-muted-foreground">
                          Complete {requiredForBoss} drills to unlock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMap;
