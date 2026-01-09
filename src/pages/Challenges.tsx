import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Swords, Clock, CheckCircle, XCircle, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { findDrillById } from "@/data/drillsData";
import { useRealtimeChallenges } from "@/hooks/useRealtimeChallenges";
import CelebrationOverlay from "@/components/CelebrationOverlay";

const Challenges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"challenge_won" | "challenge_complete">("challenge_complete");
  const [celebrationXp, setCelebrationXp] = useState(0);
  
  const { 
    challenges, 
    pendingChallenges, 
    activeChallenges, 
    loading, 
    acceptChallenge, 
    declineChallenge,
    refetch
  } = useChallenges();

  // Real-time challenge notifications
  useRealtimeChallenges(() => {
    refetch();
  });

  const completedChallenges = challenges.filter(c => c.status === "completed");
  const declinedChallenges = challenges.filter(c => c.status === "declined");

  const handleAcceptChallenge = async (challengeId: string, xpBonus: number) => {
    await acceptChallenge(challengeId);
    setCelebrationType("challenge_complete");
    setCelebrationXp(xpBonus);
    setShowCelebration(true);
  };

  const getDrillName = (drillId: string) => {
    const result = findDrillById(drillId);
    if (result) return result.drill.title;
    // Handle legacy drill IDs gracefully
    const formatted = drillId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${formatted} (Legacy)`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view challenges</h2>
            <p className="text-muted-foreground mb-4">Challenge your friends and earn bonus XP!</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Swords className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold text-foreground">Challenges</h1>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingChallenges.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {pendingChallenges.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="declined">Declined</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : pendingChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending challenges</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingChallenges.map((challenge) => (
                    <div key={challenge.id} className="bg-card border-2 border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{challenge.challenger_avatar || "⚽"}</span>
                          <div>
                            <p className="font-bold text-foreground">{challenge.challenger_name}</p>
                            <p className="text-sm text-muted-foreground">challenged you!</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xp">
                          <Zap className="w-5 h-5" />
                          <span className="font-bold">+{challenge.xp_bonus} XP</span>
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Drill</p>
                        <p className="font-semibold text-foreground">{getDrillName(challenge.drill_id)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Expires: {formatDate(challenge.expires_at)}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => declineChallenge(challenge.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Decline
                          </Button>
                          <Button size="sm" onClick={() => handleAcceptChallenge(challenge.id, challenge.xp_bonus)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active challenges</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeChallenges.map((challenge) => {
                    const isChallenger = challenge.challenger_id === user.id;
                    const opponentName = isChallenger ? challenge.challenged_name : challenge.challenger_name;
                    return (
                      <div key={challenge.id} className="bg-card border-2 border-primary/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-foreground">vs {opponentName}</p>
                          <span className="text-xp font-bold">+{challenge.xp_bonus} XP</span>
                        </div>
                        <p className="font-semibold mb-4">{getDrillName(challenge.drill_id)}</p>
                        <Button className="w-full" onClick={() => navigate(`/drill/${challenge.sport}/${challenge.drill_id}`)}>
                          Go to Drill <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed challenges yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedChallenges.map((challenge) => {
                    const isWinner = challenge.winner_id === user.id;
                    return (
                      <div key={challenge.id} className={`bg-card border-2 rounded-2xl p-6 ${isWinner ? "border-success/50" : "border-border"}`}>
                        <p className={`font-bold ${isWinner ? "text-success" : "text-muted-foreground"}`}>
                          {isWinner ? "🏆 You Won!" : "Better luck next time"}
                        </p>
                        <p className="text-foreground">{getDrillName(challenge.drill_id)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="declined">
              {declinedChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No declined challenges</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {declinedChallenges.map((challenge) => (
                    <div key={challenge.id} className="bg-card border border-border rounded-2xl p-4 opacity-60">
                      <p className="text-muted-foreground">{getDrillName(challenge.drill_id)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <CelebrationOverlay
            isOpen={showCelebration}
            onClose={() => setShowCelebration(false)}
            type={celebrationType}
            xpEarned={celebrationXp}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Challenges;
