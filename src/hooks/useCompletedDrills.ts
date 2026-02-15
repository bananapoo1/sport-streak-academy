import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CompletedDrill {
  drill_id: string;
  sport: string;
}

export const useCompletedDrills = (sport?: string) => {
  const { user } = useAuth();
  const [completedDrills, setCompletedDrills] = useState<CompletedDrill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedDrills = useCallback(async () => {
    if (!user) {
      setCompletedDrills([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("completed_drills")
      .select("drill_id, sport")
      .eq("user_id", user.id);

    if (sport) {
      query = query.eq("sport", sport);
    }

    const { data, error } = await query;

    if (!error && data) {
      setCompletedDrills(data);
    }
    setLoading(false);
  }, [user, sport]);

  useEffect(() => {
    fetchCompletedDrills();
  }, [fetchCompletedDrills]);

  const isDrillCompleted = (drillId: string): boolean => {
    return completedDrills.some((d) => d.drill_id === drillId);
  };

  return {
    completedDrills,
    loading,
    isDrillCompleted,
    refetch: fetchCompletedDrills,
  };
};
