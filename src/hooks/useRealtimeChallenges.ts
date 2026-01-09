import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeChallenges = (onNewChallenge?: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNewChallenge = useCallback(async (payload: any) => {
    if (!user) return;
    
    const newChallenge = payload.new;
    
    // Only show notification if we're the challenged user
    if (newChallenge.challenged_id === user.id && newChallenge.status === "pending") {
      // Fetch challenger's name
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", newChallenge.challenger_id)
        .single();

      const challengerName = profile?.display_name || profile?.username || "Someone";

      toast({
        title: "⚔️ New Challenge!",
        description: `${challengerName} has challenged you to a drill battle!`,
      });

      onNewChallenge?.();
    }
    
    // Notify if challenge was accepted
    if (newChallenge.challenger_id === user.id && newChallenge.status === "accepted") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", newChallenge.challenged_id)
        .single();

      const challengedName = profile?.display_name || profile?.username || "Your friend";

      toast({
        title: "✅ Challenge Accepted!",
        description: `${challengedName} accepted your challenge!`,
      });

      onNewChallenge?.();
    }

    // Notify if challenge completed
    if (newChallenge.status === "completed" && 
        (newChallenge.challenger_id === user.id || newChallenge.challenged_id === user.id)) {
      const isWinner = newChallenge.winner_id === user.id;
      
      toast({
        title: isWinner ? "🏆 You Won!" : "Challenge Complete",
        description: isWinner 
          ? `You earned +${newChallenge.xp_bonus} bonus XP!` 
          : "Better luck next time!",
      });

      onNewChallenge?.();
    }
  }, [user, toast, onNewChallenge]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to challenges table changes
    const channel = supabase
      .channel('challenges-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `challenged_id=eq.${user.id}`,
        },
        handleNewChallenge
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `challenger_id=eq.${user.id}`,
        },
        handleNewChallenge
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleNewChallenge]);
};
