// Drill difficulty levels
export type DrillDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type DrillLevel = 1 | 2 | 3 | 4 | 5;

export interface DrillInfo {
  id: string;
  title: string;
  duration: number;
  xp: number;
  difficulty: DrillDifficulty;
  level: DrillLevel;
  description: string;
  instructions: string[];
  category: string;
  sport: string;
}

export interface DrillCategory {
  name: string;
  description: string;
  icon: string;
  drills: DrillInfo[];
}

export interface SportDrills {
  name: string;
  slug: string;
  color: string;
  emoji: string;
  categories: DrillCategory[];
}

// Generate progressive drill levels for a category
const generateDrillLevels = (
  sport: string,
  category: string,
  categoryName: string,
  baseDrills: { title: string; description: string }[]
): DrillInfo[] => {
  const difficulties: DrillDifficulty[] = ['beginner', 'intermediate', 'advanced', 'elite'];
  const drills: DrillInfo[] = [];

  baseDrills.forEach((baseDrill, drillIndex) => {
    for (let level = 1; level <= 5; level++) {
      const difficultyIndex = Math.min(Math.floor((level - 1) / 1.5), 3);
      const difficulty = difficulties[difficultyIndex];
      const xpMultiplier = level * 1.5;
      
      drills.push({
        id: `${sport}-${category}-${drillIndex + 1}-level-${level}`,
        title: level === 1 ? baseDrill.title : `${baseDrill.title} Level ${level}`,
        duration: 5 + (level * 2),
        xp: Math.round(20 * xpMultiplier),
        difficulty,
        level: level as DrillLevel,
        description: baseDrill.description,
        instructions: generateInstructions(baseDrill.title, level),
        category: categoryName,
        sport,
      });
    }
  });

  return drills;
};

const generateInstructions = (drillTitle: string, level: number): string[] => {
  const baseInstructions = [
    `Set up your training area with appropriate equipment`,
    `Warm up for 5 minutes before starting`,
    `Focus on proper form and technique throughout`,
    `Complete all reps with full range of motion`,
    `Rest 30-60 seconds between sets as needed`,
  ];
  
  if (level >= 3) {
    baseInstructions.push(`Increase speed while maintaining accuracy`);
  }
  if (level >= 4) {
    baseInstructions.push(`Add variations to challenge yourself`);
  }
  if (level === 5) {
    baseInstructions.push(`Push to your limits - this is elite level training`);
  }
  
  return baseInstructions;
};

// Football drills data
const footballDrills: SportDrills = {
  name: 'Football',
  slug: 'football',
  color: 'hsl(142 76% 36%)',
  emoji: '⚽',
  categories: [
    {
      name: 'Ball Control',
      description: 'Master the fundamentals of ball manipulation',
      icon: '🎯',
      drills: generateDrillLevels('football', 'ball-control', 'Ball Control', [
        { title: 'First Touch', description: 'Perfect your initial ball reception from various angles and speeds' },
        { title: 'Juggling Mastery', description: 'Keep the ball airborne using feet, thighs, and head' },
        { title: 'Tight Space Control', description: 'Maintain possession in confined areas under pressure' },
      ]),
    },
    {
      name: 'Passing',
      description: 'Develop precise and powerful distribution',
      icon: '🔄',
      drills: generateDrillLevels('football', 'passing', 'Passing', [
        { title: 'Short Passing', description: 'Accurate ground passes over short distances' },
        { title: 'Long Balls', description: 'Driven passes and lofted balls across the pitch' },
        { title: 'Through Balls', description: 'Weight and timing for penetrating passes' },
      ]),
    },
    {
      name: 'Shooting',
      description: 'Become clinical in front of goal',
      icon: '🥅',
      drills: generateDrillLevels('football', 'shooting', 'Shooting', [
        { title: 'Power Shots', description: 'Generate maximum power with proper technique' },
        { title: 'Finesse Finishing', description: 'Curl and place shots into corners' },
        { title: 'One-Touch Finishing', description: 'Quick reactions and instinctive finishing' },
      ]),
    },
    {
      name: 'Dribbling',
      description: 'Beat defenders with skill and speed',
      icon: '💨',
      drills: generateDrillLevels('football', 'dribbling', 'Dribbling', [
        { title: 'Speed Dribbling', description: 'Maintain control at high speeds' },
        { title: 'Skill Moves', description: 'Stepovers, feints, and advanced tricks' },
        { title: '1v1 Situations', description: 'Take on defenders in isolated scenarios' },
      ]),
    },
  ],
};

// Basketball drills data
const basketballDrills: SportDrills = {
  name: 'Basketball',
  slug: 'basketball',
  color: 'hsl(25 95% 53%)',
  emoji: '🏀',
  categories: [
    {
      name: 'Ball Handling',
      description: 'Control the ball like a point guard',
      icon: '🤲',
      drills: generateDrillLevels('basketball', 'ball-handling', 'Ball Handling', [
        { title: 'Stationary Dribbling', description: 'Low and high dribbles with both hands' },
        { title: 'Crossover Moves', description: 'Quick direction changes to beat defenders' },
        { title: 'Two-Ball Drills', description: 'Simultaneous ball control for coordination' },
      ]),
    },
    {
      name: 'Shooting',
      description: 'Develop a pure shooting stroke',
      icon: '🎯',
      drills: generateDrillLevels('basketball', 'shooting', 'Shooting', [
        { title: 'Form Shooting', description: 'Perfect your shooting mechanics close to the basket' },
        { title: 'Mid-Range Game', description: 'Pull-up jumpers and fadeaways' },
        { title: 'Three-Point Shooting', description: 'Consistent long-range accuracy' },
      ]),
    },
    {
      name: 'Defense',
      description: 'Lock down any opponent',
      icon: '🛡️',
      drills: generateDrillLevels('basketball', 'defense', 'Defense', [
        { title: 'Defensive Slides', description: 'Lateral quickness and positioning' },
        { title: 'Close-Out Drills', description: 'Contest shots without fouling' },
        { title: 'Help Defense', description: 'Rotations and team defensive concepts' },
      ]),
    },
  ],
};

// Tennis drills data
const tennisDrills: SportDrills = {
  name: 'Tennis',
  slug: 'tennis',
  color: 'hsl(45 93% 47%)',
  emoji: '🎾',
  categories: [
    {
      name: 'Groundstrokes',
      description: 'Build powerful baseline weapons',
      icon: '💪',
      drills: generateDrillLevels('tennis', 'groundstrokes', 'Groundstrokes', [
        { title: 'Forehand Drive', description: 'Generate topspin and power from the forehand side' },
        { title: 'Backhand Mastery', description: 'One-hand or two-hand backhand technique' },
        { title: 'Rally Consistency', description: 'Maintain depth and accuracy in long rallies' },
      ]),
    },
    {
      name: 'Serve',
      description: 'Develop a dominant service game',
      icon: '🚀',
      drills: generateDrillLevels('tennis', 'serve', 'Serve', [
        { title: 'Flat Serve', description: 'Maximum power on first serves' },
        { title: 'Kick Serve', description: 'High bouncing second serves' },
        { title: 'Placement Drills', description: 'Target specific zones with accuracy' },
      ]),
    },
    {
      name: 'Net Play',
      description: 'Finish points at the net',
      icon: '🏐',
      drills: generateDrillLevels('tennis', 'net-play', 'Net Play', [
        { title: 'Volleys', description: 'Clean technique on forehand and backhand volleys' },
        { title: 'Overhead Smash', description: 'Put away high balls with authority' },
        { title: 'Approach Shots', description: 'Transition from baseline to net effectively' },
      ]),
    },
  ],
};

// American Football drills data
const americanFootballDrills: SportDrills = {
  name: 'American Football',
  slug: 'american-football',
  color: 'hsl(30 41% 35%)',
  emoji: '🏈',
  categories: [
    {
      name: 'Throwing',
      description: 'Quarterback precision training',
      icon: '🎯',
      drills: generateDrillLevels('american-football', 'throwing', 'Throwing', [
        { title: 'Short Routes', description: 'Quick timing patterns and slants' },
        { title: 'Deep Balls', description: 'Long passes with touch and accuracy' },
        { title: 'Pocket Movement', description: 'Throw while evading pressure' },
      ]),
    },
    {
      name: 'Receiving',
      description: 'Become a reliable target',
      icon: '🤲',
      drills: generateDrillLevels('american-football', 'receiving', 'Receiving', [
        { title: 'Route Running', description: 'Crisp cuts and precise routes' },
        { title: 'Catching Drills', description: 'Secure the ball in all situations' },
        { title: 'YAC Training', description: 'Yards after catch techniques' },
      ]),
    },
    {
      name: 'Agility',
      description: 'Explosive athletic movement',
      icon: '⚡',
      drills: generateDrillLevels('american-football', 'agility', 'Agility', [
        { title: 'Cone Drills', description: 'Quick feet and direction changes' },
        { title: 'Ladder Work', description: 'Foot speed and coordination' },
        { title: 'Explosion Training', description: 'First-step quickness and power' },
      ]),
    },
  ],
};

// All sports data
export const sportsData: Record<string, SportDrills> = {
  football: footballDrills,
  basketball: basketballDrills,
  tennis: tennisDrills,
  'american-football': americanFootballDrills,
};

// Get sport data by slug
export const getSportData = (sportSlug: string): SportDrills | null => {
  return sportsData[sportSlug] || null;
};

// Get a specific drill by sport and drill ID
export const getDrillById = (sportSlug: string, drillId: string): DrillInfo | null => {
  const sport = sportsData[sportSlug];
  if (!sport) return null;

  for (const category of sport.categories) {
    const drill = category.drills.find(d => d.id === drillId);
    if (drill) return drill;
  }
  return null;
};

// Search drill by ID across all sports
export const findDrillById = (drillId: string): { drill: DrillInfo; sport: SportDrills } | null => {
  for (const sport of Object.values(sportsData)) {
    for (const category of sport.categories) {
      const drill = category.drills.find(d => d.id === drillId);
      if (drill) return { drill, sport };
    }
  }
  return null;
};

// Get all drills for a sport
export const getAllDrillsForSport = (sportSlug: string): DrillInfo[] => {
  const sport = sportsData[sportSlug];
  if (!sport) return [];

  return sport.categories.flatMap(cat => cat.drills);
};

// Get all available drills for challenges (only level 1 drills)
export const getChallengeDrills = (): { sport: string; sportName: string; emoji: string; drills: { id: string; title: string; category: string }[] }[] => {
  return Object.values(sportsData).map(sport => ({
    sport: sport.slug,
    sportName: sport.name,
    emoji: sport.emoji,
    drills: sport.categories.flatMap(cat => 
      cat.drills.filter(d => d.level === 1).map(d => ({ id: d.id, title: d.title, category: d.category }))
    ),
  }));
};
