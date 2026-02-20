import { Link, useNavigate } from "react-router-dom";
import ProgressCircle from "./ProgressCircle";
import DailyStats from "./DailyStats";
import WeekProgress from "./WeekProgress";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Flame, Trophy, ChevronRight, Target, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import DailyCard from "@/components/DailyCard";
import { useOnboardingPreferences } from "@/hooks/useOnboardingPreferences";
import { sportsData } from "@/data/drillsData";

/** Streak milestone messages for Duolingo-style encouragement */
const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Day 1 — great start! Come back tomorrow.";
  if (streak < 3) return `${streak} days strong! Keep it going!`;
  if (streak < 7) return `${streak}-day streak! You're building a habit 💪`;
  if (streak === 7) return "🎉 1 WEEK STREAK! You're on fire!";
  if (streak < 14) return `${streak} days! You're in the zone.`;
  if (streak === 14) return "🔥 2 WEEKS! Incredible dedication!";
  if (streak < 30) return `${streak}-day streak — unstoppable!`;
  if (streak === 30) return "🏆 30 DAYS! You're a legend!";
  return `${streak}-day streak — absolutely elite! 🐉`;
};

/** Get motivational CTA text based on daily progress */
const getCtaText = (minutesDone: number, goalMinutes: number, drillsDone: number): string => {
  if (drillsDone === 0) return "Start Today's Drill";
  if (minutesDone < goalMinutes) return "Continue Training";
  return "Bonus Drill — Keep Going!";
};

const HomeProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { todayProgress, weekProgress, streak, loading } = useProgress();
  const {
    activeSport,
    defaultCategory,
    sports: selectedSports,
    switchSport,
    skillLevel,
    goal,
    personalTag,
    sessionMinutes,
    weeklyDays,
  } = useOnboardingPreferences();

  const sportInfo = sportsData[activeSport];

  // Use onboarding sessionMinutes as the real daily goal
  const effectiveGoalMinutes = sessionMinutes > 0 ? sessionMinutes : todayProgress.goal_minutes;

  const progressPercent = Math.min(
    (todayProgress.minutes_completed / effectiveGoalMinutes) * 100,
    100
  );
  const goalComplete = todayProgress.minutes_completed >= effectiveGoalMinutes;

  /** Personalized greeting based on time of day and personalTag */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    const name = personalTag ? `, ${personalTag}` : "";
    if (hour < 12) return `Good morning${name}`;
    if (hour < 17) return `Good afternoon${name}`;
    return `Good evening${name}`;
  };

  /** Goal-specific motivational subtext */
  const getGoalMessage = (): string | null => {
    if (!goal) return null;
    switch (goal) {
      case "improve": return "Every rep brings you closer to mastery.";
      case "fun": return "Have fun — consistency is the secret.";
      case "compete": return "Train hard, compete harder.";
      case "fitness": return "Move more, feel better.";
      default: return null;
    }
  };

  /** Skill-level badge */
  const getSkillLabel = (): string | null => {
    switch (skillLevel) {
      case "beginner": return "Beginner";
      case "intermediate": return "Intermediate";
      case "advanced": return "Advanced";
      default: return null;
    }
  };

  /** Which days user chose to train */
  const isTrainingDay = (): boolean => {
    if (!weeklyDays || weeklyDays.length === 0) return true;
    const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const today = new Date().getDay();
    return weeklyDays.some((d) => dayMap[d] === today);
  };

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

  /* ─── Guest / Not Logged In ─── */
  if (!user) {
    return (
      <section className="py-8 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            {/* Hero motivator */}
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">Train at Home. Level Up Your Game.</h2>
              <p className="text-muted-foreground">10 minutes a day. Real improvement. No equipment needed.</p>
            </div>

            {/* Quick visual — progress ring at 0 */}
            <ProgressCircle progress={0} size="lg" showMinutes minutes={0} goalMinutes={10} />

            {/* Week streak preview */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Your Week</h3>
              <WeekProgress days={defaultWeekData} />
            </div>

            {/* Single CTA */}
            <Link to="/auth">
              <Button variant="hero" size="xl" className="w-full">
                Get Started — It's Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground">Join thousands of athletes training daily</p>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <section className="py-8 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-pulse space-y-6">
              <div className="h-16 bg-muted rounded-2xl" />
              <div className="h-48 w-48 bg-muted rounded-full mx-auto" />
              <div className="h-14 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Logged In — Main Home Screen ─── */
  return (
    <section className="py-6 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto space-y-5">

          {/* ── 0. Personalized Greeting ── */}
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-foreground">{getGreeting()}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {getGoalMessage() && (
                <p className="text-sm text-muted-foreground">{getGoalMessage()}</p>
              )}
              {getSkillLabel() && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  {getSkillLabel()}
                </span>
              )}
            </div>
            {!isTrainingDay() && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Rest day — but bonus drills still earn XP!</span>
              </div>
            )}
          </div>

          {/* ── 1. Streak Banner (always visible, Duolingo-style) ── */}
          <div className="flex items-center justify-between bg-card border-2 border-border rounded-2xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${streak > 0 ? "bg-streak/20" : "bg-muted"}`}>
                <Flame className={`w-7 h-7 ${streak > 0 ? "text-streak fill-current" : "text-muted-foreground"}`} />
              </div>
              <div className="text-left">
                <div className="text-2xl font-extrabold text-foreground">{streak}</div>
                <div className="text-xs text-muted-foreground">day streak</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{getStreakMessage(streak)}</div>
            </div>
          </div>

          {/* ── 2. Daily Progress Ring (center hero) ── */}
          <div className="text-center space-y-2">
            <ProgressCircle
              progress={progressPercent}
              size="xl"
              showMinutes
              minutes={todayProgress.minutes_completed}
              goalMinutes={effectiveGoalMinutes}
            />
            <p className="text-sm text-muted-foreground font-medium">
              {goalComplete
                ? "🎉 Daily goal complete! Bonus drills earn extra XP."
                : `${effectiveGoalMinutes - todayProgress.minutes_completed} min to hit your daily goal`}
            </p>
          </div>

          {/* ── 3. Quick Stats Row ── */}
          <DailyStats
            xp={todayProgress.xp_earned}
            minutes={todayProgress.minutes_completed}
            drillsCompleted={todayProgress.drills_completed}
            streak={streak}
          />

          {/* ── 4. Sport Switcher Chips ── */}
          {selectedSports.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {selectedSports.map((slug) => {
                const sd = sportsData[slug];
                if (!sd) return null;
                const isActive = slug === activeSport;
                return (
                  <button
                    key={slug}
                    onClick={() => switchSport(slug)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span>{sd.emoji}</span>
                    <span>{sd.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── 5. Daily Card (adaptive drill assignment) ── */}
          <DailyCard
            userId={user.id}
            defaultCategory={defaultCategory}
            sport={activeSport}
            sessionMinutes={sessionMinutes}
            skillLevel={skillLevel}
            goal={goal}
            onNavigateToSession={() => {
              // Navigate to sport page for full drill browsing
              navigate(`/sports/${activeSport}`);
            }}
          />

          {/* ── 6. PRIMARY CTA — One tap to start ── */}
          <Link to={`/sports/${activeSport}`}>
            <Button variant="hero" size="xl" className="w-full group">
              {getCtaText(todayProgress.minutes_completed, todayProgress.goal_minutes, todayProgress.drills_completed)}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* ── 7. Week Progress ── */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 text-center">
              This Week
            </h3>
            <WeekProgress days={weekProgress.length > 0 ? weekProgress : defaultWeekData} />
          </div>

          {/* ── 8. Quick Links (secondary actions) ── */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/achievements" className="bg-card border border-border rounded-xl p-3 flex items-center gap-2 hover:border-primary/50 transition-colors">
              <Trophy className="w-5 h-5 text-league-gold" />
              <span className="text-sm font-medium text-foreground">Achievements</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </Link>
            <Link to="/challenges" className="bg-card border border-border rounded-xl p-3 flex items-center gap-2 hover:border-primary/50 transition-colors">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Challenges</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeProgress;