import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Users, Play, Lock, ArrowLeft } from "lucide-react";

const sportData: Record<string, { name: string; color: string; drills: Array<{ id: string; title: string; duration: string; difficulty: "Beginner" | "Intermediate" | "Advanced"; players: string; isPremium: boolean; xp: number }> }> = {
  football: {
    name: "Football",
    color: "#22c55e",
    drills: [
      { id: "dribbling-cone-slalom", title: "Dribbling Cone Slalom", duration: "10 min", difficulty: "Beginner", players: "Solo", isPremium: false, xp: 50 },
      { id: "wall-pass-accuracy", title: "Wall Pass Accuracy", duration: "15 min", difficulty: "Intermediate", players: "Solo", isPremium: false, xp: 75 },
      { id: "juggling-mastery", title: "Juggling Mastery", duration: "12 min", difficulty: "Beginner", players: "Solo", isPremium: false, xp: 60 },
      { id: "first-touch-drills", title: "First Touch Drills", duration: "15 min", difficulty: "Intermediate", players: "Solo", isPremium: true, xp: 80 },
      { id: "shooting-practice", title: "Shooting Practice", duration: "20 min", difficulty: "Advanced", players: "Solo", isPremium: true, xp: 100 },
      { id: "passing-combo", title: "Passing Combinations", duration: "25 min", difficulty: "Advanced", players: "2 Players", isPremium: true, xp: 120 },
    ],
  },
  basketball: {
    name: "Basketball",
    color: "#f97316",
    drills: [
      { id: "free-throw-challenge", title: "Free Throw Challenge", duration: "10 min", difficulty: "Beginner", players: "Solo", isPremium: false, xp: 50 },
      { id: "dribbling-basics", title: "Dribbling Basics", duration: "12 min", difficulty: "Beginner", players: "Solo", isPremium: false, xp: 55 },
      { id: "layup-practice", title: "Layup Practice", duration: "15 min", difficulty: "Intermediate", players: "Solo", isPremium: false, xp: 70 },
      { id: "advanced-ball-handling", title: "Advanced Ball Handling", duration: "20 min", difficulty: "Advanced", players: "Solo", isPremium: true, xp: 100 },
      { id: "three-point-shooting", title: "Three-Point Shooting", duration: "18 min", difficulty: "Advanced", players: "Solo", isPremium: true, xp: 95 },
    ],
  },
  tennis: {
    name: "Tennis",
    color: "#eab308",
    drills: [
      { id: "serve-basics", title: "Serve Basics", duration: "12 min", difficulty: "Beginner", players: "Solo", isPremium: false, xp: 55 },
      { id: "forehand-practice", title: "Forehand Practice", duration: "15 min", difficulty: "Beginner", players: "Solo", isPremium: false, xp: 60 },
      { id: "serve-return", title: "Serve & Return Practice", duration: "15 min", difficulty: "Intermediate", players: "2 Players", isPremium: true, xp: 80 },
      { id: "volley-drills", title: "Volley Drills", duration: "18 min", difficulty: "Advanced", players: "2 Players", isPremium: true, xp: 90 },
    ],
  },
};

// Default drills for sports not specifically defined
const defaultDrills = [
  { id: "basic-drill-1", title: "Basic Fundamentals", duration: "10 min", difficulty: "Beginner" as const, players: "Solo", isPremium: false, xp: 50 },
  { id: "basic-drill-2", title: "Coordination Training", duration: "12 min", difficulty: "Beginner" as const, players: "Solo", isPremium: false, xp: 55 },
  { id: "intermediate-drill-1", title: "Skill Development", duration: "15 min", difficulty: "Intermediate" as const, players: "Solo", isPremium: true, xp: 75 },
  { id: "advanced-drill-1", title: "Advanced Techniques", duration: "20 min", difficulty: "Advanced" as const, players: "2 Players", isPremium: true, xp: 100 },
];

const difficultyConfig = {
  Beginner: { color: "bg-success/20 text-success" },
  Intermediate: { color: "bg-streak/20 text-streak" },
  Advanced: { color: "bg-primary/20 text-primary" },
};

const SportDetail = () => {
  const { sportSlug } = useParams();
  const sport = sportData[sportSlug || ""] || { 
    name: sportSlug?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Sport",
    color: "#6b7280",
    drills: defaultDrills,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/sports" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sports
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4" style={{ color: sport.color }}>
              {sport.name} Drills
            </h1>
            <p className="text-lg text-muted-foreground">
              {sport.drills.length} drills available. Complete them to earn XP and maintain your streak!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sport.drills.map((drill) => (
              <div
                key={drill.id}
                className="group bg-card border-2 border-border rounded-2xl p-5 shadow-soft hover:shadow-card hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {sport.name}
                  </span>
                  <div className="flex gap-2">
                    <span className="bg-xp/20 text-xp text-xs font-bold px-2 py-1 rounded-lg">
                      +{drill.xp} XP
                    </span>
                    {drill.isPremium && (
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
                        PRO
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg text-foreground mb-4 group-hover:text-primary transition-colors">
                  {drill.title}
                </h3>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {drill.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {drill.players}
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-lg ${difficultyConfig[drill.difficulty].color}`}>
                    <Zap className="w-4 h-4" />
                    {drill.difficulty}
                  </div>
                </div>

                <Link to={`/drill/${sportSlug}/${drill.id}`}>
                  <Button
                    variant={drill.isPremium ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {drill.isPremium ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {drill.isPremium ? "Unlock to Start" : "Start Drill"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SportDetail;
