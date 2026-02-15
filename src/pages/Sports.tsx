import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const Sports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              12 Sports Available
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Choose Your Sport
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master any sport with structured drills designed by coaches. New content added weekly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sports.map((sport, index) => (
              <Link
                key={sport.slug}
                to={`/sports/${sport.slug}`}
                className="animate-fade-in group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Hover gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, rgb(${sport.color} / 0.1), transparent)` }}
                />
                
                <div className="relative z-10 flex items-center gap-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{sport.name}</h3>
                    <p className="text-sm text-muted-foreground">{sport.drillCount} drills</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sports;