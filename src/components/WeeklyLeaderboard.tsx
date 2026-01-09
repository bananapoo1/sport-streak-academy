import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp, Users, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_id: string | null;
  current_streak: number | null;
  weekly_xp: number;
  days_active: number;
}

const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return { icon: Crown, color: "text-league-gold", bg: "bg-league-gold/20", label: "Champion" };
    case 2:
      return { icon: Medal, color: "text-league-silver", bg: "bg-league-silver/20", label: "Runner-up" };
    case 3:
      return { icon: Medal, color: "text-league-bronze", bg: "bg-league-bronze/20", label: "3rd Place" };
    default:
      return null;
  }
};

const WeeklyLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Query the view
        const { data, error } = await supabase
          .from("weekly_leaderboard")
          .select("*")
          .limit(20);

        if (error) throw error;

        if (data) {
          setLeaderboard(data as LeaderboardEntry[]);
          
          // Find user's rank
          if (user) {
            const userIndex = data.findIndex((entry: LeaderboardEntry) => entry.id === user.id);
            if (userIndex !== -1) {
              setUserRank(userIndex + 1);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-league-gold/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-league-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Weekly Leaderboard</h3>
            <p className="text-sm text-muted-foreground">Compete with friends this week</p>
          </div>
        </div>
        {userRank && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <p className="text-2xl font-bold text-primary">#{userRank}</p>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No activity this week yet</p>
          <p className="text-sm text-muted-foreground">Complete drills to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            const isCurrentUser = user?.id === entry.id;
            const displayName = entry.display_name || entry.username || "Anonymous";
            const avatar = entry.avatar_id && entry.avatar_id !== "default" ? entry.avatar_id : "⚽";

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all",
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-secondary/30 hover:bg-secondary/50",
                  badge && "border-2",
                  rank === 1 && "border-league-gold/50",
                  rank === 2 && "border-league-silver/50",
                  rank === 3 && "border-league-bronze/50"
                )}
              >
                {/* Rank */}
                <div className="w-10 text-center">
                  {badge ? (
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mx-auto", badge.bg)}>
                      <badge.icon className={cn("w-5 h-5", badge.color)} />
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="text-2xl">{avatar}</div>

                {/* Name & Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-semibold truncate",
                      isCurrentUser ? "text-primary" : "text-foreground"
                    )}>
                      {displayName}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-streak" />
                      {entry.current_streak || 0} streak
                    </span>
                    <span>{entry.days_active} days active</span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xp font-bold">
                    <TrendingUp className="w-4 h-4" />
                    {entry.weekly_xp.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">XP this week</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyLeaderboard;
