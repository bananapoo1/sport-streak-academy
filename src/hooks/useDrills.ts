import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DrillFromAPI {
  id: string;
  sport: string;
  category: string;
  category_name: string | null;
  level: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  solo_or_duo: string | null;
  xp: number;
  free: boolean;
  unlock_status: "locked" | "unlocked" | "completed";
  is_completed: boolean;
}

export interface CategoryFromAPI {
  id: string;
  sport: string;
  name: string;
  total_levels: number;
  drills_per_level: number;
  total_drills: number;
  max_level_with_drills: number;
  level_map: {
    level: number;
    drill_count: number;
    is_boss_level: boolean;
  }[];
}

interface UseDrillsOptions {
  sport?: string;
  category?: string;
  level?: number;
}

export const useDrills = (options: UseDrillsOptions = {}) => {
  const [drills, setDrills] = useState<DrillFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrills = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.sport) params.append("sport", options.sport);
      if (options.category) params.append("category", options.category);
      if (options.level !== undefined) params.append("level", String(options.level));

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth header if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `https://nikvolkksngggjkvpzrd.supabase.co/functions/v1/get-drills?${params.toString()}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch drills");
      }

      const data = await response.json();
      setDrills(data.drills || []);
    } catch (err) {
      console.error("Error fetching drills:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [options.sport, options.category, options.level]);

  useEffect(() => {
    fetchDrills();
  }, [fetchDrills]);

  return {
    drills,
    loading,
    error,
    refetch: fetchDrills,
  };
};

export const useDrill = (drillId: string | undefined) => {
  const [drill, setDrill] = useState<DrillFromAPI & {
    equipment: unknown[] | null;
    steps: unknown[] | null;
    metric: Record<string, unknown> | null;
    unlock_requires: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrill = useCallback(async () => {
    if (!drillId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `https://nikvolkksngggjkvpzrd.supabase.co/functions/v1/get-drill?id=${encodeURIComponent(drillId)}`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setDrill(null);
          return;
        }
        throw new Error("Failed to fetch drill");
      }

      const data = await response.json();
      setDrill(data.drill || null);
    } catch (err) {
      console.error("Error fetching drill:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [drillId]);

  useEffect(() => {
    fetchDrill();
  }, [fetchDrill]);

  return {
    drill,
    loading,
    error,
    refetch: fetchDrill,
  };
};

export const useCategories = (sport: string | undefined) => {
  const [categories, setCategories] = useState<CategoryFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!sport) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nikvolkksngggjkvpzrd.supabase.co/functions/v1/get-categories?sport=${encodeURIComponent(sport)}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
