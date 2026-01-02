import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Flame, Target, TrendingUp, Zap, UserPlus, Check, Swords } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useChallenges } from "@/hooks/useChallenges";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserData {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_id: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  created_at: string | null;
}

const getLeague = (xp: number): "bronze" | "silver" | "gold" | "diamond" => {
  if (xp >= 50000) return "diamond";
  if (xp >= 15000) return "gold";
  if (xp >= 5000) return "silver";
  return "bronze";
};

const drillOptions = [
  { id: "dribbling-basics", name: "Dribbling Basics", sport: "football" },
  { id: "shooting-drills", name: "Shooting Drills", sport: "football" },
  { id: "passing-accuracy", name: "Passing Accuracy", sport: "football" },
  { id: "layup-practice", name: "Layup Practice", sport: "basketball" },
  { id: "free-throws", name: "Free Throws", sport: "basketball" },
  { id: "serve-practice", name: "Serve Practice", sport: "tennis" },
];

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { friends, sentRequests, sendFriendRequest } = useFriends();
  const { sendChallenge } = useChallenges();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [drillCount, setDrillCount] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [sendingChallenge, setSendingChallenge] = useState(false);

  const isFriend = friends.some(f => f.id === userId);
  const hasSentRequest = sentRequests.some(r => r.friendId === userId);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        setUserData({
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_id: profile.avatar_id,
          total_xp: profile.total_xp || 0,
          current_streak: profile.current_streak || 0,
          longest_streak: profile.longest_streak || 0,
          created_at: profile.created_at,
        });
      }

      const { count } = await supabase
        .from("completed_drills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (count !== null) {
        setDrillCount(count);
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyData } = await supabase
        .from("completed_drills")
        .select("xp_earned")
        .eq("user_id", userId)
        .gte("completed_at", weekAgo.toISOString());

      if (weeklyData) {
        setWeeklyXp(weeklyData.reduce((sum, d) => sum + (d.xp_earned || 0), 0));
      }

      setLoading(false);
    };

    fetchUserData();
  }, [userId]);

  const handleAddFriend = async () => {
    if (!userData?.username) {
      toast.error("Cannot add this user as a friend");
      return;
    }
    
    setSendingRequest(true);
    const result = await sendFriendRequest(userData.username);
    setSendingRequest(false);
    
    if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleSendChallenge = async (drillId: string, sport: string) => {
    if (!userId) return;
    
    setSendingChallenge(true);
    const result = await sendChallenge(userId, drillId, sport);
    setSendingChallenge(false);
    
    if (result.success) {
      toast.success("Challenge sent!");
      setChallengeDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to send challenge");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-6">This user doesn't exist or their profile is private.</p>
            <Link to="/#leagues">
              <Button>Back to Leagues</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const league = getLeague(userData.total_xp);

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
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-5xl">
                {userData.avatar_id && userData.avatar_id !== "default" ? userData.avatar_id : "⚽"}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-extrabold text-foreground mb-2">
                  {userData.display_name || userData.username || "Athlete"}
                </h1>
                <p className="text-muted-foreground mb-4">
                  Joined {userData.created_at 
                    ? new Date(userData.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                    : "Recently"
                  }
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <LeagueBadge league={league} />
                  <StreakCounter days={userData.current_streak} />
                </div>
              </div>
              
              {/* Action Buttons */}
              {!isOwnProfile && user && (
                <div className="flex flex-col gap-2">
                  {isFriend ? (
                    <Button variant="outline" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      Friends
                    </Button>
                  ) : hasSentRequest ? (
                    <Button variant="outline" disabled>
                      Request Sent
                    </Button>
                  ) : (
                    <Button onClick={handleAddFriend} disabled={sendingRequest}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {sendingRequest ? "Sending..." : "Add Friend"}
                    </Button>
                  )}
                  
                  <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Swords className="w-4 h-4 mr-2" />
                        Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Challenge {userData.display_name || userData.username}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 mt-4">
                        <p className="text-sm text-muted-foreground">Select a drill to challenge them on:</p>
                        {drillOptions.map((drill) => (
                          <Button
                            key={drill.id}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleSendChallenge(drill.id, drill.sport)}
                            disabled={sendingChallenge}
                          >
                            <span className="capitalize">{drill.sport}</span>
                            <span className="mx-2">•</span>
                            {drill.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-soft">
              <Trophy className="w-8 h-8 text-league-gold mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{userData.total_xp.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-soft">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{drillCount}</div>
              <div className="text-sm text-muted-foreground">Drills Done</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-soft">
              <Flame className="w-8 h-8 text-streak mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{userData.longest_streak}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-soft">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-foreground">{weeklyXp}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>

          {/* Username */}
          {userData.username && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Username
              </h2>
              <p className="text-lg text-muted-foreground">@{userData.username}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;