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

// Padel drills data
const padelDrills: SportDrills = {
  name: 'Padel',
  slug: 'padel',
  color: 'hsl(271 81% 56%)',
  emoji: '🎾',
  categories: [
    {
      name: 'Wall Play',
      description: 'Master the unique wall dynamics',
      icon: '🧱',
      drills: generateDrillLevels('padel', 'wall-play', 'Wall Play', [
        { title: 'Back Wall Returns', description: 'Read and return balls off the back glass' },
        { title: 'Side Wall Shots', description: 'Use side walls to your advantage' },
        { title: 'Double Bounce', description: 'Complex wall combinations' },
      ]),
    },
    {
      name: 'Volleys',
      description: 'Dominate at the net',
      icon: '🏐',
      drills: generateDrillLevels('padel', 'volleys', 'Volleys', [
        { title: 'Bandeja', description: 'The signature padel defensive overhead' },
        { title: 'Vibora', description: 'Aggressive topspin smash technique' },
        { title: 'Net Volleys', description: 'Quick reactions at the net' },
      ]),
    },
    {
      name: 'Positioning',
      description: 'Court positioning and strategy',
      icon: '📍',
      drills: generateDrillLevels('padel', 'positioning', 'Positioning', [
        { title: 'Net Transitions', description: 'When and how to approach the net' },
        { title: 'Defensive Setup', description: 'Cover the court effectively' },
        { title: 'Partner Coordination', description: 'Move as a unit with your partner' },
      ]),
    },
  ],
};

// Golf drills data
const golfDrills: SportDrills = {
  name: 'Golf',
  slug: 'golf',
  color: 'hsl(142 76% 36%)',
  emoji: '⛳',
  categories: [
    {
      name: 'Driving',
      description: 'Power and accuracy off the tee',
      icon: '🏌️',
      drills: generateDrillLevels('golf', 'driving', 'Driving', [
        { title: 'Tee Shot Basics', description: 'Fundamentals of the driver swing' },
        { title: 'Distance Control', description: 'Maximize yardage consistently' },
        { title: 'Fairway Finder', description: 'Accuracy over distance training' },
      ]),
    },
    {
      name: 'Iron Play',
      description: 'Precision approach shots',
      icon: '🎯',
      drills: generateDrillLevels('golf', 'irons', 'Iron Play', [
        { title: 'Ball Striking', description: 'Clean contact with irons' },
        { title: 'Distance Gaps', description: 'Know your yardages for each club' },
        { title: 'Shot Shaping', description: 'Draws and fades on command' },
      ]),
    },
    {
      name: 'Short Game',
      description: 'Scoring around the green',
      icon: '🕳️',
      drills: generateDrillLevels('golf', 'short-game', 'Short Game', [
        { title: 'Chipping', description: 'Basic chip shots from around the green' },
        { title: 'Pitching', description: 'Lofted shots with spin control' },
        { title: 'Putting', description: 'Master the greens' },
      ]),
    },
  ],
};

// Cricket drills data
const cricketDrills: SportDrills = {
  name: 'Cricket',
  slug: 'cricket',
  color: 'hsl(210 80% 50%)',
  emoji: '🏏',
  categories: [
    {
      name: 'Batting',
      description: 'Score runs with confidence',
      icon: '🏏',
      drills: generateDrillLevels('cricket', 'batting', 'Batting', [
        { title: 'Defensive Technique', description: 'Solid forward and back defense' },
        { title: 'Drive Shots', description: 'Cover, straight, and on drives' },
        { title: 'Power Hitting', description: 'Six hitting and boundary shots' },
      ]),
    },
    {
      name: 'Bowling',
      description: 'Take wickets consistently',
      icon: '🎳',
      drills: generateDrillLevels('cricket', 'bowling', 'Bowling', [
        { title: 'Line and Length', description: 'Consistent accurate bowling' },
        { title: 'Swing Bowling', description: 'Move the ball in the air' },
        { title: 'Spin Variations', description: 'Off-spin, leg-spin, and googlies' },
      ]),
    },
    {
      name: 'Fielding',
      description: 'Save runs and take catches',
      icon: '🧤',
      drills: generateDrillLevels('cricket', 'fielding', 'Fielding', [
        { title: 'Ground Fielding', description: 'Stop and return quickly' },
        { title: 'Catching Practice', description: 'High catches and slip catching' },
        { title: 'Throwing Accuracy', description: 'Direct hits and relay throws' },
      ]),
    },
  ],
};

// Rugby drills data
const rugbyDrills: SportDrills = {
  name: 'Rugby',
  slug: 'rugby',
  color: 'hsl(0 72% 51%)',
  emoji: '🏉',
  categories: [
    {
      name: 'Passing',
      description: 'Move the ball effectively',
      icon: '🔄',
      drills: generateDrillLevels('rugby', 'passing', 'Passing', [
        { title: 'Spin Pass', description: 'Quick and accurate spiral passes' },
        { title: 'Pop Pass', description: 'Short offloads in contact' },
        { title: 'Skip Pass', description: 'Miss a man to create space' },
      ]),
    },
    {
      name: 'Tackling',
      description: 'Defensive fundamentals',
      icon: '🛡️',
      drills: generateDrillLevels('rugby', 'tackling', 'Tackling', [
        { title: 'Front Tackle', description: 'Head-on tackle technique' },
        { title: 'Side Tackle', description: 'Chop tackles and ankle taps' },
        { title: 'Dominant Tackle', description: 'Drive the opponent back' },
      ]),
    },
    {
      name: 'Running',
      description: 'Evasion and ball carrying',
      icon: '🏃',
      drills: generateDrillLevels('rugby', 'running', 'Running', [
        { title: 'Line Running', description: 'Straight and angled runs' },
        { title: 'Footwork', description: 'Sidesteps and fends' },
        { title: 'Support Play', description: 'Running effective support lines' },
      ]),
    },
  ],
};



// Field Hockey drills data
const fieldHockeyDrills: SportDrills = {
  name: 'Field Hockey',
  slug: 'field-hockey',
  color: 'hsl(173 80% 40%)',
  emoji: '🏑',
  categories: [
    {
      name: 'Stick Skills',
      description: 'Control and manipulation',
      icon: '🏑',
      drills: generateDrillLevels('field-hockey', 'stick-skills', 'Stick Skills', [
        { title: 'Dribbling', description: 'Close control at speed' },
        { title: 'Receiving', description: 'Trap and control passes' },
        { title: '3D Skills', description: 'Aerial lifts and tricks' },
      ]),
    },
    {
      name: 'Passing',
      description: 'Distribute effectively',
      icon: '🔄',
      drills: generateDrillLevels('field-hockey', 'passing', 'Passing', [
        { title: 'Push Pass', description: 'Accurate short-range passes' },
        { title: 'Hit', description: 'Powerful long-range distribution' },
        { title: 'Slap Pass', description: 'Quick release passing' },
      ]),
    },
    {
      name: 'Shooting',
      description: 'Score from the circle',
      icon: '🥅',
      drills: generateDrillLevels('field-hockey', 'shooting', 'Shooting', [
        { title: 'Drag Flick', description: 'Penalty corner specialization' },
        { title: 'Deflections', description: 'Redirect passes into the goal' },
        { title: 'Reverse Shot', description: 'Score from your backhand' },
      ]),
    },
  ],
};

// All sports data
export const sportsData: Record<string, SportDrills> = {
  football: footballDrills,
  basketball: basketballDrills,
  tennis: tennisDrills,
  padel: padelDrills,
  golf: golfDrills,
  cricket: cricketDrills,
  rugby: rugbyDrills,
  'field-hockey': fieldHockeyDrills,
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

// Search drill by ID across all sports - handles legacy IDs gracefully
export const findDrillById = (drillId: string): { drill: DrillInfo; sport: SportDrills } | null => {
  // First try exact match
  for (const sport of Object.values(sportsData)) {
    for (const category of sport.categories) {
      const drill = category.drills.find(d => d.id === drillId);
      if (drill) return { drill, sport };
    }
  }
  
  // If no exact match, this might be a legacy ID - return null gracefully
  // The UI will handle showing "Unknown Drill" for legacy challenges
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
