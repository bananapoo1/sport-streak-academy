import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Users, Zap, Trophy, ChevronDown, ChevronUp, LogIn, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useCompletedDrills } from "@/hooks/useCompletedDrills";
import { useFreeDrillLimit, FREE_DRILL_LIMIT } from "@/hooks/useFreeDrillLimit";
import { getDrillById, getSportData } from "@/data/drillsData";

const DrillDetail = () => {
  const { sportSlug, drillId } = useParams();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const { user } = useAuth();
  const { completeTraining } = useProgress();
  const { isDrillCompleted, loading: checkingCompletion } = useCompletedDrills(sportSlug);
  const { canDoMoreDrills, hasSubscription, loading: limitLoading } = useFreeDrillLimit();

  // Get drill from unified data source
  const drill = getDrillById(sportSlug || "", drillId || "");
  const sportData = getSportData(sportSlug || "");

  // Check if drill is already completed on mount
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

    // Check free drill limit
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
      drill.duration,
      drill.xp,
      sportSlug || "unknown",
      drillId || "unknown"
    );

    if (result.success) {
      setIsCompleted(true);
      toast.success(`Drill completed! +${drill.xp} XP earned! 🎉`, {
        description: "Keep up the great work to maintain your streak!",
      });
    } else {
      toast.error("Failed to save progress. Please try again.");
    }
  };

  // Check if user should be blocked (free user who has used their drill)
  const isBlockedByLimit = user && !hasSubscription && !canDoMoreDrills && !isCompleted;

  // If drill not found, show error
  if (!drill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Drill Not Found</h1>
            <Link to={`/sports/${sportSlug}`}>
              <Button variant="outline">Back to {sportData.name}</Button>
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: sportData.color }}
              >
                {sportData.name}
              </span>
              {drill.isBoss && (
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  BOSS LEVEL
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2 mb-4">
              {drill.title}
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                {drill.duration} min
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                {drill.players}
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                {drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)}
              </div>
              <div className={`flex items-center gap-2 ${drill.isBoss ? "text-amber-500" : "text-xp"}`}>
                <Trophy className="w-5 h-5" />
                +{drill.xp} XP
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className={`relative border-2 rounded-2xl overflow-hidden mb-6 shadow-card ${
            drill.isBoss 
              ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-400/50" 
              : "bg-card border-border"
          }`}>
            <div className="aspect-video">
              <iframe
                src={drill.videoUrl}
                title={drill.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Instructions Collapsible */}
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mb-6 shadow-soft">
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
                      <span className={`flex-shrink-0 w-8 h-8 font-bold rounded-full flex items-center justify-center ${
                        drill.isBoss 
                          ? "bg-amber-500/20 text-amber-500" 
                          : "bg-primary/10 text-primary"
                      }`}>
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
            <div className="border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Free Drill Used
              </h3>
              <p className="text-muted-foreground mb-4">
                You've used your {FREE_DRILL_LIMIT} free drill. Upgrade to Pro for unlimited access to all drills!
              </p>
              <Link to="/#pricing">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          ) : !isCompleted ? (
            <Button 
              variant="hero" 
              size="xl" 
              className={`w-full ${drill.isBoss ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : ""}`}
              onClick={handleCompleteDrill}
            >
              {user ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {drill.isBoss ? `Defeat Boss Level (+${drill.xp} XP)` : `Mark as Complete (+${drill.xp} XP)`}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Track Progress
                </>
              )}
            </Button>
          ) : (
            <div className={`border-2 rounded-2xl p-6 text-center ${
              drill.isBoss 
                ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400" 
                : "bg-success/10 border-success"
            }`}>
              <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${drill.isBoss ? "text-amber-500" : "text-success"}`} />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {drill.isBoss ? "Boss Defeated!" : "Drill Completed!"}
              </h3>
              <p className="text-muted-foreground mb-4">You earned {drill.xp} XP. Great work!</p>
              <Link to={`/sports/${sportSlug}`}>
                <Button variant="outline">Continue Training</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DrillDetail;
