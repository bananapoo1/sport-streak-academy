import { Link } from "react-router-dom";
import ProgressCircle from "./ProgressCircle";
import DailyStats from "./DailyStats";
import WeekProgress from "./WeekProgress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock data - in a real app this would come from user state/database
const todayStats = {
  xp: 75,
  minutes: 4,
  drillsCompleted: 2,
  streak: 7,
  goalMinutes: 10,
};

const weekData = [
  { day: "M", progress: 100 },
  { day: "T", progress: 100 },
  { day: "W", progress: 80 },
  { day: "T", progress: 100 },
  { day: "F", progress: 60 },
  { day: "S", progress: 100 },
  { day: "S", progress: (todayStats.minutes / todayStats.goalMinutes) * 100 },
];

const HomeProgress = () => {
  const progressPercent = Math.min((todayStats.minutes / todayStats.goalMinutes) * 100, 100);

  return (
    <section className="py-12 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Daily Stats */}
          <div className="mb-8">
            <DailyStats
              xp={todayStats.xp}
              minutes={todayStats.minutes}
              drillsCompleted={todayStats.drillsCompleted}
              streak={todayStats.streak}
            />
          </div>

          {/* Main Progress Circle */}
          <div className="mb-8">
            <ProgressCircle
              progress={progressPercent}
              size="xl"
              showMinutes
              minutes={todayStats.minutes}
              goalMinutes={todayStats.goalMinutes}
            />
            <p className="text-muted-foreground mt-4">
              {todayStats.minutes >= todayStats.goalMinutes
                ? "🎉 Daily goal complete!"
                : `${todayStats.goalMinutes - todayStats.minutes} more minutes to go!`}
            </p>
          </div>

          {/* Week Progress */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">This Week</h3>
            <WeekProgress days={weekData} />
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
