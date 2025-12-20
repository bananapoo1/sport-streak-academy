import { Trophy, Target, Flame, Star, Medal, Crown, Zap, Award } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
}

const achievements: Achievement[] = [
  {
    id: "first-drill",
    title: "First Steps",
    description: "Complete your first drill",
    icon: <Star className="w-6 h-6" />,
    progress: 1,
    total: 1,
    unlocked: true,
    rarity: "common",
    xpReward: 50,
  },
  {
    id: "streak-7",
    title: "On Fire",
    description: "Maintain a 7-day streak",
    icon: <Flame className="w-6 h-6" />,
    progress: 7,
    total: 7,
    unlocked: true,
    rarity: "common",
    xpReward: 100,
  },
  {
    id: "drills-10",
    title: "Getting Started",
    description: "Complete 10 drills",
    icon: <Target className="w-6 h-6" />,
    progress: 10,
    total: 10,
    unlocked: true,
    rarity: "common",
    xpReward: 150,
  },
  {
    id: "streak-30",
    title: "Dedicated Athlete",
    description: "Maintain a 30-day streak",
    icon: <Flame className="w-6 h-6" />,
    progress: 14,
    total: 30,
    unlocked: false,
    rarity: "rare",
    xpReward: 300,
  },
  {
    id: "drills-50",
    title: "Drill Sergeant",
    description: "Complete 50 drills",
    icon: <Medal className="w-6 h-6" />,
    progress: 23,
    total: 50,
    unlocked: false,
    rarity: "rare",
    xpReward: 500,
  },
  {
    id: "boss-5",
    title: "Boss Slayer",
    description: "Defeat 5 boss levels",
    icon: <Crown className="w-6 h-6" />,
    progress: 2,
    total: 5,
    unlocked: false,
    rarity: "epic",
    xpReward: 750,
  },
  {
    id: "xp-10000",
    title: "XP Hunter",
    description: "Earn 10,000 XP",
    icon: <Zap className="w-6 h-6" />,
    progress: 4200,
    total: 10000,
    unlocked: false,
    rarity: "epic",
    xpReward: 1000,
  },
  {
    id: "legend",
    title: "Living Legend",
    description: "Reach Diamond League",
    icon: <Trophy className="w-6 h-6" />,
    progress: 0,
    total: 1,
    unlocked: false,
    rarity: "legendary",
    xpReward: 2000,
  },
];

const rarityColors = {
  common: { bg: "bg-secondary", border: "border-border", text: "text-muted-foreground", glow: "" },
  rare: { bg: "bg-blue-500/10", border: "border-blue-500/50", text: "text-blue-400", glow: "shadow-blue-500/20" },
  epic: { bg: "bg-purple-500/10", border: "border-purple-500/50", text: "text-purple-400", glow: "shadow-purple-500/20" },
  legendary: { bg: "bg-amber-500/10", border: "border-amber-500/50", text: "text-amber-400", glow: "shadow-amber-500/30" },
};

export const AchievementsSection = () => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
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
            const progressPercent = Math.min((achievement.progress / achievement.total) * 100, 100);
            
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
                  {achievement.icon}
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
                      {achievement.progress} / {achievement.total}
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
