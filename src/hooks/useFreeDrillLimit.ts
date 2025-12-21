import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

// Free users can only complete 1 drill total
export const FREE_DRILL_LIMIT = 1;

export const useFreeDrillLimit = () => {
  const { user } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const [todayCompletedDrills, setTodayCompletedDrills] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodayCompleted = async () => {
    if (!user) {
      setTodayCompletedDrills(0);
      setLoading(false);
      return;
    }

    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from("completed_drills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("completed_at", `${today}T00:00:00`)
      .lte("completed_at", `${today}T23:59:59`);

    if (!error && count !== null) {
      setTodayCompletedDrills(count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayCompleted();
  }, [user]);

  // User can do more drills if they're subscribed or haven't hit the daily limit
  const canDoMoreDrills = subscribed || todayCompletedDrills < FREE_DRILL_LIMIT;
  
  // Remaining free drills for today
  const remainingFreeDrills = Math.max(0, FREE_DRILL_LIMIT - todayCompletedDrills);

  // Check if a specific drill at index is accessible for free users
  const isDrillAccessible = (drillIndex: number, isCompleted: boolean): boolean => {
    // Subscribed users can access all drills
    if (subscribed) return true;
    
    // Already completed drills are always accessible (to view)
    if (isCompleted) return true;
    
    // For free users, only the first unlocked drill (index 0) is accessible
    // and only if they haven't used their daily free drill yet
    if (drillIndex === 0 && todayCompletedDrills < FREE_DRILL_LIMIT) {
      return true;
    }
    
    return false;
  };

  return {
    todayCompletedDrills,
    canDoMoreDrills,
    remainingFreeDrills,
    isDrillAccessible,
    hasSubscription: subscribed,
    loading: loading || subLoading,
    refetch: fetchTodayCompleted,
  };
};
