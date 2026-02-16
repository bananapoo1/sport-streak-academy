import { Link } from "react-router-dom";
import { Play, Lock, Star, Crown, Flame, Zap, Target, ArrowRight } from "lucide-react";
import { sportsData } from "@/data/drillsData";

const targetSports = [
  { slug: "football", color: "hsl(142 76% 36%)" },
  { slug: "basketball", color: "hsl(25 95% 53%)" },
  { slug: "tennis", color: "hsl(45 93% 47%)" },
  { slug: "golf", color: "hsl(142 76% 36%)" },
  { slug: "cricket", color: "hsl(210 80% 50%)" },
  { slug: "rugby", color: "hsl(0 72% 51%)" },
  { slug: "field-hockey", color: "hsl(173 80% 40%)" },
  { slug: "padel", color: "hsl(271 81% 56%)" },
];

const getSportCards = () => {
  return targetSports.map(({ slug, color }) => {
    const sport = sportsData[slug];
    if (!sport) return null;
    const totalDrills = sport.categories.reduce((sum, cat) => sum + cat.drills.length, 0);
    const categoryCount = sport.categories.length;
    return {
      slug,
      name: sport.name,
      emoji: sport.emoji,
      color,
      totalDrills,
      categoryCount,
      categories: sport.categories.map(c => c.name),
    };
  }).filter(Boolean);
};

const sportCards = getSportCards();

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
            Training <span className="gradient-text">Drills</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Progressive drills designed by elite coaches. Pick a sport, complete drills, earn XP, and climb the leaderboards.
          </p>
        </div>

        {/* Sports Drill Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-12">
          {sportCards.map((sport, index) => sport && (
            <Link
              key={sport.slug}
              to={`/sports/${sport.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:-translate-y-1 animate-in opacity-0"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                  <div>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{sport.name}</h4>
                    <p className="text-xs text-muted-foreground">{sport.totalDrills} drills</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {sport.categories.map(cat => (
                    <span key={cat} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{sport.categoryCount} categories</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
