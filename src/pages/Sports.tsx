import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Circle, Target, Volleyball, Trophy, Dumbbell, Zap, ArrowRight } from "lucide-react";

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

const Sports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Choose Your Sport
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pick from 12 different sports and start improving your skills today. New drills added weekly!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sports.map((sport) => {
              const Icon = sport.icon;
              return (
                <Link
                  key={sport.slug}
                  to={`/sports/${sport.slug}`}
                  className="group flex items-center gap-4 p-6 bg-card border-2 border-border rounded-2xl shadow-soft hover:shadow-card hover:border-primary transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${sport.color}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: sport.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{sport.name}</h3>
                    <p className="text-sm text-muted-foreground">{sport.drillCount} drills</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sports;
