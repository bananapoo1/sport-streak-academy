import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Flame, Target, Zap, Edit2, Lock, Check, Users, UserPlus, Bell, Mail, X, Swords, Crown } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useFriends } from "@/hooks/useFriends";
import { useChallenges } from "@/hooks/useChallenges";
import { useStreakFreeze } from "@/hooks/useStreakFreeze";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import DailyGoalSetter from "@/components/DailyGoalSetter";
import StreakFreezeCard from "@/components/StreakFreezeCard";
import WeeklyLeaderboard from "@/components/WeeklyLeaderboard";
import MobileQuickActions from "@/components/MobileQuickActions";
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

const frameOptions = [
  { id: "default", name: "Default", unlocked: true, requirement: "" },
  { id: "bronze", name: "Bronze Ring", unlocked: true, requirement: "" },
  { id: "silver", name: "Silver Ring", unlocked: true, requirement: "" },
  { id: "gold", name: "Gold Ring", unlocked: false, requirement: "Reach Gold League" },
  { id: "diamond", name: "Diamond Ring", unlocked: false, requirement: "Reach Diamond League" },
  { id: "fire", name: "Fire Aura", unlocked: false, requirement: "30-Day Streak" },
  { id: "champion", name: "Champion Crown", unlocked: false, requirement: "Win 10 Challenges" },
  { id: "legendary", name: "Legendary Aura", unlocked: false, requirement: "Unlock 5 Legendary Achievements" },
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

const drillOptions = [
  { id: "football-ball-control-1-level-1", name: "First Touch", sport: "football", xp: 30 },
  { id: "football-passing-1-level-1", name: "Short Passing", sport: "football", xp: 30 },
  { id: "football-shooting-1-level-1", name: "Power Shots", sport: "football", xp: 30 },
  { id: "basketball-ball-handling-1-level-1", name: "Stationary Dribbling", sport: "basketball", xp: 30 },
  { id: "basketball-shooting-1-level-1", name: "Form Shooting", sport: "basketball", xp: 30 },
];

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { streak, todayProgress } = useProgress();
  const { friends, pendingRequests, sentRequests, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends();
  const { sendChallenge } = useChallenges();
  const { freezeCount, loading: freezeLoading } = useStreakFreeze();
  const { goal, todayProgress: goalProgress, updateGoal } = useDailyGoal();
  const { isPro } = useSubscription();
  const [selectedAvatar, setSelectedAvatar] = useState("⚽");
  const [selectedFrame, setSelectedFrame] = useState("default");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");
  const [inAppReminders, setInAppReminders] = useState(true);
  const [emailReminders, setEmailReminders] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null);

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
        // Always default to football emoji if no avatar or "default" avatar
        const avatarValue = data.avatar_id && data.avatar_id !== "default" ? data.avatar_id : "⚽";
        setSelectedAvatar(avatarValue);
        setSelectedFrame(data.frame_id || "default");
      }

      // Fetch reminder settings
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
    toast({ title: "Avatar Updated!", description: `Your avatar is now ${avatar}` });
  };

  const handleFrameChange = async (frameId: string, unlocked: boolean) => {
    if (!unlocked) return;
    setSelectedFrame(frameId);
    if (user) {
      await supabase
        .from("profiles")
        .update({ frame_id: frameId })
        .eq("id", user.id);
    }
    toast({ title: "Frame Updated!", description: `Profile frame changed` });
  };

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) return;
    const result = await sendFriendRequest(friendUsername.trim());
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      setFriendUsername("");
    }
  };

  const handleReminderChange = async (type: "in_app" | "email", value: boolean) => {
    if (!user) return;

    if (type === "in_app") {
      setInAppReminders(value);
      await supabase
        .from("reminder_settings")
        .update({ in_app_reminders: value })
        .eq("user_id", user.id);
    } else {
      setEmailReminders(value);
      await supabase
        .from("reminder_settings")
        .update({ email_reminders: value })
        .eq("user_id", user.id);
    }

    toast({ title: "Settings saved" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 md:pt-24 md:pb-16">
          <MobileQuickActions />
          <div className="container mx-auto px-4 max-w-4xl space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <MobileQuickActions />
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-extrabold text-foreground mb-8">My Profile</h1>

          {/* Profile Header */}
          <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-card mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-5xl border-4 border-primary">
                  {selectedAvatar}
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-extrabold text-foreground mb-2">
                  {profile?.username || profile?.display_name || "Athlete"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Recently"}
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <LeagueBadge league="silver" rank={12} />
                  <StreakCounter days={streak} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Trophy className="w-8 h-8 text-league-gold mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{profile?.total_xp?.toLocaleString() || 0}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{todayProgress.drills_completed}</div>
              <div className="text-sm text-muted-foreground">Today's Drills</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Flame className="w-8 h-8 text-streak mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{profile?.longest_streak || 0}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center shadow-soft">
              <Zap className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{todayProgress.xp_earned}</div>
              <div className="text-sm text-muted-foreground">Today's XP</div>
            </div>
          </div>

          {/* Daily Goal & Streak Freeze Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <DailyGoalSetter 
              currentGoal={goal} 
              onGoalChange={updateGoal} 
            />
            <StreakFreezeCard 
              freezeCount={freezeCount}
              hasSubscription={isPro}
              onGetMore={() => navigate("/#pricing")}
            />
          </div>

          {/* Weekly Leaderboard */}
          <div className="mb-6">
            <WeeklyLeaderboard />
          </div>

          {/* Friends Section */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Friends ({friends.length})
            </h3>

            {/* Add Friend */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter username to add friend"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              />
              <Button onClick={handleAddFriend}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pending Requests</h4>
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-secondary/50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{request.avatar_id && request.avatar_id !== "default" ? request.avatar_id : "⚽"}</span>
                        <span className="font-medium">{request.username || "Unknown"}</span>
                      </div>
                      <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                        Accept
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests (Awaiting acceptance) */}
            {sentRequests.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Sent Requests (Awaiting)</h4>
                <div className="space-y-2">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{request.avatar_id || "⚽"}</span>
                        <div>
                          <span className="font-medium block">{request.username || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">Waiting for response...</span>
                        </div>
                      </div>
                      <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between bg-secondary/30 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{friend.avatar_id && friend.avatar_id !== "default" ? friend.avatar_id : "⚽"}</span>
                      <div>
                        <span className="font-medium block">{friend.username || "Unknown"}</span>
                        <span className="text-xs text-streak flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {friend.current_streak} day streak
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedFriend({ id: friend.id, username: friend.username || "Friend" });
                          setChallengeDialogOpen(true);
                        }}
                      >
                        <Swords className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeFriend(friend.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No friends yet. Add someone above!</p>
            )}
          </div>

          {/* Challenge Friend Dialog */}
          <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Challenge {selectedFriend?.username}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">Select a drill to challenge your friend:</p>
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
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-primary/10 border border-border hover:border-primary transition-all"
                  >
                    <div className="text-left">
                      <span className="font-medium block">{drill.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{drill.sport}</span>
                    </div>
                    <span className="text-sm text-primary font-bold">+{drill.xp} XP</span>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Streak Reminders */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-streak" />
              Streak Reminders
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <Label htmlFor="in-app-reminders">In-app reminders</Label>
                </div>
                <Switch
                  id="in-app-reminders"
                  checked={inAppReminders}
                  onCheckedChange={(v) => handleReminderChange("in_app", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <Label htmlFor="email-reminders">Email reminders</Label>
                </div>
                <Switch
                  id="email-reminders"
                  checked={emailReminders}
                  onCheckedChange={(v) => handleReminderChange("email", v)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Friends can remind you to keep your streak going!
              </p>
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
                  key={avatar.emoji}
                  onClick={() => avatar.unlocked && handleAvatarChange(avatar.emoji)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all relative ${
                    avatar.unlocked ? "hover:scale-110 cursor-pointer" : "opacity-50 cursor-not-allowed"
                  } ${
                    selectedAvatar === avatar.emoji
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                  title={avatar.unlocked ? avatar.name : `🔒 ${avatar.requirement}`}
                >
                  {avatar.emoji}
                  {!avatar.unlocked && (
                    <Lock className="w-4 h-4 absolute -bottom-1 -right-1 text-muted-foreground bg-card rounded-full p-0.5" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Unlock more avatars by completing achievements!
            </p>
          </div>

          {/* Profile Frames */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-xp" />
              Profile Frames
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {frameOptions.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameChange(frame.id, frame.unlocked)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    frame.unlocked
                      ? selectedFrame === frame.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary cursor-pointer"
                      : "border-border/50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{frame.name}</span>
                    {frame.unlocked ? (
                      selectedFrame === frame.id ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <Check className="w-5 h-5 text-success" />
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {!frame.unlocked && (
                    <p className="text-xs text-muted-foreground">{frame.requirement}</p>
                  )}
                </button>
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