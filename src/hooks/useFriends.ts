import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  username: string | null;
  avatar_id: string;
  current_streak: number;
  status: string;
}

interface SentRequest {
  id: string;
  friendId: string;
  username: string | null;
  avatar_id: string;
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    // Fetch accepted friendships
    const { data: friendships } = await supabase
      .from("friendships")
      .select(`
        id,
        friend_id,
        user_id,
        status
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq("status", "accepted");

    if (friendships) {
      const friendIds = friendships.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, avatar_id, current_streak")
          .in("id", friendIds);

        if (profiles) {
          setFriends(profiles.map(p => ({ ...p, status: "accepted" })));
        }
      }
    }

    // Fetch pending requests (where user is the recipient)
    const { data: pending } = await supabase
      .from("friendships")
      .select(`
        id,
        user_id,
        status
      `)
      .eq("friend_id", user.id)
      .eq("status", "pending");

    if (pending && pending.length > 0) {
      const senderIds = pending.map(p => p.user_id);
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_id, current_streak")
        .in("id", senderIds);

      if (senderProfiles) {
        setPendingRequests(senderProfiles.map(p => ({ ...p, status: "pending" })));
      }
    } else {
      setPendingRequests([]);
    }

    // Fetch sent requests (where user is the sender and still pending)
    const { data: sent } = await supabase
      .from("friendships")
      .select(`
        id,
        friend_id,
        status
      `)
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (sent && sent.length > 0) {
      const recipientIds = sent.map(s => s.friend_id);
      const { data: recipientProfiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_id")
        .in("id", recipientIds);

      if (recipientProfiles) {
        setSentRequests(sent.map(s => {
          const profile = recipientProfiles.find(p => p.id === s.friend_id);
          return {
            id: s.id,
            friendId: s.friend_id,
            username: profile?.username || null,
            avatar_id: profile?.avatar_id || "⚽",
          };
        }));
      }
    } else {
      setSentRequests([]);
    }

    setLoading(false);
  }, [user]);

  const sendFriendRequest = async (friendUsername: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    // Find user by username
    const { data: friendProfile, error: findError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", friendUsername)
      .maybeSingle();

    if (findError || !friendProfile) {
      return { success: false, error: "User not found" };
    }

    if (friendProfile.id === user.id) {
      return { success: false, error: "You can't add yourself" };
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Friend request already exists" };
    }

    // Create friendship request
    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: friendProfile.id,
      status: "pending",
    });

    if (error) {
      return { success: false, error: "Failed to send request" };
    }

    toast({
      title: "Friend request sent!",
      description: `Request sent to ${friendUsername}`,
    });

    return { success: true };
  };

  const acceptFriendRequest = async (friendId: string) => {
    if (!user) return;

    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("user_id", friendId)
      .eq("friend_id", user.id);

    toast({
      title: "Friend added!",
      description: "You are now friends",
    });

    fetchFriends();
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    await supabase
      .from("friendships")
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    toast({
      title: "Friend removed",
    });

    fetchFriends();
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
    } else {
      setLoading(false);
    }
  }, [user, fetchFriends]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    refreshFriends: fetchFriends,
  };
};