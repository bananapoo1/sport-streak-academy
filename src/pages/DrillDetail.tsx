import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Zap, Trophy, ChevronDown, ChevronUp, LogIn, Lock, Target, Users, Play, Pause, RotateCcw, Flame } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useDrill, useDrills } from "@/hooks/useDrills";
import { FREE_DRILL_LIMIT_PER_DAY } from "@/lib/constants";
import { useFriendActivity } from "@/hooks/useFriendActivity";
import CelebrationOverlay from "@/components/CelebrationOverlay";

// Sport metadata (for display purposes)
const sportMeta: Record<string, { name: string; emoji: string; color: string }> = {
  football: { name: "Football", emoji: "⚽", color: "#22c55e" },
  basketball: { name: "Basketball", emoji: "🏀", color: "#f97316" },
  tennis: { name: "Tennis", emoji: "🎾", color: "#eab308" },
  golf: { name: "Golf", emoji: "⛳", color: "#22c55e" },
  cricket: { name: "Cricket", emoji: "🏏", color: "#3b82f6" },
  rugby: { name: "Rugby", emoji: "🏉", color: "#dc2626" },
  "field-hockey": { name: "Hockey", emoji: "🏑", color: "#0d9488" },
  padel: { name: "Padel", emoji: "🎾", color: "#8b5cf6" },
  "table-tennis": { name: "Table Tennis", emoji: "🏓", color: "#06b6d4" },
  baseball: { name: "Baseball", emoji: "⚾", color: "#ef4444" },
  "american-football": { name: "American Football", emoji: "🏈", color: "#92400e" },
  volleyball: { name: "Volleyball", emoji: "🏐", color: "#d946ef" },
};

/** Format seconds into MM:SS */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const DrillDetail = () => {
  const { sportSlug, drillId } = useParams();
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Session timer state
  const [timerActive, setTimerActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user } = useAuth();
  const { completeTraining, streak } = useProgress();
  const { drill, loading, refetch } = useDrill(drillId);
  const { notifyFriendsOfCompletion } = useFriendActivity();

  // Fetch next drills for "continue" flow
  const { drills: siblingDrills } = useDrills({
    sport: sportSlug,
    category: drill?.category,
    level: drill?.level,
  });

  const sportData = sportSlug ? sportMeta[sportSlug] : null;

  // Timer logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const startSession = useCallback(() => {
    setSessionStarted(true);
    setTimerActive(true);
    setSecondsElapsed(0);
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerActive((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerActive(false);
    setSecondsElapsed(0);
    setSessionStarted(false);
  }, []);

  // Find the next unlocked drill in the same category
  const nextDrill = siblingDrills.find(
    (d) => d.id !== drillId && d.unlock_status === "unlocked" && !d.is_completed
  );

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
    if (drill.unlock_status === "locked") {
      toast.error("This drill is locked. Complete previous drills first!");
      return;
    }

    setIsCompleting(true);
    setTimerActive(false); // Stop the timer

    const result = await completeTraining(
      drill.sport,
      drill.id,
      {
        duration_minutes: Math.max(1, Math.ceil(secondsElapsed / 60)) || drill.duration_minutes,
      }
    );

    setIsCompleting(false);

    if (result.success) {
      if (result.already_completed) {
        toast.info("You've already completed this drill!");
      } else {
        setEarnedXp(result.earned_xp || drill.xp);
        setShowCelebration(true);
        notifyFriendsOfCompletion();
        refetch();

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
        toast.error(`You've used your ${FREE_DRILL_LIMIT_PER_DAY} free drills today! Upgrade to Pro for unlimited access.`, {
          action: {
            label: "View Plans",
            onClick: () => navigate("/pricing"),
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
        <main className="pt-20 pb-24 md:pt-24 md:pb-16">
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
        <main className="pt-20 pb-24 md:pt-24 md:pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Target className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Drill Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This drill may have been updated or removed. Try browsing available drills instead.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {sportSlug && sportMeta[sportSlug] && (
                <Link to={`/sports/${sportSlug}`}>
                  <Button variant="default">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to {sportMeta[sportSlug].name}
                  </Button>
                </Link>
              )}
              <Link to="/sports">
                <Button variant="outline">Browse All Sports</Button>
              </Link>
            </div>
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
  const totalSeconds = drill.duration_minutes * 60;
  const timerProgress = Math.min((secondsElapsed / totalSeconds) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to={`/sports/${sportSlug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {sportData?.name || "Sport"}
          </Link>

          {/* Drill Header */}
          <div className="mb-6">
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
              <span className="text-sm text-muted-foreground">Level {drill.level}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2 mb-3">
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

          {/* ── Session Timer (Duolingo-style active session) ── */}
          {!isLocked && !isCompleted && (
            <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Session Timer
                </h3>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-streak text-sm font-bold">
                    <Flame className="w-4 h-4 fill-current" />
                    {streak} day streak
                  </div>
                )}
              </div>

              {/* Timer display */}
              <div className="text-center mb-4">
                <div className="text-5xl font-mono font-bold text-foreground tabular-nums">
                  {formatTime(secondsElapsed)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Target: {drill.duration_minutes} min
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-primary to-success"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>

              {/* Timer controls */}
              <div className="flex gap-3 justify-center">
                {!sessionStarted ? (
                  <Button onClick={startSession} size="lg" className="flex-1 h-12 text-base font-bold">
                    <Play className="w-5 h-5 mr-2" />
                    Start Drill
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleTimer}
                      variant="outline"
                      size="lg"
                      className="h-12"
                    >
                      {timerActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      variant="ghost"
                      size="lg"
                      className="h-12"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleCompleteDrill}
                      disabled={isCompleting || secondsElapsed < 10}
                      size="lg"
                      className="flex-1 h-12 text-base font-bold bg-success hover:bg-success/90"
                    >
                      {isCompleting ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      Done!
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Video Section */}
          <div className="relative border-2 rounded-2xl overflow-hidden mb-6 shadow-lg bg-gradient-to-br from-card to-secondary/30 border-border">
            <div className="aspect-video relative group cursor-pointer hover:bg-secondary/20 transition-colors">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
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

          {/* Action / Status Section */}
          {isLocked ? (
            <div className="border-2 border-streak bg-gradient-to-r from-streak/10 to-streak/5 rounded-2xl p-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-streak" />
              <h3 className="text-xl font-bold text-foreground mb-2">Drill Locked</h3>
              <p className="text-muted-foreground mb-4">
                {drill.unlock_requires?.includes("complete_any_in_category_level")
                  ? `Complete a level ${drill.level - 1} drill in ${drill.category_name || drill.category} first`
                  : "Complete previous drills to unlock this one"}
              </p>
              <Link to={`/sports/${sportSlug}`}>
                <Button variant="outline">Back to Training</Button>
              </Link>
            </div>
          ) : isCompleted ? (
            /* ── Post-Completion: Next Drill CTA (Duolingo-style "keep going") ── */
            <div className="space-y-4">
              <div className="border-2 rounded-2xl p-6 text-center bg-success/10 border-success">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                <h3 className="text-xl font-bold text-foreground mb-2">Drill Completed! ✓</h3>
                <p className="text-muted-foreground mb-2">You earned {drill.xp} XP. Great work!</p>
              </div>

              {/* Next drill CTA */}
              {nextDrill ? (
                <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Ready for more?</p>
                  <h3 className="text-lg font-bold text-foreground mb-1">{nextDrill.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {nextDrill.duration_minutes} min • +{nextDrill.xp} XP
                  </p>
                  <Button
                    onClick={() => navigate(`/drill/${sportSlug}/${nextDrill.id}`)}
                    size="lg"
                    className="w-full h-12 text-base font-bold"
                  >
                    Next Drill
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <Link to={`/sports/${sportSlug}`}>
                  <Button variant="outline" className="w-full">
                    Browse More Drills
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          ) : !sessionStarted ? (
            /* Not started yet — big CTA to begin */
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to track your progress!", {
                    action: { label: "Sign In", onClick: () => navigate("/auth") },
                  });
                  return;
                }
                startSession();
                // Scroll to timer
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Start This Drill
            </Button>
          ) : null}

          <CelebrationOverlay
            isOpen={showCelebration}
            onClose={() => {
              setShowCelebration(false);
              resetTimer();
            }}
            type="training_complete"
            xpEarned={earnedXp}
            title="🎉 Drill Complete!"
            subtitle={nextDrill ? "Amazing work! Ready for the next one?" : "Great effort! Keep going to build your streak!"}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DrillDetail;
