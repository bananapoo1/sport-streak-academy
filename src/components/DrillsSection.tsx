import { Link } from "react-router-dom";
import { Play, Lock, Star, Crown, Flame, Zap, Target } from "lucide-react";
import { toast } from "sonner";
import { getSportData, getAllDrillsForSport } from "@/data/drillsData";

// Get actual first few drills from each sport
const getPopularDrills = () => {
  const sports = [
    { slug: "football", color: "hsl(160 84% 39%)" },
    { slug: "basketball", color: "hsl(25 95% 53%)" },
    { slug: "tennis", color: "hsl(45 93% 47%)" },
  ];
  
  const drills: {
    id: string;
    sportSlug: string;
    title: string;
    sport: string;
    duration: number;
    xp: number;
    level: number;
    unlocked: boolean;
    color: string;
  }[] = [];
  
  sports.forEach(({ slug, color }) => {
    const sportData = getSportData(slug);
    if (!sportData) return;
    
    // Get first 2 level-1 drills from each sport
    const allDrills = getAllDrillsForSport(slug);
    const levelOneDrills = allDrills.filter(d => d.level === 1).slice(0, 2);
    
    levelOneDrills.forEach((drill, index) => {
      drills.push({
        id: drill.id,
        sportSlug: slug,
        title: drill.title,
        sport: sportData.name,
        duration: drill.duration,
        xp: drill.xp,
        level: index + 1,
        unlocked: index === 0,
        color,
      });
    });
  });
  
  return drills;
};

const popularDrills = getPopularDrills();

const handleLockedDrillClick = (e: React.MouseEvent, drill: typeof popularDrills[0]) => {
  if (!drill.unlocked) {
    e.preventDefault();
    toast.error(`🔒 "${drill.title}" is locked!`, {
      description: `Complete earlier drills in ${drill.sport} to unlock this level.`,
    });
  }
};

export const DrillsSection = () => {
  return (
    <section id="drills" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container relative">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-xp/10 border border-xp/20 text-xp text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>Earn XP</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Popular <span className="gradient-text">Drills</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Complete one drill a day to maintain your streak. Progress through levels and unlock advanced challenges!
          </p>
        </div>

        {/* Drills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {popularDrills.map((drill, index) => (
            <Link
              key={drill.id}
              to={drill.unlocked ? `/drill/${drill.sportSlug}/${drill.id}` : "#"}
              onClick={(e) => handleLockedDrillClick(e, drill)}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)] animate-in opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
              
              <div className="relative">
                {/* Sport badge */}
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${drill.color}20`, color: drill.color }}
                  >
                    {drill.sport}
                  </span>
                  <span className="text-xs text-muted-foreground">Level {drill.level}</span>
                </div>
                
                {/* Level node */}
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 shadow-lg
                      ${drill.unlocked
                        ? "bg-card"
                        : "bg-muted border-border"
                      }
                    `}
                    style={{ borderColor: drill.unlocked ? drill.color : undefined }}
                  >
                    {drill.unlocked ? (
                      <Play className="w-6 h-6" style={{ color: drill.color }} />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {drill.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-muted-foreground">{drill.duration} min</span>
                      <span className="text-xp font-bold flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        +{drill.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            to="/sports"
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
          >
            <Target className="w-5 h-5" />
            View All Sports & Drills
            <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DrillsSection;
