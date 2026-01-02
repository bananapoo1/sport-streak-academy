import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Flame, Target, Zap, ArrowLeft, UserPlus, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SimulatedProfile {
  id: string;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  league: string;
  drills_completed: number;
}

const leagueColors: Record<string, string> = {
  bronze: "text-amber-700 bg-amber-700/20",
  silver: "text-slate-400 bg-slate-400/20",
  gold: "text-amber-500 bg-amber-500/20",
  diamond: "text-cyan-400 bg-cyan-400/20",
};

const SimulatedUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<SimulatedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      const { data } = await supabase
        .from("simulated_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleAddFriend = () => {
    toast.info("This is a simulated user and cannot be added as a friend.");
  };

  const handleChallenge = () => {
    toast.info("This is a simulated user and cannot be challenged.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-32 w-32 bg-secondary rounded-full mx-auto" />
            <div className="h-8 w-48 bg-secondary rounded mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Link to="/#leagues">
            <Button>Back to Leaderboard</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link to="/#leagues" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Leaderboard
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-5xl">
                {profile.avatar_emoji}
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">{profile.display_name}</h1>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${leagueColors[profile.league]}`}>
                  {profile.league} League
                </span>
              </div>

              {/* Action Buttons */}
              {user && (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleAddFriend} variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                  <Button onClick={handleChallenge} variant="outline">
                    <Swords className="w-4 h-4 mr-2" />
                    Challenge
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-xp mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{profile.total_xp.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{profile.drills_completed}</div>
                <div className="text-xs text-muted-foreground">Drills Done</div>
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <Flame className="w-6 h-6 text-streak mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{profile.current_streak}</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <Trophy className="w-6 h-6 text-league-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{profile.longest_streak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SimulatedUserProfile;