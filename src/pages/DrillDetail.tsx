import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Zap, Trophy, ChevronDown, ChevronUp, LogIn, Lock, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useCompletedDrills } from "@/hooks/useCompletedDrills";
import { useFreeDrillLimit, FREE_DRILL_LIMIT } from "@/hooks/useFreeDrillLimit";
import { getDrillById, getSportData } from "@/data/drillsData";
import { useFriendActivity } from "@/hooks/useFriendActivity";
import CelebrationOverlay from "@/components/CelebrationOverlay";

const DrillDetail = () => {
  const { sportSlug, drillId } = useParams();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const { user } = useAuth();
  const { completeTraining } = useProgress();
  const { isDrillCompleted, loading: checkingCompletion } = useCompletedDrills(sportSlug);
  const { canDoMoreDrills, hasSubscription, loading: limitLoading } = useFreeDrillLimit();
  const { notifyFriendsOfCompletion } = useFriendActivity();

  const drill = getDrillById(sportSlug || "", drillId || "");
  const sportData = getSportData(sportSlug || "");

  useEffect(() => {
    if (!checkingCompletion && drillId && isDrillCompleted(drillId)) {
      setIsCompleted(true);
    }
  }, [checkingCompletion, drillId, isDrillCompleted]);

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

    if (!hasSubscription && !canDoMoreDrills && !isCompleted) {
      toast.error("You've used your free drill! Upgrade to Pro for unlimited access.", {
        action: {
          label: "View Plans",
          onClick: () => navigate("/#pricing"),
        },
      });
      return;
    }

    if (!drill) return;

    const result = await completeTraining(
      sportSlug || "unknown",
      drillId || "unknown"
    );

    if (result.success) {
      setIsCompleted(true);
      setEarnedXp(drill.xp);
      setShowCelebration(true);
      
      // Notify friends
      notifyFriendsOfCompletion();
    } else {
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const isBlockedByLimit = user && !hasSubscription && !canDoMoreDrills && !isCompleted;

  // Difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-success";
      case "intermediate": return "text-primary";
      case "advanced": return "text-streak";
      case "elite": return "text-xp";
      default: return "text-muted-foreground";
    }
  };

  if (!drill || !sportData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Drill Not Found</h1>
            <Link to={`/sports/${sportSlug}`}>
              <Button variant="outline">Back to Sport</Button>
            </Link>
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
          <Link 
            to={`/sports/${sportSlug}`} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {sportData.name}
          </Link>

          {/* Drill Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{sportData.emoji}</span>
              <span 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: sportData.color }}
              >
                {sportData.name}
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full bg-secondary ${getDifficultyColor(drill.difficulty)}`}>
                {drill.difficulty}
              </span>
              <span className="text-sm text-muted-foreground">
                Level {drill.level}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2 mb-4">
              {drill.title}
            </h1>
            <p className="text-muted-foreground mb-4">{drill.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                {drill.duration} min
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-5 h-5" />
                {drill.category}
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
              {/* Video placeholder - ready for future video content */}
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
              {/* Sport badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-semibold flex items-center gap-2">
                  <span>{sportData.emoji}</span>
                  <span style={{ color: sportData.color }}>{sportData.name}</span>
                </span>
              </div>
              {/* Duration badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {drill.duration} min
                </span>
              </div>
            </div>
          </div>

          {/* Instructions Collapsible */}
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
                  {drill.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 font-bold rounded-full flex items-center justify-center bg-primary/10 text-primary">
                        {index + 1}
                      </span>
                      <p className="text-foreground pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Blocked by free limit */}
          {isBlockedByLimit ? (
            <div className="border-2 border-streak bg-gradient-to-r from-streak/10 to-streak/5 rounded-2xl p-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-streak" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Free Drill Used
              </h3>
              <p className="text-muted-foreground mb-4">
                You've used your {FREE_DRILL_LIMIT} free drill. Upgrade to Pro for unlimited access to all drills!
              </p>
              <Link to="/#pricing">
                <Button className="bg-gradient-to-r from-streak to-streak/80 hover:from-streak/90 hover:to-streak/70">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          ) : !isCompleted ? (
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold"
              onClick={handleCompleteDrill}
            >
              {user ? (
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
