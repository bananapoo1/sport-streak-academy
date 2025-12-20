import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

// Free users can only complete 1 drill total
export const FREE_DRILL_LIMIT = 1;

export const useFreeDrillLimit = () => {
  const { user } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();
  const [totalCompletedDrills, setTotalCompletedDrills] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTotalCompleted = async () => {
    if (!user) {
      setTotalCompletedDrills(0);
      setLoading(false);
      return;
    }

    const { count, error } = await supabase
      .from("completed_drills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!error && count !== null) {
      setTotalCompletedDrills(count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTotalCompleted();
  }, [user]);

  // User can do more drills if they're subscribed or haven't hit the limit
  const canDoMoreDrills = subscribed || totalCompletedDrills < FREE_DRILL_LIMIT;
  
  // Remaining free drills
  const remainingFreeDrills = Math.max(0, FREE_DRILL_LIMIT - totalCompletedDrills);

  // Check if a specific drill at index is accessible for free users
  const isDrillAccessible = (drillIndex: number, isCompleted: boolean): boolean => {
    // Subscribed users can access all drills
    if (subscribed) return true;
    
    // Already completed drills are always accessible (to view)
    if (isCompleted) return true;
    
    // For free users, only the first unlocked drill (index 0) is accessible
    // and only if they haven't used their free drill yet
    if (drillIndex === 0 && totalCompletedDrills < FREE_DRILL_LIMIT) {
      return true;
    }
    
    return false;
  };

  return {
    totalCompletedDrills,
    canDoMoreDrills,
    remainingFreeDrills,
    isDrillAccessible,
    hasSubscription: subscribed,
    loading: loading || subLoading,
    refetch: fetchTotalCompleted,
  };
};
