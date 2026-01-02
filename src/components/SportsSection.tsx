import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sports = [
  { slug: "football", name: "Football", emoji: "⚽", drillCount: 85, color: "22 163 74" },
  { slug: "basketball", name: "Basketball", emoji: "🏀", drillCount: 72, color: "249 115 22" },
  { slug: "tennis", name: "Tennis", emoji: "🎾", drillCount: 54, color: "234 179 8" },
  { slug: "golf", name: "Golf", emoji: "⛳", drillCount: 48, color: "22 163 74" },
  { slug: "cricket", name: "Cricket", emoji: "🏏", drillCount: 62, color: "59 130 246" },
  { slug: "padel", name: "Padel", emoji: "🎾", drillCount: 38, color: "139 92 246" },
  { slug: "rugby", name: "Rugby", emoji: "🏉", drillCount: 56, color: "220 38 38" },
  { slug: "table-tennis", name: "Table Tennis", emoji: "🏓", drillCount: 42, color: "14 165 233" },
  { slug: "baseball", name: "Baseball", emoji: "⚾", drillCount: 64, color: "239 68 68" },
  { slug: "american-football", name: "American Football", emoji: "🏈", drillCount: 58, color: "133 77 14" },
  { slug: "field-hockey", name: "Field Hockey", emoji: "🏑", drillCount: 44, color: "13 148 136" },
  { slug: "volleyball", name: "Volleyball", emoji: "🏐", drillCount: 52, color: "217 70 239" },
];

export const SportsSection = () => {
  return (
    <section id="sports" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            12 Sports Available
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Choose Your Sport
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master any sport with structured drills designed by coaches. New content added weekly.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sports.map((sport, index) => (
            <Link
              key={sport.slug}
              to={`/sports/${sport.slug}`}
              className="animate-fade-in group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Hover gradient */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, rgb(${sport.color} / 0.1), transparent)` }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">{sport.name}</h3>
                <p className="text-sm text-muted-foreground">{sport.drillCount} drills</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsSection;