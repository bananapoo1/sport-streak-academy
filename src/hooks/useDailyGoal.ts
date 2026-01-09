import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useDailyGoal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goal, setGoal] = useState(10); // Default 10 minutes
  const [todayProgress, setTodayProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDailyGoal = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("daily_progress")
        .select("goal_minutes, minutes_completed")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setGoal(data.goal_minutes || 10);
        setTodayProgress(data.minutes_completed || 0);
      }
    } catch (error) {
      console.error("Error fetching daily goal:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateGoal = useCallback(async (newGoal: number) => {
    if (!user) return { success: false };

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Upsert the daily progress with new goal
      const { error } = await supabase
        .from("daily_progress")
        .upsert({
          user_id: user.id,
          date: today,
          goal_minutes: newGoal,
        }, {
          onConflict: "user_id,date",
        });

      if (error) throw error;
      
      setGoal(newGoal);
      
      toast({
        title: "🎯 Goal Updated!",
        description: `Your daily goal is now ${newGoal} minutes.`,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, toast]);

  const goalProgress = goal > 0 ? Math.min(100, Math.round((todayProgress / goal) * 100)) : 0;
  const goalReached = todayProgress >= goal;

  useEffect(() => {
    fetchDailyGoal();
  }, [fetchDailyGoal]);

  return {
    goal,
    todayProgress,
    goalProgress,
    goalReached,
    loading,
    updateGoal,
    refetch: fetchDailyGoal,
  };
};
