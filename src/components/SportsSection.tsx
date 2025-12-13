import SportCard from "@/components/SportCard";
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
  { name: "Football", icon: Circle, drillCount: 85, color: "#22c55e" },
  { name: "Basketball", icon: Circle, drillCount: 72, color: "#f97316" },
  { name: "Tennis", icon: Target, drillCount: 54, color: "#eab308" },
  { name: "Golf", icon: Target, drillCount: 48, color: "#16a34a" },
  { name: "Cricket", icon: Dumbbell, drillCount: 62, color: "#3b82f6" },
  { name: "Padel", icon: Target, drillCount: 38, color: "#8b5cf6" },
  { name: "Rugby", icon: Volleyball, drillCount: 56, color: "#dc2626" },
  { name: "Table Tennis", icon: Circle, drillCount: 42, color: "#0ea5e9" },
  { name: "Baseball", icon: Circle, drillCount: 64, color: "#ef4444" },
  { name: "American Football", icon: Trophy, drillCount: 58, color: "#854d0e" },
  { name: "Field Hockey", icon: Zap, drillCount: 44, color: "#0d9488" },
  { name: "Volleyball", icon: Volleyball, drillCount: 52, color: "#d946ef" },
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
          {sports.map((sport, index) => (
            <div
              key={sport.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <SportCard
                name={sport.name}
                icon={sport.icon}
                drillCount={sport.drillCount}
                color={sport.color}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsSection;
