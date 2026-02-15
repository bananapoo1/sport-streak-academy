import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: "star" | "flame" | "target" | "medal" | "crown" | "zap" | "trophy" | "award";
  requirement: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
  type: "drills" | "streak" | "xp" | "boss" | "league";
}

// Achievement definitions
const achievementDefinitions: Achievement[] = [
  {
    id: "first-drill",
    title: "First Steps",
    description: "Complete your first drill",
    iconType: "star",
    requirement: 1,
    rarity: "common",
    xpReward: 50,
    type: "drills",
  },
  {
    id: "streak-7",
    title: "On Fire",
    description: "Maintain a 7-day streak",
    iconType: "flame",
    requirement: 7,
    rarity: "common",
    xpReward: 100,
    type: "streak",
  },
  {
    id: "drills-10",
    title: "Getting Started",
    description: "Complete 10 drills",
    iconType: "target",
    requirement: 10,
    rarity: "common",
    xpReward: 150,
    type: "drills",
  },
  {
    id: "streak-30",
    title: "Dedicated Athlete",
    description: "Maintain a 30-day streak",
    iconType: "flame",
    requirement: 30,
    rarity: "rare",
    xpReward: 300,
    type: "streak",
  },
  {
    id: "drills-50",
    title: "Drill Sergeant",
    description: "Complete 50 drills",
    iconType: "medal",
    requirement: 50,
    rarity: "rare",
    xpReward: 500,
    type: "drills",
  },
  {
    id: "drills-100",
    title: "Century Club",
    description: "Complete 100 drills",
    iconType: "crown",
    requirement: 100,
    rarity: "epic",
    xpReward: 750,
    type: "drills",
  },
  {
    id: "xp-10000",
    title: "XP Hunter",
    description: "Earn 10,000 XP",
    iconType: "zap",
    requirement: 10000,
    rarity: "epic",
    xpReward: 1000,
    type: "xp",
  },
  {
    id: "streak-100",
    title: "Living Legend",
    description: "Maintain a 100-day streak",
    iconType: "trophy",
    requirement: 100,
    rarity: "legendary",
    xpReward: 2000,
    type: "streak",
  },
];

interface UserStats {
  totalDrills: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
}

export interface ComputedAchievement extends Achievement {
  progress: number;
  unlocked: boolean;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalDrills: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXp: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    if (!user) {
      setUserStats({ totalDrills: 0, currentStreak: 0, longestStreak: 0, totalXp: 0 });
      setLoading(false);
      return;
    }

    try {
      // Get drill count
      const { count: drillCount } = await supabase
        .from("completed_drills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get profile stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, total_xp")
        .eq("id", user.id)
        .maybeSingle();

      setUserStats({
        totalDrills: drillCount || 0,
        currentStreak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        totalXp: profile?.total_xp || 0,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const achievements = useMemo((): ComputedAchievement[] => {
    return achievementDefinitions.map((achievement) => {
      let progress = 0;
      let unlocked = false;

      switch (achievement.type) {
        case "drills":
          progress = Math.min(userStats.totalDrills, achievement.requirement);
          unlocked = userStats.totalDrills >= achievement.requirement;
          break;
        case "streak":
          // Use longest streak for unlocking
          progress = Math.min(userStats.longestStreak, achievement.requirement);
          unlocked = userStats.longestStreak >= achievement.requirement;
          break;
        case "xp":
          progress = Math.min(userStats.totalXp, achievement.requirement);
          unlocked = userStats.totalXp >= achievement.requirement;
          break;
        default:
          progress = 0;
          unlocked = false;
      }

      return {
        ...achievement,
        progress,
        unlocked,
      };
    });
  }, [userStats]);

  return {
    achievements,
    userStats,
    loading,
    refreshAchievements: fetchUserStats,
  };
};
