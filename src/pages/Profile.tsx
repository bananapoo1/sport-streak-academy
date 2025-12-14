import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Target, Zap, Edit2, Lock, Check } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";

// Mock user profile data
const userProfile = {
  name: "You",
  avatar: "🎯",
  league: "silver" as const,
  rank: 12,
  xp: 1250,
  streak: 7,
  drillsCompleted: 42,
  joinDate: "2024-11-01",
  favoriteSport: "Football",
  weeklyXp: 320,
  longestStreak: 14,
};

// Available customization options
const avatarOptions = ["🎯", "⚽", "🏀", "🎾", "🏈", "⛳", "🏐", "🏑", "🏓", "🏏", "🏉", "⚾"];

const frameOptions = [
  { id: "default", name: "Default", unlocked: true },
  { id: "bronze", name: "Bronze Ring", unlocked: true },
  { id: "silver", name: "Silver Ring", unlocked: true },
  { id: "gold", name: "Gold Ring", unlocked: false, requirement: "Reach Gold League" },
  { id: "diamond", name: "Diamond Ring", unlocked: false, requirement: "Reach Diamond League" },
  { id: "fire", name: "Fire Aura", unlocked: false, requirement: "30-Day Streak" },
];

const trophies = [
  { id: "first-drill", name: "First Drill", icon: "🎯", description: "Complete your first drill", unlocked: true },
  { id: "week-warrior", name: "Week Warrior", icon: "⚡", description: "7-day streak", unlocked: true },
  { id: "century-club", name: "Century Club", icon: "💯", description: "Complete 100 drills", unlocked: false },
  { id: "streak-master", name: "Streak Master", icon: "🔥", description: "30-day streak", unlocked: false },
  { id: "gold-league", name: "Gold Champion", icon: "🥇", description: "Reach Gold League", unlocked: false },
  { id: "diamond-league", name: "Diamond Elite", icon: "💎", description: "Reach Diamond League", unlocked: false },
  { id: "all-sports", name: "Versatile", icon: "🌟", description: "Complete drills in all 12 sports", unlocked: false },
  { id: "pro-member", name: "Pro Athlete", icon: "👑", description: "Subscribe to Pro", unlocked: false },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-extrabold text-foreground mb-8">My Profile</h1>

          {/* Profile Header */}
          <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-card mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-5xl border-4 border-primary">
                  {userProfile.avatar}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-button hover:scale-110 transition-transform">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-extrabold text-foreground mb-2">{userProfile.name}</h2>
                <p className="text-muted-foreground mb-4">
                  Joined {new Date(userProfile.joinDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <LeagueBadge league={userProfile.league} rank={userProfile.rank} />
                  <StreakCounter days={userProfile.streak} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Trophy className="w-8 h-8 text-league-gold mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{userProfile.xp.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{userProfile.drillsCompleted}</div>
              <div className="text-sm text-muted-foreground">Drills Done</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Flame className="w-8 h-8 text-streak mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{userProfile.longestStreak}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Zap className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{userProfile.weeklyXp}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>

          {/* Customize Section */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Customize Avatar
            </h3>
            <div className="flex flex-wrap gap-3">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all hover:scale-110 ${
                    userProfile.avatar === avatar
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Frames */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-xp" />
              Profile Frames
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {frameOptions.map((frame) => (
                <div
                  key={frame.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    frame.unlocked
                      ? "border-border hover:border-primary cursor-pointer"
                      : "border-border/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{frame.name}</span>
                    {frame.unlocked ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {!frame.unlocked && (
                    <p className="text-xs text-muted-foreground">{frame.requirement}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trophies */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-soft">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-league-gold" />
              Trophies ({trophies.filter(t => t.unlocked).length}/{trophies.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trophies.map((trophy) => (
                <div
                  key={trophy.id}
                  className={`p-4 rounded-2xl text-center transition-all ${
                    trophy.unlocked
                      ? "bg-secondary border-2 border-league-gold/30"
                      : "bg-muted/50 border-2 border-border opacity-50"
                  }`}
                >
                  <span className={`text-3xl ${!trophy.unlocked && "grayscale"}`}>
                    {trophy.icon}
                  </span>
                  <h4 className="font-bold text-sm text-foreground mt-2">{trophy.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{trophy.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
