// Achievement definitions with rarity tiers

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  requirement: {
    type: "drills" | "streak" | "xp" | "challenges" | "sports" | "category" | "special";
    value: number;
    sport?: string;
    category?: string;
  };
}

export const achievements: Achievement[] = [
  // Common Achievements (Easy to unlock)
  {
    id: "first_drill",
    name: "First Steps",
    description: "Complete your first drill",
    icon: "🎯",
    rarity: "common",
    xpReward: 25,
    requirement: { type: "drills", value: 1 },
  },
  {
    id: "week_starter",
    name: "Week Starter",
    description: "Maintain a 3-day streak",
    icon: "📅",
    rarity: "common",
    xpReward: 50,
    requirement: { type: "streak", value: 3 },
  },
  {
    id: "ten_drills",
    name: "Getting Warmed Up",
    description: "Complete 10 drills",
    icon: "🏃",
    rarity: "common",
    xpReward: 75,
    requirement: { type: "drills", value: 10 },
  },
  {
    id: "first_hundred_xp",
    name: "XP Hunter",
    description: "Earn 100 XP",
    icon: "⚡",
    rarity: "common",
    xpReward: 50,
    requirement: { type: "xp", value: 100 },
  },
  {
    id: "two_sports",
    name: "Multi-Sport",
    description: "Practice drills in 2 different sports",
    icon: "🎽",
    rarity: "common",
    xpReward: 75,
    requirement: { type: "sports", value: 2 },
  },

  // Rare Achievements (Moderate effort)
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    rarity: "rare",
    xpReward: 150,
    requirement: { type: "streak", value: 7 },
  },
  {
    id: "fifty_drills",
    name: "Dedicated Athlete",
    description: "Complete 50 drills",
    icon: "💪",
    rarity: "rare",
    xpReward: 200,
    requirement: { type: "drills", value: 50 },
  },
  {
    id: "first_challenge_win",
    name: "Challenger",
    description: "Win your first challenge",
    icon: "⚔️",
    rarity: "rare",
    xpReward: 100,
    requirement: { type: "challenges", value: 1 },
  },
  {
    id: "silver_league",
    name: "Rising Star",
    description: "Reach Silver League",
    icon: "🥈",
    rarity: "rare",
    xpReward: 200,
    requirement: { type: "xp", value: 5000 },
  },
  {
    id: "four_sports",
    name: "Sports Enthusiast",
    description: "Practice drills in 4 different sports",
    icon: "🌟",
    rarity: "rare",
    xpReward: 150,
    requirement: { type: "sports", value: 4 },
  },
  {
    id: "dribbling_master",
    name: "Dribbling Pro",
    description: "Complete 25 dribbling drills",
    icon: "⚽",
    rarity: "rare",
    xpReward: 175,
    requirement: { type: "category", value: 25, category: "Dribbling" },
  },
  {
    id: "shooting_master",
    name: "Sharpshooter",
    description: "Complete 25 shooting drills",
    icon: "🎯",
    rarity: "rare",
    xpReward: 175,
    requirement: { type: "category", value: 25, category: "Shooting" },
  },

  // Epic Achievements (Significant dedication)
  {
    id: "century_club",
    name: "Century Club",
    description: "Complete 100 drills",
    icon: "💯",
    rarity: "epic",
    xpReward: 500,
    requirement: { type: "drills", value: 100 },
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Maintain a 30-day streak",
    icon: "🔥",
    rarity: "epic",
    xpReward: 500,
    requirement: { type: "streak", value: 30 },
  },
  {
    id: "gold_league",
    name: "Golden Athlete",
    description: "Reach Gold League",
    icon: "🥇",
    rarity: "epic",
    xpReward: 400,
    requirement: { type: "xp", value: 15000 },
  },
  {
    id: "challenge_champion",
    name: "Challenge Champion",
    description: "Win 10 challenges",
    icon: "🏆",
    rarity: "epic",
    xpReward: 350,
    requirement: { type: "challenges", value: 10 },
  },
  {
    id: "all_rounder",
    name: "All-Rounder",
    description: "Practice drills in 8 different sports",
    icon: "🌈",
    rarity: "epic",
    xpReward: 400,
    requirement: { type: "sports", value: 8 },
  },
  {
    id: "boss_slayer",
    name: "Boss Slayer",
    description: "Complete 10 boss drills",
    icon: "👑",
    rarity: "epic",
    xpReward: 450,
    requirement: { type: "special", value: 10 },
  },

  // Legendary Achievements (Extreme dedication)
  {
    id: "drill_legend",
    name: "Drill Legend",
    description: "Complete 500 drills",
    icon: "🏅",
    rarity: "legendary",
    xpReward: 1000,
    requirement: { type: "drills", value: 500 },
  },
  {
    id: "streak_legend",
    name: "Unstoppable",
    description: "Maintain a 100-day streak",
    icon: "⭐",
    rarity: "legendary",
    xpReward: 1500,
    requirement: { type: "streak", value: 100 },
  },
  {
    id: "diamond_league",
    name: "Diamond Elite",
    description: "Reach Diamond League",
    icon: "💎",
    rarity: "legendary",
    xpReward: 1000,
    requirement: { type: "xp", value: 50000 },
  },
  {
    id: "ultimate_champion",
    name: "Ultimate Champion",
    description: "Win 50 challenges",
    icon: "👑",
    rarity: "legendary",
    xpReward: 1000,
    requirement: { type: "challenges", value: 50 },
  },
  {
    id: "sports_master",
    name: "Sports Master",
    description: "Practice drills in all 12 sports",
    icon: "🎖️",
    rarity: "legendary",
    xpReward: 750,
    requirement: { type: "sports", value: 12 },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete 1000 drills",
    icon: "✨",
    rarity: "legendary",
    xpReward: 2000,
    requirement: { type: "drills", value: 1000 },
  },
];

export const rarityColors: Record<AchievementRarity, { bg: string; border: string; text: string }> = {
  common: { bg: "bg-slate-500/20", border: "border-slate-500/50", text: "text-slate-400" },
  rare: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400" },
  epic: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400" },
  legendary: { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-400" },
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(a => a.id === id);
};