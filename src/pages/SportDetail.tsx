import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import DrillTree, { Drill } from "@/components/DrillTree";

interface SportData {
  name: string;
  color: string;
  beginner: Drill[];
  intermediate: Drill[];
  advanced: Drill[];
}

const sportData: Record<string, SportData> = {
  football: {
    name: "Football",
    color: "#22c55e",
    beginner: [
      { id: "dribbling-cone-slalom", title: "Dribbling Cone Slalom", duration: "10 min", xp: 50, isCompleted: true, isUnlocked: true, isPremium: false },
      { id: "wall-pass-basic", title: "Wall Pass Basics", duration: "8 min", xp: 45, isCompleted: true, isUnlocked: true, isPremium: false },
      { id: "juggling-intro", title: "Juggling Introduction", duration: "12 min", xp: 60, isCompleted: false, isUnlocked: true, isPremium: false },
      { id: "ball-control-basics", title: "Ball Control Basics", duration: "10 min", xp: 55, isCompleted: false, isUnlocked: false, isPremium: false },
    ],
    intermediate: [
      { id: "wall-pass-accuracy", title: "Wall Pass Accuracy", duration: "15 min", xp: 75, isCompleted: false, isUnlocked: false, isPremium: false },
      { id: "first-touch-drills", title: "First Touch Drills", duration: "15 min", xp: 80, isCompleted: false, isUnlocked: false, isPremium: true },
      { id: "dribbling-advanced", title: "Advanced Dribbling", duration: "18 min", xp: 85, isCompleted: false, isUnlocked: false, isPremium: true },
    ],
    advanced: [
      { id: "shooting-practice", title: "Shooting Practice", duration: "20 min", xp: 100, isCompleted: false, isUnlocked: false, isPremium: true },
      { id: "passing-combo", title: "Passing Combinations", duration: "25 min", xp: 120, isCompleted: false, isUnlocked: false, isPremium: true },
    ],
  },
  basketball: {
    name: "Basketball",
    color: "#f97316",
    beginner: [
      { id: "dribbling-basics", title: "Dribbling Basics", duration: "10 min", xp: 50, isCompleted: true, isUnlocked: true, isPremium: false },
      { id: "free-throw-intro", title: "Free Throw Introduction", duration: "12 min", xp: 55, isCompleted: false, isUnlocked: true, isPremium: false },
      { id: "passing-fundamentals", title: "Passing Fundamentals", duration: "10 min", xp: 50, isCompleted: false, isUnlocked: false, isPremium: false },
    ],
    intermediate: [
      { id: "layup-practice", title: "Layup Practice", duration: "15 min", xp: 70, isCompleted: false, isUnlocked: false, isPremium: false },
      { id: "crossover-moves", title: "Crossover Moves", duration: "15 min", xp: 75, isCompleted: false, isUnlocked: false, isPremium: true },
    ],
    advanced: [
      { id: "advanced-ball-handling", title: "Advanced Ball Handling", duration: "20 min", xp: 100, isCompleted: false, isUnlocked: false, isPremium: true },
      { id: "three-point-shooting", title: "Three-Point Shooting", duration: "18 min", xp: 95, isCompleted: false, isUnlocked: false, isPremium: true },
    ],
  },
  tennis: {
    name: "Tennis",
    color: "#eab308",
    beginner: [
      { id: "serve-basics", title: "Serve Basics", duration: "12 min", xp: 55, isCompleted: false, isUnlocked: true, isPremium: false },
      { id: "forehand-intro", title: "Forehand Introduction", duration: "10 min", xp: 50, isCompleted: false, isUnlocked: false, isPremium: false },
    ],
    intermediate: [
      { id: "backhand-practice", title: "Backhand Practice", duration: "15 min", xp: 70, isCompleted: false, isUnlocked: false, isPremium: true },
    ],
    advanced: [
      { id: "volley-drills", title: "Volley Drills", duration: "18 min", xp: 90, isCompleted: false, isUnlocked: false, isPremium: true },
    ],
  },
};

// Default drills for sports not specifically defined
const getDefaultDrills = (sportName: string): SportData => ({
  name: sportName,
  color: "#6b7280",
  beginner: [
    { id: "basic-drill-1", title: "Basic Fundamentals", duration: "10 min", xp: 50, isCompleted: false, isUnlocked: true, isPremium: false },
    { id: "basic-drill-2", title: "Coordination Training", duration: "12 min", xp: 55, isCompleted: false, isUnlocked: false, isPremium: false },
  ],
  intermediate: [
    { id: "intermediate-drill-1", title: "Skill Development", duration: "15 min", xp: 75, isCompleted: false, isUnlocked: false, isPremium: true },
  ],
  advanced: [
    { id: "advanced-drill-1", title: "Advanced Techniques", duration: "20 min", xp: 100, isCompleted: false, isUnlocked: false, isPremium: true },
  ],
});

const SportDetail = () => {
  const { sportSlug } = useParams();
  const formattedName = sportSlug?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Sport";
  const sport = sportData[sportSlug || ""] || getDefaultDrills(formattedName);

  const totalDrills = sport.beginner.length + sport.intermediate.length + sport.advanced.length;
  const completedDrills = [...sport.beginner, ...sport.intermediate, ...sport.advanced].filter(d => d.isCompleted).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/sports" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sports
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4" style={{ color: sport.color }}>
              {sport.name} Drills
            </h1>
            <p className="text-lg text-muted-foreground">
              {completedDrills}/{totalDrills} drills completed. Complete drills in order to unlock the next one!
            </p>
          </div>

          <DrillTree
            title="Beginner"
            level="beginner"
            drills={sport.beginner}
            sportSlug={sportSlug || ""}
          />

          <DrillTree
            title="Intermediate"
            level="intermediate"
            drills={sport.intermediate}
            sportSlug={sportSlug || ""}
          />

          <DrillTree
            title="Advanced"
            level="advanced"
            drills={sport.advanced}
            sportSlug={sportSlug || ""}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SportDetail;