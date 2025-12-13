import { Link } from "react-router-dom";
import {
  Circle,
  Target,
  Volleyball,
  Trophy,
  Dumbbell,
  Zap,
} from "lucide-react";

// Using appropriate icons for each sport
const sports = [
  { slug: "football", name: "Football", icon: Circle, drillCount: 85, color: "#22c55e" },
  { slug: "basketball", name: "Basketball", icon: Circle, drillCount: 72, color: "#f97316" },
  { slug: "tennis", name: "Tennis", icon: Target, drillCount: 54, color: "#eab308" },
  { slug: "golf", name: "Golf", icon: Target, drillCount: 48, color: "#16a34a" },
  { slug: "cricket", name: "Cricket", icon: Dumbbell, drillCount: 62, color: "#3b82f6" },
  { slug: "padel", name: "Padel", icon: Target, drillCount: 38, color: "#8b5cf6" },
  { slug: "rugby", name: "Rugby", icon: Volleyball, drillCount: 56, color: "#dc2626" },
  { slug: "table-tennis", name: "Table Tennis", icon: Circle, drillCount: 42, color: "#0ea5e9" },
  { slug: "baseball", name: "Baseball", icon: Circle, drillCount: 64, color: "#ef4444" },
  { slug: "american-football", name: "American Football", icon: Trophy, drillCount: 58, color: "#854d0e" },
  { slug: "field-hockey", name: "Field Hockey", icon: Zap, drillCount: 44, color: "#0d9488" },
  { slug: "volleyball", name: "Volleyball", icon: Volleyball, drillCount: 52, color: "#d946ef" },
];

export const SportsSection = () => {
  return (
    <section id="sports" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Choose Your Sport
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick from 12 different sports and start improving your skills today. New drills added weekly!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sports.map((sport, index) => {
            const Icon = sport.icon;
            return (
              <Link
                key={sport.slug}
                to={`/sports/${sport.slug}`}
                className="animate-fade-in group flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl shadow-soft hover:shadow-card hover:border-primary transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${sport.color}20` }}
                >
                  <Icon className="w-8 h-8" style={{ color: sport.color }} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-foreground">{sport.name}</h3>
                  <p className="text-sm text-muted-foreground">{sport.drillCount} drills</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SportsSection;
