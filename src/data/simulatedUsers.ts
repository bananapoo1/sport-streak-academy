// Simulated users for leaderboard display
// Since we can't create real dummy profiles (foreign key constraint to auth.users),
// we display these simulated users in the leaderboard

const firstNames = [
  "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Blake",
  "Charlie", "Drew", "Frankie", "Jamie", "Kendall", "Lee", "Max", "Nico", "Pat", "Reese",
  "Skyler", "Dakota", "Emery", "Finley", "Hayden", "Jessie", "Logan", "Mackenzie", "Parker", "Rowan",
  "Sage", "Tatum", "Bailey", "Cameron", "Devon", "Ellis", "Flynn", "Gray", "Harper", "Indigo",
  "Jules", "Kit", "Lane", "Marley", "Noel", "Oakley", "Phoenix", "Remy", "Scout", "Sloane"
];

const lastInitials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const avatars = ["⚽", "🏀", "🎾", "🏈", "🏐", "🎯", "🏓", "⭐", "🔥", "💪", "🥇", "🏆"];

// Seed-based random for consistent results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface SimulatedUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  league: "bronze" | "silver" | "gold" | "diamond";
}

function getLeague(xp: number): "bronze" | "silver" | "gold" | "diamond" {
  if (xp >= 50000) return "diamond";
  if (xp >= 15000) return "gold";
  if (xp >= 5000) return "silver";
  return "bronze";
}

// Generate 200 simulated users with varied stats
export const simulatedUsers: SimulatedUser[] = Array.from({ length: 200 }, (_, i) => {
  const seed = i + 1;
  const firstName = firstNames[Math.floor(seededRandom(seed * 1) * firstNames.length)];
  const lastInitial = lastInitials[Math.floor(seededRandom(seed * 2) * lastInitials.length)];
  const avatar = avatars[Math.floor(seededRandom(seed * 3) * avatars.length)];
  
  // Distribution: 10% Diamond, 25% Gold, 35% Silver, 30% Bronze
  let xp: number;
  const tierRoll = seededRandom(seed * 4);
  if (tierRoll < 0.10) {
    // Diamond: 50000-150000 XP
    xp = 50000 + Math.floor(seededRandom(seed * 5) * 100000);
  } else if (tierRoll < 0.35) {
    // Gold: 15000-49999 XP
    xp = 15000 + Math.floor(seededRandom(seed * 5) * 34999);
  } else if (tierRoll < 0.70) {
    // Silver: 5000-14999 XP
    xp = 5000 + Math.floor(seededRandom(seed * 5) * 9999);
  } else {
    // Bronze: 0-4999 XP
    xp = Math.floor(seededRandom(seed * 5) * 4999);
  }
  
  const streak = Math.floor(seededRandom(seed * 6) * 60);
  
  return {
    id: `sim-${i + 1}`,
    name: `${firstName} ${lastInitial}.`,
    avatar,
    xp,
    streak,
    league: getLeague(xp),
  };
}).sort((a, b) => b.xp - a.xp); // Sort by XP descending

// Get top N simulated users
export const getTopSimulatedUsers = (count: number = 50): SimulatedUser[] => {
  return simulatedUsers.slice(0, count);
};

// Get simulated users by league
export const getSimulatedUsersByLeague = (league: SimulatedUser["league"]): SimulatedUser[] => {
  return simulatedUsers.filter(u => u.league === league);
};