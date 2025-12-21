import { Trophy, Target, Flame, Star, Medal, Crown, Zap, Award } from "lucide-react";
import { useAchievements, ComputedAchievement } from "@/hooks/useAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const iconMap = {
  star: Star,
  flame: Flame,
  target: Target,
  medal: Medal,
  crown: Crown,
  zap: Zap,
  trophy: Trophy,
  award: Award,
};

const rarityColors = {
  common: { bg: "bg-secondary", border: "border-border", text: "text-muted-foreground", glow: "" },
  rare: { bg: "bg-blue-500/10", border: "border-blue-500/50", text: "text-blue-400", glow: "shadow-blue-500/20" },
  epic: { bg: "bg-purple-500/10", border: "border-purple-500/50", text: "text-purple-400", glow: "shadow-purple-500/20" },
  legendary: { bg: "bg-amber-500/10", border: "border-amber-500/50", text: "text-amber-400", glow: "shadow-amber-500/30" },
};

export const AchievementsSection = () => {
  const { user } = useAuth();
  const { achievements, loading } = useAchievements();
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  if (!user) {
    return (
      <section id="achievements" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Achievements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sign in to track your achievements and unlock rewards!
            </p>
            <Link to="/auth" className="inline-block mt-6">
              <Button variant="hero" size="lg">
                Sign In to Start
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="achievements" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Achievements
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-secondary animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="achievements" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Achievements
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock achievements by training consistently and conquering challenges!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full">
            <Award className="w-5 h-5" />
            {unlockedCount} / {achievements.length} Unlocked
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const colors = rarityColors[achievement.rarity];
            const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);
            const IconComponent = iconMap[achievement.iconType];
            
            return (
              <div
                key={achievement.id}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all duration-300
                  ${colors.bg} ${colors.border}
                  ${achievement.unlocked ? `shadow-lg ${colors.glow}` : "opacity-75"}
                  ${!achievement.unlocked && "grayscale-[30%]"}
                `}
              >
                {/* Rarity badge */}
                <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {achievement.rarity}
                </div>
                
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-3
                  ${achievement.unlocked ? `${colors.bg} ${colors.text}` : "bg-muted text-muted-foreground"}
                `}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                {/* Content */}
                <h4 className={`font-bold ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.description}
                </p>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {achievement.progress} / {achievement.requirement}
                    </span>
                    <span className={`font-bold ${colors.text}`}>
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        achievement.unlocked 
                          ? "bg-success" 
                          : achievement.rarity === "legendary" 
                            ? "bg-gradient-to-r from-amber-400 to-orange-500"
                            : achievement.rarity === "epic"
                              ? "bg-gradient-to-r from-purple-400 to-pink-500"
                              : achievement.rarity === "rare"
                                ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                : "bg-primary"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                
                {/* Unlocked checkmark */}
                {achievement.unlocked && (
                  <div className="absolute top-3 left-3">
                    <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
