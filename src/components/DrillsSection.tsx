import { Link } from "react-router-dom";
import { Play, Lock, Star, Crown, Flame } from "lucide-react";
import { toast } from "sonner";
import { getSportData } from "@/data/drillsData";

// Get actual first few drills from each sport
const getPopularDrills = () => {
  const sports = [
    { slug: "football", color: "#22c55e" },
    { slug: "basketball", color: "#f97316" },
    { slug: "tennis", color: "#eab308" },
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
    isBoss?: boolean;
    color: string;
  }[] = [];
  
  sports.forEach(({ slug, color }) => {
    const sportData = getSportData(slug);
    const sportDrills = sportData.drills.slice(0, 2); // Get first 2 drills from each sport
    
    sportDrills.forEach((drill, index) => {
      drills.push({
        id: drill.id,
        sportSlug: slug,
        title: drill.title,
        sport: sportData.name,
        duration: drill.duration,
        xp: drill.xp,
        level: index + 1,
        unlocked: index === 0, // Only first drill of each sport is unlocked by default
        isBoss: drill.isBoss,
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
    <section id="drills" className="py-16 md:py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Popular Drills
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete one drill a day to maintain your streak. Progress through levels and unlock boss challenges!
          </p>
        </div>

        {/* Mario-style level path */}
        <div className="relative max-w-4xl mx-auto">
          {/* Decorative path */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 rounded-full -translate-x-1/2 hidden md:block" />
          
          {/* Cloud decorations */}
          <div className="absolute -left-10 top-20 w-24 h-12 bg-white/10 rounded-full blur-xl hidden lg:block" />
          <div className="absolute -right-10 top-40 w-32 h-16 bg-white/10 rounded-full blur-xl hidden lg:block" />
          <div className="absolute -left-20 top-80 w-20 h-10 bg-white/10 rounded-full blur-xl hidden lg:block" />

          <div className="space-y-4 md:space-y-0">
            {popularDrills.map((drill, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={drill.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Mobile: Stack vertically */}
                  <Link
                    to={drill.unlocked ? `/drill/${drill.sportSlug}/${drill.id}` : "#"}
                    onClick={(e) => handleLockedDrillClick(e, drill)}
                    className="md:hidden block"
                  >
                    <div className={`
                      relative p-4 rounded-2xl border-2 transition-all duration-300
                      ${drill.isBoss 
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 hover:border-amber-400" 
                        : "bg-card border-border hover:border-primary hover:shadow-card"
                      }
                    `}>
                      <div className="flex items-center gap-4">
                        {/* Level node */}
                        <div 
                          className={`
                            w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 shadow-lg
                            ${drill.isBoss 
                              ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300" 
                              : drill.unlocked
                                ? "bg-card border-primary"
                                : "bg-muted border-border"
                            }
                          `}
                          style={{ borderColor: drill.unlocked && !drill.isBoss ? drill.color : undefined }}
                        >
                          {drill.isBoss ? (
                            <Crown className="w-6 h-6 text-white" />
                          ) : drill.unlocked ? (
                            <Play className="w-5 h-5 text-primary" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${drill.color}20`, color: drill.color }}
                            >
                              {drill.sport}
                            </span>
                            <span className="text-xs text-muted-foreground">Level {drill.level}</span>
                          </div>
                          <h4 className="font-bold text-foreground mt-1">{drill.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-muted-foreground">{drill.duration} min</span>
                            <span className="text-xp font-bold flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              +{drill.xp} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Desktop: Alternating path */}
                  <div className={`hidden md:flex items-center gap-8 py-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                    {/* Card */}
                    <div className="flex-1">
                      <Link
                        to={drill.unlocked ? `/drill/${drill.sportSlug}/${drill.id}` : "#"}
                        onClick={(e) => handleLockedDrillClick(e, drill)}
                        className={`
                          block p-4 rounded-2xl border-2 transition-all duration-300 ${isLeft ? "mr-8" : "ml-8"}
                          ${drill.isBoss 
                            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 hover:border-amber-400 hover:scale-105" 
                            : "bg-card border-border hover:border-primary hover:shadow-card hover:scale-105"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span 
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${drill.color}20`, color: drill.color }}
                          >
                            {drill.sport}
                          </span>
                          {drill.isBoss && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        </div>
                        <h4 className="font-bold text-foreground text-lg">{drill.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">{drill.duration} min</span>
                          <span className="text-xp font-bold flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            +{drill.xp} XP
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Level node */}
                    <div className="relative">
                      {/* Connector to center path */}
                      <div 
                        className={`absolute top-1/2 w-8 h-1 -translate-y-1/2 ${isLeft ? "right-full" : "left-full"}`}
                        style={{ backgroundColor: drill.color }}
                      />
                      
                      {/* Glow */}
                      {drill.unlocked && (
                        <div 
                          className="absolute inset-0 rounded-full blur-lg opacity-50"
                          style={{ backgroundColor: drill.color }}
                        />
                      )}
                      
                      {/* Node */}
                      <div 
                        className={`
                          relative w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg z-10
                          ${drill.isBoss 
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 animate-pulse" 
                            : drill.unlocked
                              ? "bg-card"
                              : "bg-muted border-border"
                          }
                        `}
                        style={{ 
                          borderColor: drill.unlocked && !drill.isBoss ? drill.color : undefined,
                          boxShadow: drill.unlocked ? `0 0 20px ${drill.color}40` : undefined
                        }}
                      >
                        {drill.isBoss ? (
                          <Crown className="w-7 h-7 text-white" />
                        ) : drill.unlocked ? (
                          <span className="font-extrabold text-xl" style={{ color: drill.color }}>{drill.level}</span>
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Empty space for alternating layout */}
                    <div className="flex-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* End CTA */}
          <div className="flex justify-center pt-8 mt-4">
            <Link
              to="/sports"
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full font-bold transition-all hover:scale-105 hover:shadow-lg"
            >
              <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View All Sports & Drills
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DrillsSection;
