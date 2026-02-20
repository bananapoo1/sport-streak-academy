import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Trophy, Flame, Target, Zap, Edit2, Lock, Check, Users, UserPlus,
  Bell, Mail, X, Swords, Crown, ChevronRight, LogOut, Settings,
  Calendar, Award, TrendingUp, Shield, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useFriends } from "@/hooks/useFriends";
import { useChallenges } from "@/hooks/useChallenges";
import { useStreakFreeze } from "@/hooks/useStreakFreeze";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { useSubscription } from "@/hooks/useSubscription";
import { useOnboardingPreferences } from "@/hooks/useOnboardingPreferences";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import DailyGoalSetter from "@/components/DailyGoalSetter";
import { Skeleton } from "@/components/ui/skeleton";

const avatarOptions = [
  { emoji: "⚽", name: "Football", unlocked: true },
  { emoji: "🏀", name: "Basketball", unlocked: true },
  { emoji: "🎾", name: "Tennis", unlocked: true },
  { emoji: "🏈", name: "American Football", unlocked: true },
  { emoji: "⛳", name: "Golf", unlocked: true },
  { emoji: "🏐", name: "Volleyball", unlocked: true },
  { emoji: "🏑", name: "Hockey", unlocked: true },
  { emoji: "🏓", name: "Table Tennis", unlocked: true },
  { emoji: "🏏", name: "Cricket", unlocked: true },
  { emoji: "🏉", name: "Rugby", unlocked: true },
  { emoji: "⚾", name: "Baseball", unlocked: true },
  { emoji: "🎯", name: "Target", unlocked: true },
  { emoji: "🔥", name: "Fire", unlocked: false, requirement: "7-Day Streak" },
  { emoji: "⭐", name: "Star", unlocked: false, requirement: "Reach 1,000 XP" },
  { emoji: "💎", name: "Diamond", unlocked: false, requirement: "Reach Diamond League" },
  { emoji: "👑", name: "Crown", unlocked: false, requirement: "Win 5 Challenges" },
  { emoji: "🦁", name: "Lion", unlocked: false, requirement: "Complete 100 Drills" },
  { emoji: "🐉", name: "Dragon", unlocked: false, requirement: "30-Day Streak" },
];

const drillOptions = [
  { id: "football-ball-control-1-level-1", name: "First Touch", sport: "football", xp: 30 },
  { id: "football-passing-1-level-1", name: "Short Passing", sport: "football", xp: 30 },
  { id: "football-shooting-1-level-1", name: "Power Shots", sport: "football", xp: 30 },
  { id: "basketball-ball-handling-1-level-1", name: "Stationary Dribbling", sport: "basketball", xp: 30 },
  { id: "basketball-shooting-1-level-1", name: "Form Shooting", sport: "basketball", xp: 30 },
];

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TabId = "stats" | "friends" | "settings";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { streak, todayProgress } = useProgress();
  const { friends, pendingRequests, sentRequests, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends();
  const { sendChallenge } = useChallenges();
  const { freezeCount } = useStreakFreeze();
  const { goal, updateGoal } = useDailyGoal();
  const { isPro } = useSubscription();
  const { activeSport, skillLevel, personalTag, sessionMinutes } = useOnboardingPreferences();

  const [selectedAvatar, setSelectedAvatar] = useState("⚽");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");
  const [inAppReminders, setInAppReminders] = useState(true);
  const [emailReminders, setEmailReminders] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("stats");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        const avatarValue = data.avatar_id && data.avatar_id !== "default" ? data.avatar_id : "⚽";
        setSelectedAvatar(avatarValue);
      }

      const { data: settings } = await supabase
        .from("reminder_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settings) {
        setInAppReminders(settings.in_app_reminders);
        setEmailReminders(settings.email_reminders);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleAvatarChange = async (avatar: string) => {
    setSelectedAvatar(avatar);
    if (user) {
      await supabase
        .from("profiles")
        .update({ avatar_id: avatar })
        .eq("id", user.id);
    }
    setAvatarDialogOpen(false);
    toast({ title: "Avatar Updated!", description: `Your avatar is now ${avatar}` });
  };

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) return;
    const result = await sendFriendRequest(friendUsername.trim());
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      setFriendUsername("");
      toast({ title: "Request Sent" });
    }
  };

  const handleReminderChange = async (type: "in_app" | "email", value: boolean) => {
    if (!user) return;
    if (type === "in_app") {
      setInAppReminders(value);
      await supabase.from("reminder_settings").update({ in_app_reminders: value }).eq("user_id", user.id);
    } else {
      setEmailReminders(value);
      await supabase.from("reminder_settings").update({ email_reminders: value }).eq("user_id", user.id);
    }
    toast({ title: "Settings saved" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  /** Format join date */
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : null;

  /** XP level calculation */
  const totalXp = profile?.total_xp ?? 0;
  const level = Math.floor(totalXp / 250) + 1;
  const xpInLevel = totalXp % 250;
  const xpProgress = (xpInLevel / 250) * 100;

  /** Skill label */
  const skillLabel = skillLevel === "beginner" ? "Beginner" : skillLevel === "intermediate" ? "Intermediate" : skillLevel === "advanced" ? "Advanced" : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24">
          <div className="container mx-auto px-4 max-w-md space-y-4">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto space-y-4">

            {/* ══════════ HERO CARD ══════════ */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border shadow-soft">
              {/* Top accent */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-streak to-xp" />

              <div className="p-5 pb-4">
                {/* Avatar + Name row */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAvatarDialogOpen(true)}
                    className="relative group"
                    aria-label="Change avatar"
                  >
                    <div className="w-[72px] h-[72px] rounded-2xl bg-background/80 border-2 border-primary/30 flex items-center justify-center text-4xl transition-transform group-hover:scale-105 group-active:scale-95">
                      {selectedAvatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Edit2 className="w-3 h-3" />
                    </div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-extrabold text-foreground truncate">
                      {profile?.display_name || profile?.username || personalTag || "Athlete"}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {skillLabel && (
                        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {skillLabel}
                        </span>
                      )}
                      {isPro && (
                        <span className="text-[10px] font-semibold bg-xp/10 text-xp px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                      {joinedDate && (
                        <span className="text-[10px] text-muted-foreground">Since {joinedDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* XP Level bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">Level {level}</span>
                    <span className="text-muted-foreground">{xpInLevel} / 250 XP</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-xp transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>

                {/* Quick stats chips */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-foreground">{totalXp.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-streak">{streak}</div>
                    <div className="text-[10px] text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-foreground">{profile?.longest_streak ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground">Best</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-foreground">{friends.length}</div>
                    <div className="text-[10px] text-muted-foreground">Friends</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════ TODAY'S SNAPSHOT ══════════ */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <Zap className="w-4 h-4 text-xp mx-auto mb-1" />
                  <div className="text-base font-extrabold text-foreground">{todayProgress.xp_earned}</div>
                  <div className="text-[10px] text-muted-foreground">XP Today</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-base font-extrabold text-foreground">{todayProgress.drills_completed}</div>
                  <div className="text-[10px] text-muted-foreground">Drills</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <Clock className="w-4 h-4 text-success mx-auto mb-1" />
                  <div className="text-base font-extrabold text-foreground">{todayProgress.minutes_completed}</div>
                  <div className="text-[10px] text-muted-foreground">Minutes</div>
                </CardContent>
              </Card>
            </div>

            {/* ══════════ TAB SWITCHER ══════════ */}
            <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
              {([
                { id: "stats" as const, label: "Stats", icon: TrendingUp },
                { id: "friends" as const, label: "Friends", icon: Users },
                { id: "settings" as const, label: "Settings", icon: Settings },
              ]).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ══════════ STATS TAB ══════════ */}
            {activeTab === "stats" && (
              <div className="space-y-3">
                {/* Daily Goal */}
                <DailyGoalSetter currentGoal={goal} onGoalChange={updateGoal} />

                {/* Streak Freeze */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">Streak Freezes</p>
                          <p className="text-xs text-muted-foreground">Protect your streak on rest days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-extrabold text-foreground">{freezeCount}</span>
                        <span className="text-xs text-muted-foreground">left</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Achievements */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-league-gold" />
                        Achievements
                      </h3>
                      <Link to="/achievements" className="text-xs text-primary font-medium flex items-center gap-0.5">
                        View all <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: "🎯", label: "First Drill", done: true },
                        { icon: "⚡", label: "7-Day", done: streak >= 7 },
                        { icon: "💯", label: "100 Drills", done: false },
                        { icon: "🔥", label: "30 Days", done: streak >= 30 },
                      ].map((a) => (
                        <div
                          key={a.label}
                          className={`rounded-xl p-2 text-center ${
                            a.done ? "bg-primary/5 border border-primary/20" : "bg-muted/50 border border-border opacity-50"
                          }`}
                        >
                          <span className={`text-xl ${!a.done ? "grayscale" : ""}`}>{a.icon}</span>
                          <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{a.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Leagues link */}
                <Link to="/leagues">
                  <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-league-gold/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-league-gold" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">Leagues</p>
                            <p className="text-xs text-muted-foreground">Compete on the leaderboard</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* ══════════ FRIENDS TAB ══════════ */}
            {activeTab === "friends" && (
              <div className="space-y-3">
                {/* Add Friend */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-primary" />
                      Add Friend
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter username"
                        value={friendUsername}
                        onChange={(e) => setFriendUsername(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                        className="h-10"
                      />
                      <Button onClick={handleAddFriend} size="sm" className="h-10 px-4">
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <Card className="border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-xs font-semibold text-primary uppercase">
                        Pending · {pendingRequests.length}
                      </h3>
                      {pendingRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{req.avatar_id && req.avatar_id !== "default" ? req.avatar_id : "⚽"}</span>
                            <span className="font-medium text-sm text-foreground">{req.username || "Unknown"}</span>
                          </div>
                          <Button size="sm" variant="default" className="h-8" onClick={() => acceptFriendRequest(req.id)}>
                            Accept
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                  <Card className="border-border">
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                        Sent · {sentRequests.length}
                      </h3>
                      {sentRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{req.avatar_id || "⚽"}</span>
                            <div>
                              <span className="font-medium text-sm text-foreground block">{req.username || "Unknown"}</span>
                              <span className="text-[10px] text-muted-foreground">Waiting...</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">Pending</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Friends List */}
                {friends.length > 0 ? (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <Card key={friend.id} className="border-border">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{friend.avatar_id && friend.avatar_id !== "default" ? friend.avatar_id : "⚽"}</span>
                              <div>
                                <span className="font-semibold text-sm text-foreground block">{friend.username || "Unknown"}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-streak" /> {friend.current_streak} day streak
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedFriend({ id: friend.id, username: friend.username || "Friend" });
                                  setChallengeDialogOpen(true);
                                }}
                              >
                                <Swords className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => removeFriend(friend.id)}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-border">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No friends yet. Add someone above!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ══════════ SETTINGS TAB ══════════ */}
            {activeTab === "settings" && (
              <div className="space-y-3">
                {/* Reminders */}
                <Card className="border-border">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-streak" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="in-app-reminders" className="text-sm">In-app reminders</Label>
                        </div>
                        <Switch
                          id="in-app-reminders"
                          checked={inAppReminders}
                          onCheckedChange={(v) => handleReminderChange("in_app", v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="email-reminders" className="text-sm">Email reminders</Label>
                        </div>
                        <Switch
                          id="email-reminders"
                          checked={emailReminders}
                          onCheckedChange={(v) => handleReminderChange("email", v)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Customization */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <button
                      onClick={() => setAvatarDialogOpen(true)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                          {selectedAvatar}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground text-sm">Change Avatar</p>
                          <p className="text-xs text-muted-foreground">
                            {avatarOptions.filter((a) => a.unlocked).length} unlocked
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </CardContent>
                </Card>

                {/* Account links */}
                <Card className="border-border">
                  <CardContent className="p-1">
                    {!isPro && (
                      <Link
                        to="/pricing"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Crown className="w-5 h-5 text-xp" />
                          <span className="font-medium text-sm text-foreground">Upgrade to Pro</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    )}
                    <Link
                      to="/privacy-settings"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="font-medium text-sm text-foreground">Privacy Settings</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Link
                      to="/onboarding"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-medium text-sm text-foreground">Redo Onboarding</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>

                {/* Sign out */}
                <Button
                  variant="outline"
                  className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>

                <p className="text-center text-[10px] text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ══════════ AVATAR DIALOG ══════════ */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Choose Avatar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.emoji}
                onClick={() => avatar.unlocked && handleAvatarChange(avatar.emoji)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 transition-all relative ${
                  avatar.unlocked ? "hover:scale-110 cursor-pointer active:scale-95" : "opacity-40 cursor-not-allowed"
                } ${
                  selectedAvatar === avatar.emoji
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary hover:border-primary/50"
                }`}
                title={avatar.unlocked ? avatar.name : `🔒 ${avatar.requirement}`}
              >
                {avatar.emoji}
                {!avatar.unlocked && (
                  <Lock className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground bg-card rounded-full p-0.5" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Unlock more by hitting milestones!
          </p>
        </DialogContent>
      </Dialog>

      {/* ══════════ CHALLENGE DIALOG ══════════ */}
      <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Challenge {selectedFriend?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">Pick a drill:</p>
            {drillOptions.map((drill) => (
              <button
                key={drill.id}
                onClick={async () => {
                  if (selectedFriend) {
                    await sendChallenge(selectedFriend.id, drill.id, drill.sport);
                    setChallengeDialogOpen(false);
                    setSelectedFriend(null);
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-all"
              >
                <div className="text-left">
                  <span className="font-medium text-sm block">{drill.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{drill.sport}</span>
                </div>
                <span className="text-xs text-primary font-bold">+{drill.xp} XP</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Profile;