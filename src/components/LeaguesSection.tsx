import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Users, Flame, Medal, Crown, Target, Swords, Award, ChevronRight } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";

interface LeaderboardPlayer {
  id: string;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  isUser?: boolean;
  rank: number;
  change: number; // Position change from last week
  league: "bronze" | "silver" | "gold" | "diamond";
  drillsCompleted: number;
  winStreak: number;
}

const leaderboard: LeaderboardPlayer[] = [
  { id: "alex-m", name: "Alex M.", xp: 12450, streak: 45, avatar: "🏀", rank: 1, change: 2, league: "diamond", drillsCompleted: 234, winStreak: 12 },
  { id: "sarah-k", name: "Sarah K.", xp: 11380, streak: 38, avatar: "⚽", rank: 2, change: -1, league: "diamond", drillsCompleted: 198, winStreak: 8 },
  { id: "james-l", name: "James L.", xp: 10290, streak: 32, avatar: "🎾", rank: 3, change: 0, league: "diamond", drillsCompleted: 176, winStreak: 5 },
  { id: "emma-r", name: "Emma R.", xp: 9150, streak: 28, avatar: "🏈", rank: 4, change: 3, league: "gold", drillsCompleted: 156, winStreak: 7 },
  { id: "you", name: "You", xp: 4200, streak: 7, avatar: "🌟", isUser: true, rank: 5, change: 1, league: "gold", drillsCompleted: 67, winStreak: 3 },
  { id: "mike-t", name: "Mike T.", xp: 3800, streak: 12, avatar: "🏐", rank: 6, change: -2, league: "gold", drillsCompleted: 54, winStreak: 2 },
  { id: "lisa-p", name: "Lisa P.", xp: 3500, streak: 9, avatar: "🎯", rank: 7, change: 1, league: "silver", drillsCompleted: 48, winStreak: 4 },
  { id: "tom-w", name: "Tom W.", xp: 3200, streak: 6, avatar: "🏓", rank: 8, change: -1, league: "silver", drillsCompleted: 42, winStreak: 1 },
];

const weeklyChallengers = [
  { id: "sarah-k", name: "Sarah K.", avatar: "⚽", challengeType: "Streak Battle", status: "pending" },
  { id: "james-l", name: "James L.", avatar: "🎾", challengeType: "XP Race", status: "active" },
  { id: "emma-r", name: "Emma R.", avatar: "🏈", challengeType: "Drill Sprint", status: "won" },
];

const leagueThresholds = [
  { name: "Bronze", minXp: 0, maxXp: 1000, color: "text-amber-700", bg: "bg-amber-700/20" },
  { name: "Silver", minXp: 1000, maxXp: 3000, color: "text-slate-400", bg: "bg-slate-400/20" },
  { name: "Gold", minXp: 3000, maxXp: 7500, color: "text-amber-500", bg: "bg-amber-500/20" },
  { name: "Diamond", minXp: 7500, maxXp: Infinity, color: "text-cyan-400", bg: "bg-cyan-400/20" },
];

export const LeaguesSection = () => {
  const userXp = 4200;
  const currentLeague = leagueThresholds.find(l => userXp >= l.minXp && userXp < l.maxXp) || leagueThresholds[0];
  const nextLeague = leagueThresholds[leagueThresholds.indexOf(currentLeague) + 1];
  const progressToNext = nextLeague ? ((userXp - currentLeague.minXp) / (nextLeague.minXp - currentLeague.minXp)) * 100 : 100;

  return (
    <section id="leagues" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Compete & Climb
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn XP from completing drills, challenge other players, and climb through the leagues!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* League Progress */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-card">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-league-gold" />
              Your League Progress
            </h3>

            <div className="flex flex-wrap gap-4 mb-6">
              <LeagueBadge league="gold" rank={5} />
              <StreakCounter days={7} />
            </div>

            {/* League ladder */}
            <div className="space-y-2 mb-6">
              {leagueThresholds.map((league, idx) => (
                <div 
                  key={league.name}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    currentLeague.name === league.name ? `${league.bg} border border-${league.color.split('-')[1]}-500/30` : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${league.bg}`}>
                    {idx === 3 ? <Crown className={`w-4 h-4 ${league.color}`} /> :
                     idx === 2 ? <Trophy className={`w-4 h-4 ${league.color}`} /> :
                     idx === 1 ? <Medal className={`w-4 h-4 ${league.color}`} /> :
                     <Target className={`w-4 h-4 ${league.color}`} />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-sm ${currentLeague.name === league.name ? "text-foreground" : "text-muted-foreground"}`}>
                      {league.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {league.maxXp === Infinity ? `${league.minXp.toLocaleString()}+ XP` : `${league.minXp.toLocaleString()} - ${league.maxXp.toLocaleString()} XP`}
                    </div>
                  </div>
                  {currentLeague.name === league.name && (
                    <div className="text-xs font-bold text-primary">YOU</div>
                  )}
                </div>
              ))}
            </div>

            {nextLeague && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XP to {nextLeague.name}</span>
                  <span className="font-bold text-foreground">{userXp.toLocaleString()} / {nextLeague.minXp.toLocaleString()}</span>
                </div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>You're in the top 15% this week!</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Leaderboard */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Global Leaderboard
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">Weekly</button>
                <button className="px-3 py-1 text-xs font-bold bg-secondary text-muted-foreground rounded-full hover:bg-secondary/80">All Time</button>
              </div>
            </div>

            <div className="space-y-2">
              {leaderboard.map((player) => (
                <Link
                  key={player.id}
                  to={player.isUser ? "/profile" : `/profile/${player.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    player.isUser
                      ? "bg-primary/10 border-2 border-primary"
                      : player.rank <= 3
                        ? "bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/10"
                        : "bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 flex items-center justify-center font-extrabold rounded-lg ${
                    player.rank === 1 ? "bg-amber-500 text-white" :
                    player.rank === 2 ? "bg-slate-400 text-white" :
                    player.rank === 3 ? "bg-amber-700 text-white" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {player.rank}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl relative">
                    {player.avatar}
                    {player.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{player.name}</span>
                      {player.isUser && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">YOU</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{player.drillsCompleted} drills</span>
                      <span className="text-xp font-bold">{player.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4">
                    {/* Win Streak */}
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Swords className="w-4 h-4" />
                        <span className="font-bold text-sm">{player.winStreak}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Win Streak</div>
                    </div>
                    
                    {/* Daily Streak */}
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-streak">
                        <Flame className="w-4 h-4 fill-current" />
                        <span className="font-bold text-sm">{player.streak}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Day Streak</div>
                    </div>
                  </div>
                  
                  {/* Position change */}
                  <div className={`flex items-center gap-1 text-sm font-bold ${
                    player.change > 0 ? "text-success" : player.change < 0 ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {player.change > 0 ? `↑${player.change}` : player.change < 0 ? `↓${Math.abs(player.change)}` : "—"}
                  </div>
                </Link>
              ))}
            </div>

            {/* View more */}
            <button className="w-full mt-4 py-3 text-center text-sm font-bold text-primary hover:text-primary/80 flex items-center justify-center gap-2">
              View Full Leaderboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" />
              Weekly Challenges
            </h3>
            <span className="text-sm text-muted-foreground">3 days left</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {weeklyChallengers.map((challenger) => (
              <div 
                key={challenger.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  challenger.status === "won" 
                    ? "bg-success/10 border-success/30" 
                    : challenger.status === "active"
                      ? "bg-primary/10 border-primary/30 animate-pulse"
                      : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl">
                    {challenger.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{challenger.name}</div>
                    <div className="text-xs text-muted-foreground">{challenger.challengeType}</div>
                  </div>
                </div>
                
                <div className={`text-center py-2 rounded-lg font-bold text-sm ${
                  challenger.status === "won" 
                    ? "bg-success/20 text-success" 
                    : challenger.status === "active"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                }`}>
                  {challenger.status === "won" ? "🏆 Victory!" : 
                   challenger.status === "active" ? "⚔️ In Progress" : 
                   "Challenge"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaguesSection;
