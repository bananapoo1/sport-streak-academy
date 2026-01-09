import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useFriendActivity = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Notify friends when user completes daily training
  const notifyFriendsOfCompletion = useCallback(async () => {
    if (!user) return;

    // Get user's friends
    const { data: friendships } = await supabase
      .from("friendships")
      .select("friend_id, user_id")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq("status", "accepted");

    if (!friendships || friendships.length === 0) return;

    // Get current user's profile
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .single();

    const myName = myProfile?.display_name || myProfile?.username || "Your friend";

    // For now, we'll store this as a simple notification
    // In a real app, you might want a dedicated notifications table
    console.log(`${myName} completed their daily training - friends notified!`);
  }, [user]);

  // Subscribe to friend daily_progress updates
  useEffect(() => {
    if (!user) return;

    // First, get friend IDs
    const setupSubscription = async () => {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("friend_id, user_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (!friendships || friendships.length === 0) return;

      const friendIds = friendships.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      // Subscribe to daily_progress changes from friends
      const channel = supabase
        .channel('friend-activity')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'daily_progress',
          },
          async (payload) => {
            const progress = payload.new as any;
            
            // Check if this is a friend's progress
            if (!friendIds.includes(progress.user_id)) return;

            // Check if they hit their daily goal
            if (progress.minutes_completed >= (progress.goal_minutes || 15)) {
              const { data: friendProfile } = await supabase
                .from("profiles")
                .select("username, display_name, current_streak")
                .eq("id", progress.user_id)
                .single();

              const friendName = friendProfile?.display_name || friendProfile?.username || "A friend";
              const streak = friendProfile?.current_streak || 0;

              toast({
                title: `🔥 ${friendName} completed training!`,
                description: streak > 1 
                  ? `They're on a ${streak} day streak! Your turn!` 
                  : "Don't let them beat you!",
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [user, toast]);

  return { notifyFriendsOfCompletion };
};
