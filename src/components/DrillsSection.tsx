import { Link } from "react-router-dom";
import DrillCard from "@/components/DrillCard";

const sampleDrills = [
  { id: "dribbling-cone-slalom", sportSlug: "football", title: "Dribbling Cone Slalom", sport: "Football", duration: "10 min", difficulty: "Beginner" as const, players: "Solo", isPremium: false },
  { id: "wall-pass-accuracy", sportSlug: "football", title: "Wall Pass Accuracy", sport: "Football", duration: "15 min", difficulty: "Intermediate" as const, players: "Solo", isPremium: false },
  { id: "free-throw-challenge", sportSlug: "basketball", title: "Free Throw Challenge", sport: "Basketball", duration: "10 min", difficulty: "Beginner" as const, players: "Solo", isPremium: false },
  { id: "advanced-ball-handling", sportSlug: "basketball", title: "Advanced Ball Handling", sport: "Basketball", duration: "20 min", difficulty: "Advanced" as const, players: "Solo", isPremium: true },
  { id: "serve-return", sportSlug: "tennis", title: "Serve & Return Practice", sport: "Tennis", duration: "15 min", difficulty: "Intermediate" as const, players: "2 Players", isPremium: true },
  { id: "basic-drill-1", sportSlug: "golf", title: "Putting Precision", sport: "Golf", duration: "12 min", difficulty: "Beginner" as const, players: "Solo", isPremium: false },
];

export const DrillsSection = () => {
  return (
    <section id="drills" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Popular Drills
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete one drill a day to maintain your streak. Free users get access to beginner drills - upgrade for unlimited access!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleDrills.map((drill, index) => (
            <div key={drill.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <Link to={`/drill/${drill.sportSlug}/${drill.id}`}>
                <DrillCard {...drill} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DrillsSection;
