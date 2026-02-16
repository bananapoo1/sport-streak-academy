import { Flame, Play, Trophy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { useProgress } from "@/hooks/useProgress";

const MobileQuickActions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { impact } = useHaptics();
  const { todayProgress, streak } = useProgress();

  const goalComplete = todayProgress.minutes_completed >= todayProgress.goal_minutes;

  const onAction = () => {
    impact("medium");
    navigate("/sports");
  };

  const showForPath = ["/", "/sports", "/drills", "/leagues", "/profile", "/achievements"].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  if (!showForPath || location.pathname === "/auth" || location.pathname.startsWith("/onboarding")) {
    return null;
  }

  return (
    <div className="md:hidden sticky top-16 z-40 px-4 py-2 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        {/* Streak indicator */}
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${streak > 0 ? "text-streak fill-current" : "text-muted-foreground"}`} />
          <span className="text-xs font-bold text-foreground">{streak} day streak</span>
          {goalComplete && (
            <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-medium">
              ✓ Done
            </span>
          )}
        </div>

        <Button size="sm" variant={goalComplete ? "outline" : "default"} className="h-8 min-w-[110px]" onClick={onAction}>
          {goalComplete ? (
            <>
              <Trophy className="w-4 h-4 mr-1" />
              Bonus Drill
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Train Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileQuickActions;
