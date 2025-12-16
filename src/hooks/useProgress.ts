import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DailyProgress {
  minutes_completed: number;
  xp_earned: number;
  drills_completed: number;
  goal_minutes: number;
}

interface WeekDay {
  day: string;
  progress: number;
}

export const useProgress = () => {
  const { user } = useAuth();
  const [todayProgress, setTodayProgress] = useState<DailyProgress>({
    minutes_completed: 0,
    xp_earned: 0,
    drills_completed: 0,
    goal_minutes: 10,
  });
  const [weekProgress, setWeekProgress] = useState<WeekDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodayProgress = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (!error && data) {
      setTodayProgress({
        minutes_completed: data.minutes_completed || 0,
        xp_earned: data.xp_earned || 0,
        drills_completed: data.drills_completed || 0,
        goal_minutes: data.goal_minutes || 10,
      });
    }
  };

  const fetchWeekProgress = async () => {
    if (!user) return;

    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const today = new Date();
    const weekData: WeekDay[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayIndex = date.getDay();

      const { data } = await supabase
        .from("daily_progress")
        .select("minutes_completed, goal_minutes")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .maybeSingle();

      const minutes = data?.minutes_completed || 0;
      const goal = data?.goal_minutes || 10;
      const progress = Math.min((minutes / goal) * 100, 100);

      weekData.push({
        day: days[dayIndex],
        progress,
      });
    }

    setWeekProgress(weekData);
  };

  const fetchStreak = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .single();

    if (data) {
      setStreak(data.current_streak || 0);
    }
  };

  const completeTraining = async (durationMinutes: number, xpEarned: number, sport: string, drillId: string) => {
    if (!user) return { success: false };

    const today = new Date().toISOString().split("T")[0];

    // Upsert daily progress
    const { data: existingProgress } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (existingProgress) {
      await supabase
        .from("daily_progress")
        .update({
          minutes_completed: existingProgress.minutes_completed + durationMinutes,
          xp_earned: existingProgress.xp_earned + xpEarned,
          drills_completed: existingProgress.drills_completed + 1,
        })
        .eq("id", existingProgress.id);
    } else {
      await supabase.from("daily_progress").insert({
        user_id: user.id,
        date: today,
        minutes_completed: durationMinutes,
        xp_earned: xpEarned,
        drills_completed: 1,
      });
    }

    // Record completed drill
    await supabase.from("completed_drills").upsert({
      user_id: user.id,
      sport,
      drill_id: drillId,
      duration_minutes: durationMinutes,
      xp_earned: xpEarned,
    }, { onConflict: "user_id,drill_id" });

    // Update profile total XP and streak
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, current_streak, longest_streak")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newStreak = profile.current_streak + (existingProgress ? 0 : 1);
      await supabase
        .from("profiles")
        .update({
          total_xp: profile.total_xp + xpEarned,
          current_streak: newStreak,
          longest_streak: Math.max(profile.longest_streak, newStreak),
        })
        .eq("id", user.id);
    }

    // Refresh data
    await fetchTodayProgress();
    await fetchWeekProgress();
    await fetchStreak();

    return { success: true };
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchTodayProgress(), fetchWeekProgress(), fetchStreak()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    todayProgress,
    weekProgress,
    streak,
    loading,
    completeTraining,
    refreshProgress: () => {
      fetchTodayProgress();
      fetchWeekProgress();
      fetchStreak();
    },
  };
};