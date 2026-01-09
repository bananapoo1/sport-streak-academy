import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Lock, Check, ChevronRight, Star, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSportData, DrillInfo } from "@/data/drillsData";

interface SkillTreeProps {
  sportSlug: string;
  completedDrillIds: string[];
}

interface DrillNode extends DrillInfo {
  isUnlocked: boolean;
  isCompleted: boolean;
  prerequisiteMet: boolean;
}

const SkillTree = ({ sportSlug, completedDrillIds }: SkillTreeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const sportData = getSportData(sportSlug);
  
  // Flatten all drills from categories
  const allDrills = useMemo(() => {
    if (!sportData) return [];
    return sportData.categories.flatMap(cat => cat.drills);
  }, [sportData]);
  
  const drillNodes = useMemo(() => {
    if (!sportData || allDrills.length === 0) return [];
    
    return allDrills.map((drill): DrillNode => {
      const isCompleted = completedDrillIds.includes(drill.id);
      
      // Unlock logic: Level 1 drills are always unlocked
      // Higher levels require previous level in same category to be completed
      const prerequisiteMet = drill.level === 1 || allDrills.some(
        d => d.category === drill.category && 
             d.level === drill.level - 1 && 
             completedDrillIds.includes(d.id)
      );
      
      const isUnlocked = prerequisiteMet;
      
      return {
        ...drill,
        isUnlocked,
        isCompleted,
        prerequisiteMet,
      };
    });
  }, [sportData, allDrills, completedDrillIds]);

  // Group by category
  const categories = useMemo(() => {
    const grouped: Record<string, DrillNode[]> = {};
    drillNodes.forEach(drill => {
      if (!grouped[drill.category]) {
        grouped[drill.category] = [];
      }
      grouped[drill.category].push(drill);
    });
    // Sort by level within each category
    Object.values(grouped).forEach(drills => {
      drills.sort((a, b) => a.level - b.level);
    });
    return grouped;
  }, [drillNodes]);

  const categoryNames = Object.keys(categories);
  const activeCategory = selectedCategory || categoryNames[0];

  if (!sportData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Sport not found
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "from-success to-success/70";
      case "intermediate": return "from-primary to-primary/70";
      case "advanced": return "from-streak to-streak/70";
      case "elite": return "from-xp to-xp/70";
      default: return "from-muted to-muted/70";
    }
  };

  const completedCount = drillNodes.filter(d => d.isCompleted).length;
  const totalCount = drillNodes.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{sportData.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground">{sportData.name} Skill Tree</h2>
              <p className="text-sm text-muted-foreground">Master all drills to become elite</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{progressPercent}%</div>
            <p className="text-sm text-muted-foreground">{completedCount}/{totalCount} completed</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryNames.map(category => {
          const categoryDrills = categories[category];
          const catCompleted = categoryDrills.filter(d => d.isCompleted).length;
          const isActive = category === activeCategory;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              <Target className="w-4 h-4" />
              <span className="font-medium">{category}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isActive ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {catCompleted}/{categoryDrills.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skill Tree Nodes */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute left-[2.5rem] top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 via-primary/30 to-border rounded-full" />
        
        <div className="space-y-4 relative">
          {categories[activeCategory]?.map((drill, index) => (
            <div key={drill.id} className="relative">
              {/* Node */}
              <div className={cn(
                "relative ml-12 p-4 rounded-xl border-2 transition-all",
                drill.isCompleted
                  ? "bg-success/10 border-success"
                  : drill.isUnlocked
                    ? "bg-card border-primary/50 hover:border-primary hover-lift cursor-pointer"
                    : "bg-secondary/30 border-border opacity-60"
              )}>
                {/* Level Indicator */}
                <div className={cn(
                  "absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10",
                  drill.isCompleted
                    ? "bg-success text-success-foreground border-success"
                    : drill.isUnlocked
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border"
                )}>
                  {drill.isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : drill.isUnlocked ? (
                    drill.level
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>

                {drill.isUnlocked ? (
                  <Link to={`/drill/${sportSlug}/${drill.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r text-white",
                            getDifficultyColor(drill.difficulty)
                          )}>
                            {drill.difficulty}
                          </span>
                          <span className="text-xs text-muted-foreground">Level {drill.level}</span>
                        </div>
                        <h4 className="font-bold text-foreground">{drill.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{drill.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xp font-bold">
                            <Zap className="w-4 h-4" />
                            +{drill.xp}
                          </div>
                          <p className="text-xs text-muted-foreground">{drill.duration} min</p>
                        </div>
                        {drill.isCompleted ? (
                          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-success fill-success" />
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Locked
                        </span>
                        <span className="text-xs text-muted-foreground">Level {drill.level}</span>
                      </div>
                      <h4 className="font-bold text-muted-foreground">{drill.title}</h4>
                      <p className="text-sm text-muted-foreground">Complete Level {drill.level - 1} to unlock</p>
                    </div>
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
