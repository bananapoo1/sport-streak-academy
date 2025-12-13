import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Flame, Target, Calendar, TrendingUp, Zap } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";

// Mock user data
const usersData: Record<string, {
  name: string;
  avatar: string;
  league: "bronze" | "silver" | "gold" | "diamond";
  rank: number;
  xp: number;
  streak: number;
  drillsCompleted: number;
  joinDate: string;
  favoriteSport: string;
  weeklyXp: number;
  longestStreak: number;
  achievements: string[];
}> = {
  "alex-m": {
    name: "Alex M.",
    avatar: "🏀",
    league: "gold",
    rank: 1,
    xp: 2450,
    streak: 32,
    drillsCompleted: 156,
    joinDate: "2024-09-15",
    favoriteSport: "Basketball",
    weeklyXp: 450,
    longestStreak: 45,
    achievements: ["First Drill", "Week Warrior", "Streak Master", "Gold League"],
  },
  "sarah-k": {
    name: "Sarah K.",
    avatar: "⚽",
    league: "gold",
    rank: 2,
    xp: 2380,
    streak: 28,
    drillsCompleted: 142,
    joinDate: "2024-08-20",
    favoriteSport: "Football",
    weeklyXp: 420,
    longestStreak: 35,
    achievements: ["First Drill", "Week Warrior", "Streak Master"],
  },
  "james-l": {
    name: "James L.",
    avatar: "🎾",
    league: "gold",
    rank: 3,
    xp: 2290,
    streak: 25,
    drillsCompleted: 128,
    joinDate: "2024-10-01",
    favoriteSport: "Tennis",
    weeklyXp: 380,
    longestStreak: 28,
    achievements: ["First Drill", "Week Warrior"],
  },
  "emma-r": {
    name: "Emma R.",
    avatar: "🏈",
    league: "gold",
    rank: 4,
    xp: 2150,
    streak: 21,
    drillsCompleted: 115,
    joinDate: "2024-10-15",
    favoriteSport: "American Football",
    weeklyXp: 350,
    longestStreak: 24,
    achievements: ["First Drill", "Week Warrior"],
  },
};

const achievementIcons: Record<string, string> = {
  "First Drill": "🎯",
  "Week Warrior": "⚡",
  "Streak Master": "🔥",
  "Gold League": "🥇",
  "Diamond League": "💎",
  "Century Club": "💯",
};

const UserProfile = () => {
  const { userId } = useParams();
  const user = usersData[userId || ""] || {
    name: "Unknown User",
    avatar: "❓",
    league: "bronze" as const,
    rank: 0,
    xp: 0,
    streak: 0,
    drillsCompleted: 0,
    joinDate: "N/A",
    favoriteSport: "Unknown",
    weeklyXp: 0,
    longestStreak: 0,
    achievements: [],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link 
            to="/#leagues" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leagues
          </Link>

          {/* Profile Header */}
          <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-card mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-5xl">
                {user.avatar}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-extrabold text-foreground mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-4">Joined {new Date(user.joinDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <LeagueBadge league={user.league} rank={user.rank} />
                  <StreakCounter days={user.streak} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Trophy className="w-8 h-8 text-league-gold mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{user.xp.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{user.drillsCompleted}</div>
              <div className="text-sm text-muted-foreground">Drills Done</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Flame className="w-8 h-8 text-streak mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{user.longestStreak}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{user.weeklyXp}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>

          {/* Favorite Sport & Achievements */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Favorite Sport
              </h2>
              <p className="text-lg text-muted-foreground">{user.favoriteSport}</p>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-league-gold" />
                Achievements
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.achievements.map((achievement) => (
                  <span
                    key={achievement}
                    className="inline-flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm font-medium text-foreground"
                  >
                    {achievementIcons[achievement] || "🏆"} {achievement}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
