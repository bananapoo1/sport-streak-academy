import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  drill_id: string;
  sport: string;
  status: string;
  challenger_score: number | null;
  challenged_score: number | null;
  winner_id: string | null;
  xp_bonus: number;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
  challenger_name?: string;
  challenged_name?: string;
  challenger_avatar?: string;
  challenged_avatar?: string;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const updateChallengesState = useCallback((data: Challenge[]) => {
    setChallenges(data);
    setPendingChallenges(data.filter(c => 
      c.status === "pending" && c.challenged_id === user?.id
    ));
    setActiveChallenges(data.filter(c => 
      c.status === "accepted"
    ));
  }, [user?.id]);

  const fetchChallenges = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Fetch profile info for all users involved
        const userIds = [...new Set(data.flatMap(c => [c.challenger_id, c.challenged_id]))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_id")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const enrichedChallenges = data.map(challenge => {
          const challenger = profileMap.get(challenge.challenger_id);
          const challenged = profileMap.get(challenge.challenged_id);
          return {
            ...challenge,
            challenger_name: challenger?.display_name || challenger?.username || "Unknown",
            challenged_name: challenged?.display_name || challenged?.username || "Unknown",
            challenger_avatar: challenger?.avatar_id !== "default" ? challenger?.avatar_id : "⚽",
            challenged_avatar: challenged?.avatar_id !== "default" ? challenged?.avatar_id : "⚽",
          };
        });

        updateChallengesState(enrichedChallenges);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  }, [user, updateChallengesState]);

  // Real-time subscription for challenge updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('challenges-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
        },
        async (payload) => {
          console.log("Challenge update received:", payload);
          // Refetch all challenges to get accurate state
          await fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchChallenges]);

  const sendChallenge = async (friendId: string, drillId: string, sport: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    try {
      const { error } = await supabase.from("challenges").insert({
        challenger_id: user.id,
        challenged_id: friendId,
        drill_id: drillId,
        sport,
        xp_bonus: 50,
      });

      if (error) throw error;

      toast({
        title: "Challenge sent!",
        description: "Your friend will be notified of the challenge.",
      });

      await fetchChallenges();
      return { success: true };
    } catch (error) {
      console.error("Error sending challenge:", error);
      return { success: false, error: "Failed to send challenge" };
    }
  };

  const acceptChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("challenges")
        .update({ status: "accepted" })
        .eq("id", challengeId)
        .eq("challenged_id", user.id);

      if (error) throw error;

      toast({
        title: "Challenge accepted!",
        description: "Complete the drill to win bonus XP!",
      });

      await fetchChallenges();
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  const declineChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("challenges")
        .update({ status: "declined" })
        .eq("id", challengeId)
        .eq("challenged_id", user.id);

      if (error) throw error;

      toast({ title: "Challenge declined" });
      await fetchChallenges();
    } catch (error) {
      console.error("Error declining challenge:", error);
    }
  };

  const completeChallenge = async (challengeId: string, score: number) => {
    if (!user) return;

    try {
      // Validate score on client side first (server will validate again)
      if (typeof score !== "number" || isNaN(score) || score < 0 || score > 100) {
        toast({
          title: "Invalid score",
          description: "Score must be between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast({
          title: "Authentication error",
          description: "Please sign in again",
          variant: "destructive",
        });
        return;
      }

      // Submit score via server-side edge function for validation
      const response = await fetch(
        "https://nikvolkksngggjkvpzrd.supabase.co/functions/v1/submit-challenge-score",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ challengeId, score: Math.floor(score) }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to submit score",
          variant: "destructive",
        });
        return;
      }

      if (result.completed) {
        toast({
          title: "Challenge completed!",
          description: "Check results to see who won!",
        });
      } else {
        toast({
          title: "Score submitted!",
          description: "Waiting for opponent to complete the challenge.",
        });
      }

      await fetchChallenges();
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast({
        title: "Error",
        description: "Failed to submit score",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return {
    challenges,
    pendingChallenges,
    activeChallenges,
    loading,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    completeChallenge,
    refetch: fetchChallenges,
  };
};