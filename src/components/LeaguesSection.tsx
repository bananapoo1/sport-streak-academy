import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Users, Flame, Medal, Crown, Target, Swords, ChevronRight } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useAchievements } from "@/hooks/useAchievements";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardPlayer {
  id: string;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  isUser?: boolean;
  rank: number;
  league: "bronze" | "silver" | "gold" | "diamond";
  drillsCompleted: number;
}

const leagueThresholds = [
  { name: "Bronze", minXp: 0, maxXp: 5000, color: "text-amber-700", bg: "bg-amber-700/20", league: "bronze" as const },
  { name: "Silver", minXp: 5000, maxXp: 15000, color: "text-slate-400", bg: "bg-slate-400/20", league: "silver" as const },
  { name: "Gold", minXp: 15000, maxXp: 50000, color: "text-amber-500", bg: "bg-amber-500/20", league: "gold" as const },
  { name: "Diamond", minXp: 50000, maxXp: Infinity, color: "text-cyan-400", bg: "bg-cyan-400/20", league: "diamond" as const },
];

const getLeague = (xp: number): "bronze" | "silver" | "gold" | "diamond" => {
  const league = leagueThresholds.find(l => xp >= l.minXp && xp < l.maxXp);
  return league?.league || "bronze";
};

export const LeaguesSection = () => {
  const { user } = useAuth();
  const { streak } = useProgress();
  const { userStats, loading: statsLoading } = useAchievements();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch top players from profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_id, total_xp, current_streak")
          .order("total_xp", { ascending: false })
          .limit(10);

        if (profiles) {
          const avatarEmojis = ["🏀", "⚽", "🎾", "🏈", "🏐", "🎯", "🏓", "⭐", "🔥", "💪"];
          
          const leaderboardData: LeaderboardPlayer[] = profiles.map((profile, index) => {
            // Get drill count for each user
            const isCurrentUser = user?.id === profile.id;
            
            return {
              id: profile.id,
              name: isCurrentUser ? "You" : (profile.display_name || profile.username || `Player ${index + 1}`),
              xp: profile.total_xp || 0,
              streak: profile.current_streak || 0,
              avatar: avatarEmojis[index % avatarEmojis.length],
              isUser: isCurrentUser,
              rank: index + 1,
              league: getLeague(profile.total_xp || 0),
              drillsCompleted: 0, // Would need additional query
            };
          });
          
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  const userXp = userStats.totalXp;
  const currentLeague = leagueThresholds.find(l => userXp >= l.minXp && userXp < l.maxXp) || leagueThresholds[0];
  const nextLeague = leagueThresholds[leagueThresholds.indexOf(currentLeague) + 1];
  const progressToNext = nextLeague ? ((userXp - currentLeague.minXp) / (nextLeague.minXp - currentLeague.minXp)) * 100 : 100;
  const userRank = leaderboard.findIndex(p => p.isUser) + 1 || leaderboard.length + 1;

  const handleChallenge = (playerName: string) => {
    toast.info(`Challenge feature coming soon!`, {
      description: `You'll be able to challenge ${playerName} in future updates.`,
    });
  };

  if (!user) {
    return (
      <section id="leagues" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Compete & Climb
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sign in to see your league ranking and compete with other players!
            </p>
            <Link to="/auth" className="inline-block mt-6">
              <Button variant="hero" size="lg">
                Sign In to Compete
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
              <LeagueBadge league={currentLeague.league} rank={userRank} />
              <StreakCounter days={streak} />
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
                  <span>Complete drills to earn more XP!</span>
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
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-secondary animate-pulse rounded-xl" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No players yet. Be the first to complete a drill!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((player) => (
                  <div
                    key={player.id}
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
                        {player.isUser ? (
                          <span className="font-bold text-foreground truncate">{player.name}</span>
                        ) : (
                          <Link 
                            to={`/profile/${player.id}`}
                            className="font-bold text-foreground truncate hover:text-primary transition-colors"
                          >
                            {player.name}
                          </Link>
                        )}
                        {player.isUser && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">YOU</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="text-xp font-bold">{player.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4">
                      {/* Daily Streak */}
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-streak">
                          <Flame className="w-4 h-4 fill-current" />
                          <span className="font-bold text-sm">{player.streak}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Streak</div>
                      </div>
                    </div>
                    
                    {/* Challenge button */}
                    {!player.isUser && (
                      <button
                        onClick={() => handleChallenge(player.name)}
                        className="text-xs font-bold text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        <Swords className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Challenges - Placeholder for future */}
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" />
              Weekly Challenges
            </h3>
            <span className="text-sm text-muted-foreground">Coming Soon!</span>
          </div>
          <p className="text-muted-foreground">
            Challenge other players to weekly competitions and earn bonus XP. Stay tuned for updates!
          </p>
        </div>
      </div>
    </section>
  );
};

export default LeaguesSection;
