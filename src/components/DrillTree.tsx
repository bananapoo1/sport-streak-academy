import { Link } from "react-router-dom";
import { Lock, Check, Play } from "lucide-react";

export interface Drill {
  id: string;
  title: string;
  duration: string;
  xp: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isPremium: boolean;
}

interface DrillTreeProps {
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  drills: Drill[];
  sportSlug: string;
}

const levelConfig = {
  beginner: { color: "bg-success", borderColor: "border-success", textColor: "text-success" },
  intermediate: { color: "bg-streak", borderColor: "border-streak", textColor: "text-streak" },
  advanced: { color: "bg-primary", borderColor: "border-primary", textColor: "text-primary" },
};

const DrillTree = ({ title, level, drills, sportSlug }: DrillTreeProps) => {
  const config = levelConfig[level];

  return (
    <div className="mb-8">
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${config.textColor}`}>
        <span className={`w-3 h-3 rounded-full ${config.color}`} />
        {title}
      </h3>
      
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -z-10" />
        
        <div className="space-y-4">
          {drills.map((drill, index) => {
            const isLocked = !drill.isUnlocked;
            
            return (
              <div key={drill.id} className="relative flex items-center gap-4">
                {/* Circle indicator */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-3 transition-all ${
                    drill.isCompleted
                      ? `${config.color} border-transparent`
                      : isLocked
                      ? "bg-muted border-border"
                      : `bg-card ${config.borderColor} border-2`
                  }`}
                >
                  {drill.isCompleted ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Play className="w-5 h-5 text-foreground" />
                  )}
                </div>

                {/* Card */}
                <Link
                  to={isLocked ? "#" : `/drill/${sportSlug}/${drill.id}`}
                  className={`flex-1 bg-card border-2 rounded-2xl p-4 transition-all ${
                    isLocked
                      ? "border-border opacity-60 cursor-not-allowed"
                      : drill.isCompleted
                      ? `${config.borderColor} shadow-soft`
                      : "border-border hover:border-primary hover:shadow-card cursor-pointer"
                  }`}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{drill.title}</h4>
                      <p className="text-sm text-muted-foreground">{drill.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-xp/20 text-xp text-xs font-bold px-2 py-1 rounded-lg">
                        +{drill.xp} XP
                      </span>
                      {drill.isPremium && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
                          PRO
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DrillTree;
