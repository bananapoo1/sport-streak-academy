import { Link } from "react-router-dom";
import ProgressCircle from "./ProgressCircle";
import DailyStats from "./DailyStats";
import WeekProgress from "./WeekProgress";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import DailyCard from "@/components/DailyCard";

const HomeProgress = () => {
  const { user } = useAuth();
  const { todayProgress, weekProgress, streak, loading } = useProgress();

  const progressPercent = Math.min(
    (todayProgress.minutes_completed / todayProgress.goal_minutes) * 100,
    100
  );

  // Default week data for non-logged-in users
  const defaultWeekData = [
    { day: "M", progress: 0 },
    { day: "T", progress: 0 },
    { day: "W", progress: 0 },
    { day: "T", progress: 0 },
    { day: "F", progress: 0 },
    { day: "S", progress: 0 },
    { day: "S", progress: 0 },
  ];

  if (!user) {
    return (
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <DailyCard
                userId="guest_user"
                defaultCategory="shooting"
                onNavigateToSession={() => {
                  window.location.assign("/drills");
                }}
              />
            </div>

            <div className="mb-8">
              <DailyStats xp={0} minutes={0} drillsCompleted={0} streak={0} />
            </div>

            <div className="mb-8">
              <ProgressCircle
                progress={0}
                size="xl"
                showMinutes
                minutes={0}
                goalMinutes={10}
              />
              <p className="text-muted-foreground mt-4">
                Sign in to track your progress!
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                This Week
              </h3>
              <WeekProgress days={defaultWeekData} />
            </div>

            <Link to="/auth">
              <Button variant="hero" size="xl" className="w-full">
                Sign In to Start
                <LogIn className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-20 bg-muted rounded-lg mb-8"></div>
              <div className="h-48 w-48 bg-muted rounded-full mx-auto mb-8"></div>
              <div className="h-12 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <DailyCard
              userId={user.id}
              defaultCategory="shooting"
              onNavigateToSession={() => {
                window.location.assign("/drills");
              }}
            />
          </div>

          {/* Daily Stats */}
          <div className="mb-8">
            <DailyStats
              xp={todayProgress.xp_earned}
              minutes={todayProgress.minutes_completed}
              drillsCompleted={todayProgress.drills_completed}
              streak={streak}
            />
          </div>

          {/* Main Progress Circle */}
          <div className="mb-8">
            <ProgressCircle
              progress={progressPercent}
              size="xl"
              showMinutes
              minutes={todayProgress.minutes_completed}
              goalMinutes={todayProgress.goal_minutes}
            />
            <p className="text-muted-foreground mt-4">
              {todayProgress.minutes_completed >= todayProgress.goal_minutes
                ? "🎉 Daily goal complete!"
                : `${todayProgress.goal_minutes - todayProgress.minutes_completed} more minutes to go!`}
            </p>
          </div>

          {/* Week Progress */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              This Week
            </h3>
            <WeekProgress days={weekProgress.length > 0 ? weekProgress : defaultWeekData} />
          </div>

          {/* CTA */}
          <Link to="/sports">
            <Button variant="hero" size="xl" className="w-full">
              Start Today's Drill
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeProgress;