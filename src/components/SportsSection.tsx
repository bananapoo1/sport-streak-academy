import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Zap, Target } from "lucide-react";
import { sportsData } from "@/data/drillsData";

const SportsSection = () => {
  const sports = Object.values(sportsData);

  return (
    <section id="sports" className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />
      
      <div className="container relative">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Trophy className="h-4 w-4" />
            <span>Train Like a Pro</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Choose Your <span className="gradient-text">Sport</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Unlock your potential with progressive training paths designed by elite coaches
          </p>
        </div>

        {/* Sports grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sports.map((sport, index) => (
            <Link
              key={sport.slug}
              to={`/sports/${sport.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)] animate-in opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
              
              {/* Content */}
              <div className="relative flex items-start justify-between">
                <div className="space-y-4">
                  {/* Emoji and name */}
                  <div className="flex items-center gap-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {sport.emoji}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {sport.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {sport.categories.length} training paths
                      </p>
                    </div>
                  </div>
                  
                  {/* Categories preview */}
                  <div className="flex flex-wrap gap-2">
                    {sport.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-primary" />
                      <span>Progressive levels</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-streak" />
                      <span>XP rewards</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            More sports coming soon •{" "}
            <span className="text-primary font-medium">
              Infinite progression system
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SportsSection;
