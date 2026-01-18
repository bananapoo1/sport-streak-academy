import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Zap, Trophy, ChevronDown, ChevronUp, LogIn, Lock, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrills";
import { FREE_DRILL_LIMIT_PER_DAY } from "@/lib/constants";
import { useFriendActivity } from "@/hooks/useFriendActivity";
import CelebrationOverlay from "@/components/CelebrationOverlay";

// Sport metadata (for display purposes)
const sportMeta: Record<string, { name: string; emoji: string; color: string }> = {
  football: { name: "Football", emoji: "⚽", color: "#22c55e" },
  basketball: { name: "Basketball", emoji: "🏀", color: "#f97316" },
  tennis: { name: "Tennis", emoji: "🎾", color: "#eab308" },
  swimming: { name: "Swimming", emoji: "🏊", color: "#3b82f6" },
  running: { name: "Running", emoji: "🏃", color: "#ef4444" },
};

const DrillDetail = () => {
  const { sportSlug, drillId } = useParams();
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const { user } = useAuth();
  const { completeTraining } = useProgress();
  const { drill, loading, refetch } = useDrill(drillId);
  const { notifyFriendsOfCompletion } = useFriendActivity();

  const sportData = sportSlug ? sportMeta[sportSlug] : null;

  const handleCompleteDrill = async () => {
    if (!user) {
      toast.error("Please sign in to track your progress!", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    if (!drill) return;

    // Check if locked
    if (drill.unlock_status === "locked") {
      toast.error("This drill is locked. Complete previous drills first!");
      return;
    }

    setIsCompleting(true);

    const result = await completeTraining(
      drill.sport,
      drill.id,
      { duration_minutes: drill.duration_minutes }
    );

    setIsCompleting(false);

    if (result.success) {
      if (result.already_completed) {
        toast.info("You've already completed this drill!");
      } else {
        setEarnedXp(result.earned_xp || drill.xp);
        setShowCelebration(true);
        notifyFriendsOfCompletion();
        
        // Refresh drill data to update unlock_status
        refetch();

        // Show challenge result if applicable
        if (result.challenge_submitted) {
          if (result.challenge_completed) {
            toast.success(
              result.won === true 
                ? "🏆 You won the challenge!" 
                : result.won === false 
                  ? "Challenge complete - opponent won" 
                  : "It's a tie!"
            );
          } else {
            toast.info("Challenge score submitted! Waiting for opponent.");
          }
        }
      }
    } else {
      if (result.code === "DRILL_LIMIT_REACHED") {
        toast.error(`You've used your ${FREE_DRILL_LIMIT_PER_DAY} free drill! Upgrade to Pro for unlimited access.`, {
          action: {
            label: "View Plans",
            onClick: () => navigate("/#pricing"),
          },
        });
      } else if (result.code === "DRILL_LOCKED") {
        toast.error(result.error || "This drill is locked");
      } else {
        toast.error(result.error || "Failed to save progress. Please try again.");
      }
    }
  };

  const getDifficultyFromLevel = (level: number): string => {
    if (level <= 2) return "beginner";
    if (level <= 5) return "intermediate";
    if (level <= 8) return "advanced";
    return "elite";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-success";
      case "intermediate": return "text-primary";
      case "advanced": return "text-streak";
      case "elite": return "text-xp";
      default: return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading drill...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!drill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Drill Not Found</h1>
            <Link to={sportSlug ? `/sports/${sportSlug}` : "/sports"}>
              <Button variant="outline">Back to Sport</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const difficulty = getDifficultyFromLevel(drill.level);
  const isCompleted = drill.unlock_status === "completed";
  const isLocked = drill.unlock_status === "locked";
  const steps = Array.isArray(drill.steps) ? drill.steps : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to={`/sports/${sportSlug}`} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {sportData?.name || "Sport"}
          </Link>

          {/* Drill Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{sportData?.emoji || "🎯"}</span>
              <span 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: sportData?.color }}
              >
                {sportData?.name || drill.sport}
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full bg-secondary ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
              <span className="text-sm text-muted-foreground">
                Level {drill.level}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2 mb-4">
              {drill.title}
            </h1>
            {drill.description && (
              <p className="text-muted-foreground mb-4">{drill.description}</p>
            )}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                {drill.duration_minutes} min
              </div>
              {drill.solo_or_duo && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  {drill.solo_or_duo}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-5 h-5" />
                {drill.category_name || drill.category}
              </div>
              <div className="flex items-center gap-2 text-xp">
                <Trophy className="w-5 h-5" />
                +{drill.xp} XP
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="relative border-2 rounded-2xl overflow-hidden mb-6 shadow-lg bg-gradient-to-br from-card to-secondary/30 border-border">
            <div className="aspect-video relative group cursor-pointer hover:bg-secondary/20 transition-colors">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <div className="text-center px-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">Video Coming Soon</h3>
                  <p className="text-muted-foreground text-sm">
                    Follow the step-by-step instructions below to complete this drill
                  </p>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-semibold flex items-center gap-2">
                  <span>{sportData?.emoji}</span>
                  <span style={{ color: sportData?.color }}>{sportData?.name}</span>
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {drill.duration_minutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Instructions Collapsible */}
          {steps.length > 0 && (
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mb-6 shadow-lg">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
              >
                <h2 className="text-xl font-bold text-foreground">Step-by-Step Instructions</h2>
                {showInstructions ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {showInstructions && (
                <div className="px-4 pb-4">
                  <ol className="space-y-3">
                    {steps.map((step, index) => {
                      const stepText = typeof step === 'string' 
                        ? step 
                        : (step as { instruction?: string })?.instruction || String(step);
                      return (
                        <li key={index} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 font-bold rounded-full flex items-center justify-center bg-primary/10 text-primary">
                            {index + 1}
                          </span>
                          <p className="text-foreground pt-1">{stepText}</p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {isLocked ? (
            <div className="border-2 border-streak bg-gradient-to-r from-streak/10 to-streak/5 rounded-2xl p-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-streak" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Drill Locked
              </h3>
              <p className="text-muted-foreground mb-4">
                {drill.unlock_requires?.includes("complete_any_in_category_level")
                  ? `Complete a level ${drill.level - 1} drill in ${drill.category_name || drill.category} first`
                  : "Complete previous drills to unlock this one"}
              </p>
              <Link to={`/sports/${sportSlug}`}>
                <Button variant="outline">Back to Training</Button>
              </Link>
            </div>
          ) : !isCompleted ? (
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold"
              onClick={handleCompleteDrill}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : user ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mark as Complete (+{drill.xp} XP)
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Track Progress
                </>
              )}
            </Button>
          ) : (
            <div className="border-2 rounded-2xl p-6 text-center bg-success/10 border-success">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Drill Completed!
              </h3>
              <p className="text-muted-foreground mb-4">You earned {drill.xp} XP. Great work!</p>
              <Link to={`/sports/${sportSlug}`}>
                <Button variant="outline">Continue Training</Button>
              </Link>
            </div>
          )}

          <CelebrationOverlay
            isOpen={showCelebration}
            onClose={() => setShowCelebration(false)}
            type="training_complete"
            xpEarned={earnedXp}
            title="🎉 Drill Complete!"
            subtitle="Great effort! Keep going to build your streak!"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DrillDetail;
