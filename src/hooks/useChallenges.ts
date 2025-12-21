import { useState, useEffect } from "react";
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

  const fetchChallenges = async () => {
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

        setChallenges(enrichedChallenges);
        setPendingChallenges(enrichedChallenges.filter(c => 
          c.status === "pending" && c.challenged_id === user.id
        ));
        setActiveChallenges(enrichedChallenges.filter(c => 
          c.status === "accepted"
        ));
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const isChallenger = challenge.challenger_id === user.id;
      const updateData = isChallenger 
        ? { challenger_score: score }
        : { challenged_score: score };

      // Check if both scores are now available
      const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
      if (otherScore !== null) {
        const myScore = score;
        const winnerId = myScore > otherScore ? user.id : 
                         myScore < otherScore ? (isChallenger ? challenge.challenged_id : challenge.challenger_id) : 
                         null;
        Object.assign(updateData, {
          status: "completed",
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
        });
      }

      const { error } = await supabase
        .from("challenges")
        .update(updateData)
        .eq("id", challengeId);

      if (error) throw error;

      await fetchChallenges();
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user]);

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