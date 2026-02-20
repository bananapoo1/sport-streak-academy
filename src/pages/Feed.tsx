import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useOnboardingPreferences } from "@/hooks/useOnboardingPreferences";
import { useFriends } from "@/hooks/useFriends";
import { useChallenges } from "@/hooks/useChallenges";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getChallengeDrills } from "@/data/drillsData";
import {
  Flame,
  Trophy,
  Dumbbell,
  Users,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  UserPlus,
  Target,
  Swords,
  AlertTriangle,
} from "lucide-react";

interface FeedItem {
  id: string;
  type: "streak_milestone" | "drill_completed" | "achievement" | "friend_joined" | "goal_hit" | "tip";
  title: string;
  description: string;
  timestamp: Date;
  icon: "flame" | "trophy" | "dumbbell" | "users" | "target" | "zap";
  accent?: string;
  meta?: Record<string, unknown>;
}

interface WeeklySummary {
  trainedDays: number;
  totalMinutes: number;
  totalXp: number;
  goalHitDays: number;
  trend: "up" | "down" | "flat";
  strongestCategory?: string;
  weakestCategory?: string;
}

interface FriendActivity {
  id: string;
  name: string;
  action: string;
  time: Date;
}

const iconMap = {
  flame: Flame,
  trophy: Trophy,
  dumbbell: Dumbbell,
  users: Users,
  target: Target,
  zap: Zap,
};

const accentMap: Record<string, string> = {
  streak: "text-streak bg-streak/10",
  xp: "text-xp bg-xp/10",
  success: "text-success bg-success/10",
  primary: "text-primary bg-primary/10",
  warning: "text-amber-500 bg-amber-500/10",
};

/** Build personalized feed items from user data + friends */
function buildFeedItems(
  streak: number,
  todayProgress: { drills_completed: number; minutes_completed: number; xp_earned: number; goal_minutes: number },
  skillLevel: string | null,
  friendActivity: FriendActivity[],
): FeedItem[] {
  const items: FeedItem[] = [];
  const now = new Date();

  // Today's activity summary
  if (todayProgress.drills_completed > 0) {
    items.push({
      id: "today-summary",
      type: "drill_completed",
      title: `You completed ${todayProgress.drills_completed} drill${todayProgress.drills_completed > 1 ? "s" : ""} today`,
      description: `${todayProgress.minutes_completed} min trained · ${todayProgress.xp_earned} XP earned`,
      timestamp: now,
      icon: "dumbbell",
      accent: "primary",
    });
  }

  // Goal hit
  if (todayProgress.minutes_completed >= todayProgress.goal_minutes && todayProgress.goal_minutes > 0) {
    items.push({
      id: "goal-hit",
      type: "goal_hit",
      title: "Daily goal smashed!",
      description: `You hit your ${todayProgress.goal_minutes}-minute target. Keep the momentum going.`,
      timestamp: now,
      icon: "target",
      accent: "success",
    });
  }

  // Streak milestones
  if (streak > 0 && [3, 7, 14, 21, 30, 50, 100].includes(streak)) {
    items.push({
      id: `streak-${streak}`,
      type: "streak_milestone",
      title: `${streak}-Day Streak!`,
      description: streak >= 30
        ? "You're in the elite tier. Incredible discipline."
        : streak >= 7
          ? "A full week of consistency — that's how habits form."
          : "You're building momentum. Don't stop now!",
      timestamp: now,
      icon: "flame",
      accent: "streak",
    });
  } else if (streak > 0) {
    items.push({
      id: "streak-current",
      type: "streak_milestone",
      title: `${streak}-day streak active`,
      description: "Train today to keep it alive.",
      timestamp: now,
      icon: "flame",
      accent: "streak",
    });
  }

  // Friend activity
  friendActivity.forEach((friend, i) => {
    items.push({
      id: `friend-${i}`,
      type: "friend_joined",
      title: friend.name,
      description: friend.action,
      timestamp: friend.time,
      icon: "users",
      accent: "primary",
    });
  });

  // Skill-appropriate training tips
  const tips: Record<string, { title: string; description: string }[]> = {
    beginner: [
      { title: "Tip: Focus on form", description: "Speed comes later — nail the technique first." },
      { title: "Tip: Short sessions win", description: "10 minutes of focused practice beats 60 minutes of going through the motions." },
    ],
    intermediate: [
      { title: "Tip: Vary your drills", description: "Challenge yourself with different categories to become well-rounded." },
      { title: "Tip: Track your progress", description: "Check your stats to see how far you've come." },
    ],
    advanced: [
      { title: "Tip: Push your limits", description: "Try harder difficulty drills to keep improving." },
      { title: "Tip: Teach someone", description: "Explaining a drill to others deepens your own understanding." },
    ],
  };

  const levelTips = tips[skillLevel ?? "beginner"] ?? tips.beginner;
  const tipIndex = Math.floor(now.getDate() / 2) % levelTips.length; // rotate tips
  items.push({
    id: "daily-tip",
    type: "tip",
    title: levelTips[tipIndex].title,
    description: levelTips[tipIndex].description,
    timestamp: new Date(now.getTime() - 3600_000), // show slightly in the past
    icon: "zap",
    accent: "warning",
  });

  // Sort by timestamp descending
  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return items;
}

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { todayProgress, streak } = useProgress();
  const { activeSport, skillLevel } = useOnboardingPreferences();
  const { friends } = useFriends();
  const { sendChallenge } = useChallenges();
  const [friendActivity, setFriendActivity] = useState<FriendActivity[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const rematchTemplate = (() => {
    const bySport = getChallengeDrills().find((entry) => entry.sport === activeSport);
    const fallback = getChallengeDrills()[0];
    const selected = bySport ?? fallback;
    const drill = selected?.drills[0];
    return drill
      ? { drillId: drill.id, sport: selected.sport, title: drill.title }
      : null;
  })();

  const milestoneNudges = friends
    .filter((friend) => [2, 6, 13, 29].includes(friend.current_streak))
    .slice(0, 3);

  // Fetch friend activity
  useEffect(() => {
    if (!user) {
      setLoadingFriends(false);
      return;
    }

    const fetchFriends = async () => {
      try {
        // Get accepted friendships
        const { data: friendships } = await supabase
          .from("friendships")
          .select("friend_id, user_id")
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq("status", "accepted");

        if (!friendships || friendships.length === 0) {
          setLoadingFriends(false);
          return;
        }

        const friendIds = friendships.map((f) =>
          f.user_id === user.id ? f.friend_id : f.user_id
        );

        // Get friend profiles and today's progress
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", friendIds);

        const today = new Date().toISOString().slice(0, 10);
        const { data: progress } = await supabase
          .from("daily_progress")
          .select("user_id, drills_completed, minutes_completed")
          .in("user_id", friendIds)
          .eq("date", today);

        const activity: FriendActivity[] = [];
        (progress ?? []).forEach((p) => {
          const profile = profiles?.find((pr) => pr.id === p.user_id);
          const name = profile?.display_name || profile?.username || "A friend";
          if (p.drills_completed > 0) {
            activity.push({
              id: p.user_id,
              name,
              action: `Completed ${p.drills_completed} drill${p.drills_completed > 1 ? "s" : ""} · ${p.minutes_completed} min`,
              time: new Date(),
            });
          }
        });

        setFriendActivity(activity);
      } catch (err) {
        console.error("Error fetching friend activity:", err);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadWeeklySummary = async () => {
      try {
        const today = new Date();
        const start14 = new Date(today);
        start14.setDate(start14.getDate() - 13);

        const { data } = await supabase
          .from("daily_progress")
          .select("date, minutes_completed, xp_earned, goal_minutes")
          .eq("user_id", user.id)
          .gte("date", start14.toISOString().slice(0, 10));

        const rows = data ?? [];
        const last7Cutoff = new Date(today);
        last7Cutoff.setDate(last7Cutoff.getDate() - 6);

        const last7 = rows.filter((row) => new Date(row.date) >= last7Cutoff);
        const prev7 = rows.filter((row) => new Date(row.date) < last7Cutoff);

        const last7Xp = last7.reduce((sum, row) => sum + row.xp_earned, 0);
        const prev7Xp = prev7.reduce((sum, row) => sum + row.xp_earned, 0);
        const trend: WeeklySummary["trend"] =
          last7Xp > prev7Xp + 25 ? "up" : last7Xp < prev7Xp - 25 ? "down" : "flat";

        let strongestCategory: string | undefined;
        let weakestCategory: string | undefined;
        const mockRaw = localStorage.getItem("ssa.mock.api.db.v1");
        if (mockRaw) {
          try {
            const parsed = JSON.parse(mockRaw) as {
              users?: Record<string, { confidenceByCategory?: Record<string, number> }>;
            };
            const confidence = parsed.users?.[user.id]?.confidenceByCategory;
            if (confidence) {
              const entries = Object.entries(confidence);
              entries.sort((a, b) => b[1] - a[1]);
              strongestCategory = entries[0]?.[0];
              weakestCategory = entries[entries.length - 1]?.[0];
            }
          } catch {
            // Ignore malformed local mock payload
          }
        }

        setWeeklySummary({
          trainedDays: last7.filter((row) => row.minutes_completed > 0).length,
          totalMinutes: last7.reduce((sum, row) => sum + row.minutes_completed, 0),
          totalXp: last7Xp,
          goalHitDays: last7.filter((row) => row.goal_minutes > 0 && row.minutes_completed >= row.goal_minutes).length,
          trend,
          strongestCategory,
          weakestCategory,
        });
      } catch (err) {
        console.error("Error loading weekly summary:", err);
      }
    };

    loadWeeklySummary();
  }, [user]);

  const feedItems = buildFeedItems(streak, todayProgress, skillLevel, friendActivity);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-foreground">Activity Feed</h1>
                <p className="text-sm text-muted-foreground">Your training story</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{streak} day streak</span>
              </div>
            </div>

            {/* Weekly adaptation summary */}
            {weeklySummary && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Weekly Adaptation</p>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-background border border-border text-muted-foreground">
                      {weeklySummary.trend === "up" ? "Trending up" : weeklySummary.trend === "down" ? "Needs rebound" : "Steady"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-foreground">{weeklySummary.trainedDays}</p>
                      <p className="text-[10px] text-muted-foreground">Days trained</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-foreground">{weeklySummary.totalMinutes}</p>
                      <p className="text-[10px] text-muted-foreground">Minutes</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-foreground">{weeklySummary.totalXp}</p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                  </div>
                  {(weeklySummary.strongestCategory || weeklySummary.weakestCategory) && (
                    <p className="text-xs text-muted-foreground">
                      Strongest: <span className="capitalize text-foreground font-medium">{weeklySummary.strongestCategory ?? "—"}</span>
                      {" · "}
                      Focus next: <span className="capitalize text-foreground font-medium">{weeklySummary.weakestCategory ?? "—"}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social accountability nudges */}
            {(milestoneNudges.length > 0 || friendActivity.length > 0) && (
              <Card className="border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Accountability Nudges</p>
                  </div>

                  {milestoneNudges.map((friend) => {
                    const nextMilestone = friend.current_streak === 2
                      ? 3
                      : friend.current_streak === 6
                        ? 7
                        : friend.current_streak === 13
                          ? 14
                          : 30;

                    return (
                      <div key={friend.id} className="rounded-xl border border-border bg-secondary/30 p-3">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{friend.username || "Friend"}</span>
                          {` is 1 day away from a ${nextMilestone}-day streak.`}
                        </p>
                        {rematchTemplate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 h-8 text-xs"
                            onClick={async () => {
                              await sendChallenge(friend.id, rematchTemplate.drillId, rematchTemplate.sport);
                            }}
                          >
                            <Swords className="w-3.5 h-3.5 mr-1" />
                            1-tap rematch
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Feed items */}
            {feedItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center space-y-3">
                  <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No activity yet today. Start a drill to see your feed come alive!
                  </p>
                  <Button onClick={() => navigate("/sports")} className="mt-2">
                    Start Training
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {feedItems.map((item) => {
                  const Icon = iconMap[item.icon];
                  const accent = accentMap[item.accent ?? "primary"];

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Invite friends CTA */}
            {friendActivity.length === 0 && !loadingFriends && (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center space-y-2">
                  <UserPlus className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium text-foreground">Train with friends</p>
                  <p className="text-xs text-muted-foreground">
                    Add friends to see their progress and cheer each other on.
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default Feed;
