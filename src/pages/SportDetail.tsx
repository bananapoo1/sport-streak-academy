import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import DrillTree, { Drill } from "@/components/DrillTree";
import { useCompletedDrills } from "@/hooks/useCompletedDrills";

interface DrillData {
  id: string;
  title: string;
  duration: string;
  xp: number;
  isPremium: boolean;
}

interface SportData {
  name: string;
  color: string;
  beginner: DrillData[];
  intermediate: DrillData[];
  advanced: DrillData[];
}

const sportData: Record<string, SportData> = {
  football: {
    name: "Football",
    color: "#22c55e",
    beginner: [
      { id: "dribbling-cone-slalom", title: "Dribbling Cone Slalom", duration: "10 min", xp: 50, isPremium: false },
      { id: "wall-pass-basic", title: "Wall Pass Basics", duration: "8 min", xp: 45, isPremium: false },
      { id: "juggling-intro", title: "Juggling Introduction", duration: "12 min", xp: 60, isPremium: false },
      { id: "ball-control-basics", title: "Ball Control Basics", duration: "10 min", xp: 55, isPremium: false },
    ],
    intermediate: [
      { id: "wall-pass-accuracy", title: "Wall Pass Accuracy", duration: "15 min", xp: 75, isPremium: false },
      { id: "first-touch-drills", title: "First Touch Drills", duration: "15 min", xp: 80, isPremium: true },
      { id: "dribbling-advanced", title: "Advanced Dribbling", duration: "18 min", xp: 85, isPremium: true },
    ],
    advanced: [
      { id: "shooting-practice", title: "Shooting Practice", duration: "20 min", xp: 100, isPremium: true },
      { id: "passing-combo", title: "Passing Combinations", duration: "25 min", xp: 120, isPremium: true },
    ],
  },
  basketball: {
    name: "Basketball",
    color: "#f97316",
    beginner: [
      { id: "dribbling-basics", title: "Dribbling Basics", duration: "10 min", xp: 50, isPremium: false },
      { id: "free-throw-intro", title: "Free Throw Introduction", duration: "12 min", xp: 55, isPremium: false },
      { id: "passing-fundamentals", title: "Passing Fundamentals", duration: "10 min", xp: 50, isPremium: false },
    ],
    intermediate: [
      { id: "layup-practice", title: "Layup Practice", duration: "15 min", xp: 70, isPremium: false },
      { id: "crossover-moves", title: "Crossover Moves", duration: "15 min", xp: 75, isPremium: true },
    ],
    advanced: [
      { id: "advanced-ball-handling", title: "Advanced Ball Handling", duration: "20 min", xp: 100, isPremium: true },
      { id: "three-point-shooting", title: "Three-Point Shooting", duration: "18 min", xp: 95, isPremium: true },
    ],
  },
  tennis: {
    name: "Tennis",
    color: "#eab308",
    beginner: [
      { id: "serve-basics", title: "Serve Basics", duration: "12 min", xp: 55, isPremium: false },
      { id: "forehand-intro", title: "Forehand Introduction", duration: "10 min", xp: 50, isPremium: false },
    ],
    intermediate: [
      { id: "backhand-practice", title: "Backhand Practice", duration: "15 min", xp: 70, isPremium: true },
    ],
    advanced: [
      { id: "volley-drills", title: "Volley Drills", duration: "18 min", xp: 90, isPremium: true },
    ],
  },
};

// Default drills for sports not specifically defined
const getDefaultDrills = (sportName: string): SportData => ({
  name: sportName,
  color: "#6b7280",
  beginner: [
    { id: "basic-drill-1", title: "Basic Fundamentals", duration: "10 min", xp: 50, isPremium: false },
    { id: "basic-drill-2", title: "Coordination Training", duration: "12 min", xp: 55, isPremium: false },
  ],
  intermediate: [
    { id: "intermediate-drill-1", title: "Skill Development", duration: "15 min", xp: 75, isPremium: true },
  ],
  advanced: [
    { id: "advanced-drill-1", title: "Advanced Techniques", duration: "20 min", xp: 100, isPremium: true },
  ],
});

// Calculate which drills are unlocked based on completion
const calculateUnlockedDrills = (
  drills: DrillData[],
  isDrillCompleted: (id: string) => boolean,
  previousLevelComplete: boolean
): Drill[] => {
  let canUnlock = previousLevelComplete;
  return drills.map((drill, index) => {
    const isCompleted = isDrillCompleted(drill.id);
    const isUnlocked = canUnlock;
    
    // For the first drill in a level, it's unlocked if previous level is complete
    // For subsequent drills, they unlock when the previous drill is completed
    if (index === 0) {
      canUnlock = isCompleted;
    } else {
      canUnlock = isCompleted;
    }
    
    return {
      ...drill,
      isCompleted,
      isUnlocked: index === 0 ? previousLevelComplete : isDrillCompleted(drills[index - 1].id),
    };
  });
};

const SportDetail = () => {
  const { sportSlug } = useParams();
  const { isDrillCompleted, loading } = useCompletedDrills(sportSlug);
  const formattedName = sportSlug?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Sport";
  const sportBase = sportData[sportSlug || ""] || getDefaultDrills(formattedName);

  // Calculate unlock status dynamically
  const beginnerDrills = calculateUnlockedDrills(sportBase.beginner, isDrillCompleted, true);
  const beginnerComplete = beginnerDrills.every(d => d.isCompleted);
  
  const intermediateDrills = calculateUnlockedDrills(sportBase.intermediate, isDrillCompleted, beginnerComplete);
  const intermediateComplete = intermediateDrills.every(d => d.isCompleted);
  
  const advancedDrills = calculateUnlockedDrills(sportBase.advanced, isDrillCompleted, intermediateComplete);

  const allDrills = [...beginnerDrills, ...intermediateDrills, ...advancedDrills];
  const totalDrills = allDrills.length;
  const completedDrillsCount = allDrills.filter(d => d.isCompleted).length;

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
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4" style={{ color: sportBase.color }}>
              {sportBase.name} Drills
            </h1>
            <p className="text-lg text-muted-foreground">
              {loading ? "Loading..." : `${completedDrillsCount}/${totalDrills} drills completed. Complete drills in order to unlock the next one!`}
            </p>
          </div>

          <DrillTree
            title="Beginner"
            level="beginner"
            drills={beginnerDrills}
            sportSlug={sportSlug || ""}
          />

          <DrillTree
            title="Intermediate"
            level="intermediate"
            drills={intermediateDrills}
            sportSlug={sportSlug || ""}
          />

          <DrillTree
            title="Advanced"
            level="advanced"
            drills={advancedDrills}
            sportSlug={sportSlug || ""}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SportDetail;