import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileQuickActions from "@/components/MobileQuickActions";
import TabSkeleton from "@/components/TabSkeleton";

const sports = [
  { slug: "football", name: "Football", emoji: "⚽", drillCount: 60, color: "22 163 74" },
  { slug: "basketball", name: "Basketball", emoji: "🏀", drillCount: 45, color: "249 115 22" },
  { slug: "tennis", name: "Tennis", emoji: "🎾", drillCount: 45, color: "234 179 8" },
  { slug: "golf", name: "Golf", emoji: "⛳", drillCount: 45, color: "22 163 74" },
  { slug: "cricket", name: "Cricket", emoji: "🏏", drillCount: 45, color: "59 130 246" },
  { slug: "rugby", name: "Rugby", emoji: "🏉", drillCount: 45, color: "220 38 38" },
  { slug: "field-hockey", name: "Hockey", emoji: "🏑", drillCount: 45, color: "13 148 136" },
  { slug: "padel", name: "Padel", emoji: "🎾", drillCount: 45, color: "139 92 246" },
];

const Sports = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <MobileQuickActions />
        {loading ? (
          <TabSkeleton />
        ) : (
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                8 Sports Available
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-3">Choose Your Sport</h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                Master any sport with structured drills designed by coaches.
              </p>
            </div>

            {sports.length === 0 ? (
              <div className="max-w-md mx-auto rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                <p className="font-semibold text-foreground">No sports available yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for new training categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {sports.map((sport, index) => (
                  <Link
                    key={sport.slug}
                    to={`/sports/${sport.slug}`}
                    className="animate-fade-in group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-5 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                      style={{ background: `linear-gradient(135deg, rgb(${sport.color} / 0.1), transparent)` }}
                    />

                    <div className="relative z-10 flex flex-col items-center text-center gap-2">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.emoji}</span>
                      <div>
                        <h3 className="font-bold text-foreground text-base">{sport.name}</h3>
                        <p className="text-xs text-muted-foreground">{sport.drillCount} drills</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Sports;
