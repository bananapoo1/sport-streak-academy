import { useState, useEffect, useCallback } from "react";
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

interface CompleteTrainingResult {
  success: boolean;
  error?: string;
  code?: string;
  earned_xp?: number;
  new_total_xp?: number;
  day_minutes?: number;
  challenge_submitted?: boolean;
  challenge_completed?: boolean;
  won?: boolean | null;
  already_completed?: boolean;
  unlocked_new_drills?: string[];
}

export const useProgress = () => {
  const { user } = useAuth();
  const [todayProgress, setTodayProgress] = useState<DailyProgress>({
    minutes_completed: 0,
    xp_earned: 0,
    drills_completed: 0,
    goal_minutes: 30,
  });
  const [weekProgress, setWeekProgress] = useState<WeekDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodayProgress = useCallback(async () => {
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
        goal_minutes: data.goal_minutes || 30,
      });
    }
  }, [user]);

  const fetchWeekProgress = useCallback(async () => {
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
      const goal = data?.goal_minutes || 30;
      const progress = Math.min((minutes / goal) * 100, 100);

      weekData.push({
        day: days[dayIndex],
        progress,
      });
    }

    setWeekProgress(weekData);
  }, [user]);

  const fetchStreak = useCallback(async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    let currentStreak = profile.current_streak || 0;

    // Check if yesterday's goal was missed - if so, reset streak
    if (currentStreak > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const { data: yesterdayProgress } = await supabase
        .from("daily_progress")
        .select("minutes_completed, goal_minutes")
        .eq("user_id", user.id)
        .eq("date", yesterdayStr)
        .maybeSingle();

      const yesterdayGoalMet = yesterdayProgress
        && (yesterdayProgress.minutes_completed ?? 0) >= (yesterdayProgress.goal_minutes ?? 30);

      if (!yesterdayGoalMet) {
        // Check for streak freeze
        const { data: freezeUsed } = await supabase
          .from("streak_freeze_log")
          .select("id")
          .eq("user_id", user.id)
          .eq("date_protected", yesterdayStr)
          .maybeSingle();

        if (!freezeUsed) {
          // Reset streak in DB and locally
          currentStreak = 0;
          await supabase
            .from("profiles")
            .update({ current_streak: 0 })
            .eq("id", user.id);
        }
      }
    }

    setStreak(currentStreak);
  }, [user]);

  const completeTraining = useCallback(async (
    sport: string, 
    drillId: string,
    options?: {
      duration_minutes?: number;
      score_data?: Record<string, unknown>;
      challenge_id?: string;
    }
  ): Promise<CompleteTrainingResult> => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No active session");
        return { success: false, error: "No active session" };
      }

      // Call the server-side edge function with new API format
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/complete-drill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drill_id: drillId,
            duration_minutes: options?.duration_minutes,
            score_data: options?.score_data,
            challenge_id: options?.challenge_id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Error completing drill:", result.error);
        return { 
          success: false, 
          error: result.error,
          code: result.code 
        };
      }

      // Refresh data after successful completion
      await Promise.all([
        fetchTodayProgress(),
        fetchWeekProgress(),
        fetchStreak()
      ]);

      return { 
        success: true,
        earned_xp: result.earned_xp,
        new_total_xp: result.new_total_xp,
        day_minutes: result.day_minutes,
        challenge_submitted: result.challenge_submitted,
        challenge_completed: result.challenge_completed,
        won: result.won,
        already_completed: result.already_completed,
        unlocked_new_drills: result.unlocked_new_drills
      };
    } catch (error) {
      console.error("Error completing training:", error);
      return { success: false, error: "Network error" };
    }
  }, [user, fetchTodayProgress, fetchWeekProgress, fetchStreak]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchTodayProgress(), fetchWeekProgress(), fetchStreak()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, fetchTodayProgress, fetchWeekProgress, fetchStreak]);

  return {
    todayProgress,
    weekProgress,
    streak,
    loading,
    completeTraining,
    refreshProgress: useCallback(() => {
      fetchTodayProgress();
      fetchWeekProgress();
      fetchStreak();
    }, [fetchTodayProgress, fetchWeekProgress, fetchStreak]),
  };
};
