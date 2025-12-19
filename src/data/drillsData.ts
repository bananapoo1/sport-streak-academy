// Unified drill data source - single source of truth for all drill information

export interface DrillInfo {
  id: string;
  title: string;
  duration: number; // in minutes
  xp: number;
  isPremium: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  players: string;
  isBoss?: boolean; // Boss level drill
  videoUrl: string;
  instructions: string[];
}

export interface SportDrills {
  name: string;
  color: string;
  drills: DrillInfo[];
}

const createDefaultInstructions = (title: string): string[] => [
  "Warm up for 2-3 minutes with light movement",
  `Begin practicing ${title.toLowerCase()} at a slow pace`,
  "Focus on proper form and technique",
  "Gradually increase speed as you get comfortable",
  "Take short breaks if needed",
  "Push yourself but maintain control",
  "Cool down and stretch after completing",
];

// Football drills - 15 drills with boss levels
const footballDrills: DrillInfo[] = [
  // Beginner (1-5)
  { id: "fb-1", title: "Dribbling Cone Slalom", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["Set up 5-8 cones in a straight line, spaced about 1 meter apart", "Start at one end with the ball at your feet", "Dribble through the cones using the inside and outside of your feet", "Keep the ball close and your head up", "Focus on quick, controlled touches", "Turn around at the end and dribble back", "Repeat for 10 minutes, improving speed while maintaining control"] },
  { id: "fb-2", title: "Wall Pass Basics", duration: 8, xp: 45, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Wall Pass Basics") },
  { id: "fb-3", title: "Juggling Introduction", duration: 12, xp: 60, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["Start with the ball in your hands", "Drop the ball and kick it back up to your hands", "Practice with both feet alternately", "Once comfortable, try two touches before catching", "Progress to continuous juggling without catching", "Set a goal: start with 10, work up to 50+ touches"] },
  { id: "fb-4", title: "Ball Control Basics", duration: 10, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Ball Control Basics") },
  { id: "fb-5", title: "Passing Precision", duration: 10, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Passing Precision") },
  // Intermediate (6-10)
  { id: "fb-6", title: "Wall Pass Accuracy", duration: 15, xp: 75, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["Find a solid wall without windows or obstacles", "Mark a target area on the wall", "Stand 3-5 meters from the wall", "Pass the ball with your right foot to the target", "Control the return and pass with your left foot", "Increase distance as accuracy improves", "Track your hit percentage"] },
  { id: "fb-7", title: "First Touch Drills", duration: 15, xp: 80, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("First Touch Drills") },
  { id: "fb-8", title: "Advanced Dribbling", duration: 18, xp: 85, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Advanced Dribbling") },
  { id: "fb-9", title: "Turn & Shield", duration: 12, xp: 70, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Turn & Shield") },
  { id: "fb-10", title: "⚽ Skill Showdown", duration: 25, xp: 150, isPremium: false, difficulty: "intermediate", players: "Solo", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["This is a BOSS level - combine all skills learned!", "Complete 20 cone dribbles with direction changes", "Execute 30 successful wall passes", "Maintain 50 ball juggles", "Perform 5 different turns with the ball", "Complete the full circuit in under 15 minutes"] },
  // Advanced (11-15)
  { id: "fb-11", title: "Shooting Practice", duration: 20, xp: 100, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Shooting Practice") },
  { id: "fb-12", title: "Passing Combinations", duration: 25, xp: 120, isPremium: true, difficulty: "advanced", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Passing Combinations") },
  { id: "fb-13", title: "Speed Dribbling", duration: 15, xp: 90, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Speed Dribbling") },
  { id: "fb-14", title: "Volleys & Half-Volleys", duration: 18, xp: 95, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Volleys & Half-Volleys") },
  { id: "fb-15", title: "🏆 Championship Challenge", duration: 30, xp: 200, isPremium: true, difficulty: "advanced", players: "Solo", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["FINAL BOSS - Master all football skills!", "Score 10 goals from different positions", "Complete 100 successful passes", "Dribble through a complex obstacle course", "Demonstrate 10 different skill moves", "Complete within 30 minutes for max XP"] },
];

// Basketball drills
const basketballDrills: DrillInfo[] = [
  { id: "bb-1", title: "Dribbling Basics", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Dribbling Basics") },
  { id: "bb-2", title: "Free Throw Introduction", duration: 12, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["Stand at the free-throw line with proper stance", "Bend knees slightly, feet shoulder-width apart", "Hold the ball with shooting hand under, guide hand on side", "Focus on the front of the rim", "Extend your arm and snap your wrist on release", "Follow through pointing at the basket", "Shoot 50 free throws and track percentage"] },
  { id: "bb-3", title: "Passing Fundamentals", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Passing Fundamentals") },
  { id: "bb-4", title: "Defensive Stance", duration: 8, xp: 45, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Defensive Stance") },
  { id: "bb-5", title: "Layup Practice", duration: 15, xp: 70, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Layup Practice") },
  { id: "bb-6", title: "Crossover Moves", duration: 15, xp: 75, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Crossover Moves") },
  { id: "bb-7", title: "Pick & Roll Basics", duration: 18, xp: 80, isPremium: false, difficulty: "intermediate", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Pick & Roll Basics") },
  { id: "bb-8", title: "Post Moves", duration: 20, xp: 85, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Post Moves") },
  { id: "bb-9", title: "Shooting off Screens", duration: 15, xp: 75, isPremium: false, difficulty: "intermediate", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Shooting off Screens") },
  { id: "bb-10", title: "🏀 Court Commander", duration: 25, xp: 150, isPremium: false, difficulty: "intermediate", players: "Solo", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["BOSS LEVEL - Show your court mastery!", "Make 20 layups in a row", "Hit 15 free throws", "Complete 50 crossover dribbles", "Execute 10 successful pick & roll plays", "Finish within time limit for bonus XP"] },
  { id: "bb-11", title: "Advanced Ball Handling", duration: 20, xp: 100, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["Start with basic stationary dribbles", "Practice crossovers: right to left, left to right", "Add between-the-legs dribbles", "Include behind-the-back moves", "Combine moves into combos", "Practice at game speed", "Do each combo for 2 minutes"] },
  { id: "bb-12", title: "Three-Point Shooting", duration: 18, xp: 95, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Three-Point Shooting") },
  { id: "bb-13", title: "Fadeaway Jumper", duration: 15, xp: 90, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Fadeaway Jumper") },
  { id: "bb-14", title: "Fast Break Drills", duration: 20, xp: 100, isPremium: true, difficulty: "advanced", players: "3+ Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Fast Break Drills") },
  { id: "bb-15", title: "🏆 All-Star Challenge", duration: 30, xp: 200, isPremium: true, difficulty: "advanced", players: "Solo", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["FINAL BOSS - Become an All-Star!", "Score from all positions on the court", "Complete full-court dribbling course", "Make 25 three-pointers", "Execute 15 different moves", "Finish the ultimate basketball challenge"] },
];

// Tennis drills
const tennisDrills: DrillInfo[] = [
  { id: "tn-1", title: "Serve Basics", duration: 12, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Serve Basics") },
  { id: "tn-2", title: "Forehand Introduction", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Forehand Introduction") },
  { id: "tn-3", title: "Backhand Basics", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Backhand Basics") },
  { id: "tn-4", title: "Court Movement", duration: 12, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Court Movement") },
  { id: "tn-5", title: "Ready Position", duration: 8, xp: 45, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Ready Position") },
  { id: "tn-6", title: "Backhand Practice", duration: 15, xp: 70, isPremium: false, difficulty: "intermediate", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Backhand Practice") },
  { id: "tn-7", title: "Serve & Return", duration: 15, xp: 80, isPremium: false, difficulty: "intermediate", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["One player serves from the baseline", "Partner stands in ready position to return", "Server varies placement: wide, body, T", "Returner focuses on getting racket back early", "Switch roles every 10 serves", "Track successful returns vs errors"] },
  { id: "tn-8", title: "Approach Shots", duration: 15, xp: 75, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Approach Shots") },
  { id: "tn-9", title: "Slice Shots", duration: 12, xp: 70, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Slice Shots") },
  { id: "tn-10", title: "🎾 Rally Royale", duration: 25, xp: 150, isPremium: false, difficulty: "intermediate", players: "2 Players", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["BOSS LEVEL - Dominate the rally!", "Complete 50 consecutive forehand rallies", "Complete 50 consecutive backhand rallies", "Win 10 serve games", "Execute 20 approach shot winners", "Prove your intermediate mastery"] },
  { id: "tn-11", title: "Volley Drills", duration: 18, xp: 90, isPremium: true, difficulty: "advanced", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Volley Drills") },
  { id: "tn-12", title: "Power Serve", duration: 20, xp: 95, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Power Serve") },
  { id: "tn-13", title: "Drop Shot Mastery", duration: 15, xp: 85, isPremium: true, difficulty: "advanced", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Drop Shot Mastery") },
  { id: "tn-14", title: "Overhead Smash", duration: 15, xp: 90, isPremium: true, difficulty: "advanced", players: "2 Players", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Overhead Smash") },
  { id: "tn-15", title: "🏆 Grand Slam Glory", duration: 30, xp: 200, isPremium: true, difficulty: "advanced", players: "2 Players", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["FINAL BOSS - Win the Grand Slam!", "Ace 10 serves in a row", "Win 3 tiebreak sets", "Execute every shot type successfully", "Complete the ultimate tennis challenge", "Claim your championship"] },
];

// Default drills for other sports
const createDefaultDrills = (sportName: string): DrillInfo[] => [
  { id: "def-1", title: "Basic Fundamentals", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions(`${sportName} Basic Fundamentals`) },
  { id: "def-2", title: "Coordination Training", duration: 12, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Coordination Training") },
  { id: "def-3", title: "Movement Basics", duration: 10, xp: 50, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Movement Basics") },
  { id: "def-4", title: "Stamina Building", duration: 15, xp: 60, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Stamina Building") },
  { id: "def-5", title: "Core Techniques", duration: 12, xp: 55, isPremium: false, difficulty: "beginner", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Core Techniques") },
  { id: "def-6", title: "Skill Development", duration: 15, xp: 75, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Skill Development") },
  { id: "def-7", title: "Advanced Movement", duration: 18, xp: 80, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Advanced Movement") },
  { id: "def-8", title: "Speed Training", duration: 15, xp: 75, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Speed Training") },
  { id: "def-9", title: "Technique Refinement", duration: 20, xp: 85, isPremium: false, difficulty: "intermediate", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Technique Refinement") },
  { id: "def-10", title: "⭐ Skill Checkpoint", duration: 25, xp: 150, isPremium: false, difficulty: "intermediate", players: "Solo", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["BOSS LEVEL - Prove your skills!", "Demonstrate all beginner techniques", "Complete the intermediate challenges", "Show consistency in your movements", "Finish within the time limit"] },
  { id: "def-11", title: "Advanced Techniques", duration: 20, xp: 100, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Advanced Techniques") },
  { id: "def-12", title: "Competition Prep", duration: 25, xp: 110, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Competition Prep") },
  { id: "def-13", title: "Elite Performance", duration: 20, xp: 100, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Elite Performance") },
  { id: "def-14", title: "Peak Training", duration: 25, xp: 115, isPremium: true, difficulty: "advanced", players: "Solo", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: createDefaultInstructions("Peak Training") },
  { id: "def-15", title: "🏆 Master Challenge", duration: 30, xp: 200, isPremium: true, difficulty: "advanced", players: "Solo", isBoss: true, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", instructions: ["FINAL BOSS - Become a Master!", "Complete all previous challenges", "Demonstrate elite-level techniques", "Push your limits to the max", "Claim your mastery title"] },
];

// Sport data registry
export const sportsData: Record<string, SportDrills> = {
  football: { name: "Football", color: "#22c55e", drills: footballDrills },
  basketball: { name: "Basketball", color: "#f97316", drills: basketballDrills },
  tennis: { name: "Tennis", color: "#eab308", drills: tennisDrills },
};

// Get sport data with fallback for unknown sports
export const getSportData = (sportSlug: string): SportDrills => {
  if (sportsData[sportSlug]) {
    return sportsData[sportSlug];
  }
  
  const formattedName = sportSlug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  
  return {
    name: formattedName,
    color: "#6b7280",
    drills: createDefaultDrills(formattedName),
  };
};

// Get a specific drill by sport and drill ID
export const getDrill = (sportSlug: string, drillId: string): DrillInfo | null => {
  const sport = getSportData(sportSlug);
  return sport.drills.find(d => d.id === drillId) || null;
};
