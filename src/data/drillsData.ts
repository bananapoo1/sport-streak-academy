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
  category?: string; // Category for paid users
}

export interface DrillCategory {
  name: string;
  description: string;
  drills: DrillInfo[];
}

export interface SportDrills {
  name: string;
  color: string;
  drills: DrillInfo[];
  categories?: DrillCategory[]; // Categories for paid users
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

// Helper to generate drills for a category
const generateDrillsForCategory = (
  sport: string,
  category: string,
  baseId: string,
  count: number,
  variations: string[]
): DrillInfo[] => {
  const drills: DrillInfo[] = [];
  const difficulties: Array<"beginner" | "intermediate" | "advanced"> = ["beginner", "intermediate", "advanced"];
  
  for (let i = 0; i < count; i++) {
    const difficultyIndex = Math.floor(i / (count / 3));
    const difficulty = difficulties[Math.min(difficultyIndex, 2)];
    const variationIndex = i % variations.length;
    const isBoss = (i + 1) % 10 === 0;
    const isPremium = difficulty === "advanced" || i > count * 0.6;
    
    const baseXp = difficulty === "beginner" ? 50 : difficulty === "intermediate" ? 75 : 100;
    const xp = isBoss ? 150 + (Math.floor(i / 10) * 50) : baseXp + (i * 2);
    const duration = isBoss ? 25 : 8 + Math.floor(i / 10) * 2;
    
    drills.push({
      id: `${baseId}-${i + 1}`,
      title: isBoss 
        ? `🏆 ${category} Master Level ${Math.floor((i + 1) / 10)}`
        : `${variations[variationIndex]} ${category} ${difficulty === "beginner" ? "Basics" : difficulty === "intermediate" ? "Training" : "Mastery"} ${Math.floor(i / variations.length) + 1}`,
      duration,
      xp,
      isPremium,
      difficulty,
      players: "Solo",
      isBoss,
      category,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: createDefaultInstructions(`${category} ${variations[variationIndex]}`),
    });
  }
  
  return drills;
};

// Football - 100 drills per category (500+ total)
const footballDribblingDrills = generateDrillsForCategory(
  "Football", "Dribbling", "fb-drib",
  100,
  ["Cone Slalom", "Figure 8", "Speed", "Inside-Outside", "La Croqueta", "Drag Back", "Stepover", "Scissors", "Elastico", "Roulette", "Maradona Turn", "Cruyff Turn"]
);

const footballControlDrills = generateDrillsForCategory(
  "Football", "Control", "fb-ctrl",
  100,
  ["First Touch", "Ball Mastery", "Juggling", "Chest Control", "Thigh Control", "Sole Roll", "Inside Touch", "Outside Touch", "Aerial Control", "Bounce Control", "Spin Control", "Cushion Touch"]
);

const footballPassingDrills = generateDrillsForCategory(
  "Football", "Passing", "fb-pass",
  100,
  ["Wall Pass", "Long Pass", "Through Ball", "Chip Pass", "One-Touch", "Driven Pass", "Cross Field", "Triangle Passing", "Give and Go", "Switch Play", "Back Pass", "Lobbed Pass"]
);

const footballShootingDrills = generateDrillsForCategory(
  "Football", "Shooting", "fb-shot",
  100,
  ["Power Shot", "Finesse Shot", "Volley", "Half-Volley", "Chip Shot", "Driven Shot", "Curling Shot", "Placed Shot", "One-Touch Finish", "Header", "Outside Foot", "Acrobatic Finish"]
);

const footballTricksDrills = generateDrillsForCategory(
  "Football", "Tricks", "fb-trick",
  50,
  ["Rainbow Flick", "Heel Flick", "Sombrero", "Rabona", "Around the World", "Scorpion Kick", "Bicycle Kick", "Hocus Pocus"]
);

const allFootballDrills = [
  ...footballDribblingDrills,
  ...footballControlDrills,
  ...footballPassingDrills,
  ...footballShootingDrills,
  ...footballTricksDrills,
];

const footballCategories: DrillCategory[] = [
  { name: "Dribbling", description: "Master ball control while moving at speed", drills: footballDribblingDrills },
  { name: "Control", description: "Perfect your first touch and ball mastery", drills: footballControlDrills },
  { name: "Passing", description: "Improve accuracy and passing technique", drills: footballPassingDrills },
  { name: "Shooting", description: "Score goals with power and precision", drills: footballShootingDrills },
  { name: "Tricks", description: "Learn flashy skills and showboat moves", drills: footballTricksDrills },
];

// Basketball - 100 drills per category
const basketballBallHandlingDrills = generateDrillsForCategory(
  "Basketball", "Ball Handling", "bb-handle",
  100,
  ["Stationary Dribble", "Crossover", "Between Legs", "Behind Back", "Spider", "Pound Dribble", "Hesitation", "In-and-Out", "Killer Crossover", "Shamgod", "Double Cross", "Combo Moves"]
);

const basketballShootingDrills = generateDrillsForCategory(
  "Basketball", "Shooting", "bb-shoot",
  100,
  ["Free Throw", "Mid-Range", "Three-Point", "Floater", "Fadeaway", "Step-Back", "Pull-Up", "Catch & Shoot", "Off-Screen", "Corner Three", "Bank Shot", "Post Fadeaway"]
);

const basketballPassingDrills = generateDrillsForCategory(
  "Basketball", "Passing", "bb-pass",
  50,
  ["Chest Pass", "Bounce Pass", "Overhead Pass", "No-Look", "Behind Back Pass", "Skip Pass", "Entry Pass", "Baseball Pass"]
);

const basketballDefenseDrills = generateDrillsForCategory(
  "Basketball", "Defense", "bb-def",
  50,
  ["Defensive Stance", "Closeout", "Box Out", "Help Defense", "On-Ball Defense", "Rotation", "Steal Technique", "Shot Block"]
);

const basketballTeamPlayDrills = generateDrillsForCategory(
  "Basketball", "Team Play", "bb-team",
  100,
  ["Pick and Roll", "Pick and Pop", "Give and Go", "Fast Break", "Post Play", "Screen Setting", "Cutting", "Spacing", "Motion Offense", "Transition", "Out of Bounds", "Press Break"]
);

const allBasketballDrills = [
  ...basketballBallHandlingDrills,
  ...basketballShootingDrills,
  ...basketballPassingDrills,
  ...basketballDefenseDrills,
  ...basketballTeamPlayDrills,
];

const basketballCategories: DrillCategory[] = [
  { name: "Ball Handling", description: "Master dribbling and ball control", drills: basketballBallHandlingDrills },
  { name: "Shooting", description: "Perfect your shooting technique", drills: basketballShootingDrills },
  { name: "Passing", description: "Master different pass types", drills: basketballPassingDrills },
  { name: "Defense", description: "Become a lockdown defender", drills: basketballDefenseDrills },
  { name: "Team Play", description: "Learn plays and teamwork", drills: basketballTeamPlayDrills },
];

// Tennis - 100 drills per category
const tennisGroundstrokesDrills = generateDrillsForCategory(
  "Tennis", "Groundstrokes", "tn-ground",
  100,
  ["Forehand Cross", "Forehand Line", "Backhand Cross", "Backhand Line", "Inside-Out", "Inside-In", "Heavy Topspin", "Flat Drive", "Loop Ball", "Counter Punch", "Approach Shot", "Passing Shot"]
);

const tennisServeDrills = generateDrillsForCategory(
  "Tennis", "Serve", "tn-serve",
  100,
  ["Flat Serve", "Slice Serve", "Kick Serve", "Body Serve", "Wide Serve", "T Serve", "Power Serve", "Placement Serve", "Second Serve", "Serve and Volley", "Ace Training", "Toss Drill"]
);

const tennisNetPlayDrills = generateDrillsForCategory(
  "Tennis", "Net Play", "tn-net",
  50,
  ["Forehand Volley", "Backhand Volley", "Drop Volley", "Swinging Volley", "Overhead Smash", "Half Volley", "Approach Volley", "Poach"]
);

const tennisFootworkDrills = generateDrillsForCategory(
  "Tennis", "Footwork", "tn-foot",
  50,
  ["Split Step", "Side Shuffle", "Cross Step", "Recovery Steps", "Approach Run", "Drop Shot Recovery", "Baseline Movement", "Net Rush"]
);

const tennisTouchShotsDrills = generateDrillsForCategory(
  "Tennis", "Touch Shots", "tn-touch",
  50,
  ["Drop Shot", "Lob", "Slice", "Angle Shot", "Moonball", "Defensive Slice", "Offensive Lob", "Touch Volley"]
);

const allTennisDrills = [
  ...tennisGroundstrokesDrills,
  ...tennisServeDrills,
  ...tennisNetPlayDrills,
  ...tennisFootworkDrills,
  ...tennisTouchShotsDrills,
];

const tennisCategories: DrillCategory[] = [
  { name: "Groundstrokes", description: "Master forehand and backhand", drills: tennisGroundstrokesDrills },
  { name: "Serve", description: "Develop a powerful serve", drills: tennisServeDrills },
  { name: "Net Play", description: "Dominate at the net", drills: tennisNetPlayDrills },
  { name: "Footwork", description: "Move efficiently on court", drills: tennisFootworkDrills },
  { name: "Touch Shots", description: "Learn finesse shots", drills: tennisTouchShotsDrills },
];

// American Football drills
const americanFootballThrowingDrills = generateDrillsForCategory(
  "American Football", "Throwing", "af-throw",
  100,
  ["Short Pass", "Medium Pass", "Deep Ball", "Spiral", "Touch Pass", "Bullet Pass", "Back Shoulder", "Post Route", "Slant Route", "Out Route", "Fade Route", "Screen Pass"]
);

const americanFootballReceivingDrills = generateDrillsForCategory(
  "American Football", "Receiving", "af-recv",
  100,
  ["Route Running", "Catching", "One-Hand Catch", "Sideline Catch", "Jump Ball", "RAC Drill", "Release Move", "Break Route", "Double Move", "Option Route", "Comeback", "Curl Route"]
);

const americanFootballRushingDrills = generateDrillsForCategory(
  "American Football", "Rushing", "af-rush",
  50,
  ["Power Run", "Zone Run", "Cut Back", "Vision Drill", "Ball Security", "Stiff Arm", "Spin Move", "Hurdle"]
);

const americanFootballBlockingDrills = generateDrillsForCategory(
  "American Football", "Blocking", "af-block",
  50,
  ["Pass Block", "Run Block", "Pull Block", "Combo Block", "Reach Block", "Down Block", "Kick Slide", "Punch Drill"]
);

const allAmericanFootballDrills = [
  ...americanFootballThrowingDrills,
  ...americanFootballReceivingDrills,
  ...americanFootballRushingDrills,
  ...americanFootballBlockingDrills,
];

const americanFootballCategories: DrillCategory[] = [
  { name: "Throwing", description: "Master QB throwing mechanics", drills: americanFootballThrowingDrills },
  { name: "Receiving", description: "Perfect route running and catching", drills: americanFootballReceivingDrills },
  { name: "Rushing", description: "Improve running back skills", drills: americanFootballRushingDrills },
  { name: "Blocking", description: "Dominate the line of scrimmage", drills: americanFootballBlockingDrills },
];

// Default drills for other sports
const createDefaultDrills = (sportName: string): DrillInfo[] => {
  return generateDrillsForCategory(sportName, "Basics", "def", 50, [
    "Fundamental", "Core", "Essential", "Primary", "Foundation", "Standard", "Basic", "Introduction"
  ]);
};

const createDefaultCategories = (sportName: string): DrillCategory[] => {
  return [
    { name: "Basics", description: "Learn the fundamentals", drills: generateDrillsForCategory(sportName, "Basics", "def-basic", 50, ["Fundamental", "Core", "Essential", "Primary"]) },
    { name: "Technique", description: "Develop core skills", drills: generateDrillsForCategory(sportName, "Technique", "def-tech", 50, ["Form", "Movement", "Precision", "Accuracy"]) },
    { name: "Fitness", description: "Build strength and speed", drills: generateDrillsForCategory(sportName, "Fitness", "def-fit", 50, ["Strength", "Speed", "Agility", "Endurance"]) },
    { name: "Advanced", description: "Master advanced skills", drills: generateDrillsForCategory(sportName, "Advanced", "def-adv", 50, ["Elite", "Pro", "Championship", "Expert"]) },
  ];
};

// Sport data registry
export const sportsData: Record<string, SportDrills> = {
  football: { name: "Football", color: "#22c55e", drills: allFootballDrills, categories: footballCategories },
  basketball: { name: "Basketball", color: "#f97316", drills: allBasketballDrills, categories: basketballCategories },
  tennis: { name: "Tennis", color: "#eab308", drills: allTennisDrills, categories: tennisCategories },
  "american-football": { name: "American Football", color: "#8b4513", drills: allAmericanFootballDrills, categories: americanFootballCategories },
};

// Get sport data with fallback for unknown sports
export const getSportData = (sportSlug: string): SportDrills => {
  if (sportsData[sportSlug]) {
    return sportsData[sportSlug];
  }
  
  // Generate default data for unknown sports
  const sportName = sportSlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const categories = createDefaultCategories(sportName);
  const allDrills = categories.flatMap(c => c.drills);
  
  return {
    name: sportName,
    color: "#6366f1",
    drills: allDrills,
    categories,
  };
};

// Get drill by sport and drill ID
export const getDrillById = (sportSlug: string, drillId: string): DrillInfo | null => {
  const sportData = getSportData(sportSlug);
  return sportData.drills.find(d => d.id === drillId) || null;
};
