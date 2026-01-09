import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useStreakFreeze = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [freezeCount, setFreezeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFreezeCount = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("streak_freezes")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setFreezeCount(data?.streak_freezes || 0);
    } catch (error) {
      console.error("Error fetching freeze count:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const useFreeze = useCallback(async () => {
    if (!user || freezeCount <= 0) return { success: false };

    try {
      // Decrement freeze count
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ streak_freezes: freezeCount - 1 })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Log the freeze usage
      const { error: logError } = await supabase
        .from("streak_freeze_log")
        .insert({
          user_id: user.id,
          date_protected: new Date().toISOString().split("T")[0],
        });

      if (logError) throw logError;

      setFreezeCount(prev => prev - 1);
      
      toast({
        title: "❄️ Streak Freeze Used!",
        description: "Your streak has been protected for today.",
      });

      return { success: true };
    } catch (error) {
      console.error("Error using freeze:", error);
      toast({
        title: "Error",
        description: "Failed to use streak freeze.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, freezeCount, toast]);

  const addFreezes = useCallback(async (amount: number) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ streak_freezes: freezeCount + amount })
        .eq("id", user.id);

      if (error) throw error;
      
      setFreezeCount(prev => prev + amount);
      
      toast({
        title: "❄️ Streak Freezes Added!",
        description: `You now have ${freezeCount + amount} streak freezes.`,
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding freezes:", error);
      return { success: false };
    }
  }, [user, freezeCount, toast]);

  useEffect(() => {
    fetchFreezeCount();
  }, [fetchFreezeCount]);

  return {
    freezeCount,
    loading,
    useFreeze,
    addFreezes,
    refetch: fetchFreezeCount,
  };
};
