import { useCallback, useEffect, useState } from "react";

const ONBOARDING_DATA_KEY = "onboarding_v2_data";

export interface OnboardingPreferences {
  sports: string[];
  primarySport: string | null;
  skillLevel: string | null;
  focus: string | null;
  goal: string | null;
  personalTag: string;
  equipment: string[];
  weeklyDays: string[];
  sessionMinutes: number;
  reminderTime: string;
  remindersEnabled: boolean;
}

const defaults: OnboardingPreferences = {
  sports: [],
  primarySport: null,
  skillLevel: null,
  focus: null,
  goal: null,
  personalTag: "",
  equipment: [],
  weeklyDays: ["mon", "wed", "fri"],
  sessionMinutes: 10,
  reminderTime: "evening",
  remindersEnabled: true,
};

/** Reads onboarding responses from localStorage. */
function loadPreferences(): OnboardingPreferences {
  try {
    const raw = localStorage.getItem(ONBOARDING_DATA_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<OnboardingPreferences>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

/**
 * Maps onboarding focus (technique / fitness / tactics / mentality)
 * to the drill category slugs that best match it for a given sport.
 *
 * Every sport uses the same conventions for category slugs found in drillsData
 * (shooting, dribbling, passing, defense, fitness, etc.), so we can map focus
 * areas to preferred categories generically.
 *
 * Returns an ordered list — first entry is the strongest match.
 */
export function focusToCategoryPriority(focus: string | null): string[] {
  switch (focus) {
    case "technique":
      return ["dribbling", "ball-handling", "shooting", "passing", "bowling", "backhand", "forehand"];
    case "fitness":
      return ["fitness", "agility", "speed", "endurance", "movement"];
    case "tactics":
      return ["passing", "defense", "positioning", "strategy", "tackling", "reading"];
    case "mentality":
      // Mentality maps to high-difficulty / pressure drills — no dedicated category,
      // so we fall back to the sport default order.
      return [];
    default:
      return [];
  }
}

/**
 * Maps skillLevel to a starting difficulty band for the adaptive assignment
 * algorithm.  The numbers correspond to the difficultyScore 0-95 scale.
 */
export function skillToDifficultyBand(skillLevel: string | null): { min: number; max: number } {
  switch (skillLevel) {
    case "beginner":
      return { min: 5, max: 40 };
    case "intermediate":
      return { min: 25, max: 65 };
    case "advanced":
      return { min: 50, max: 95 };
    default:
      return { min: 5, max: 95 };
  }
}

/**
 * Derive a default category for the DailyCard based on the user's focus.
 * Falls back to "shooting" to keep the UX predictable.
 */
export function defaultCategoryForFocus(focus: string | null): string {
  const cats = focusToCategoryPriority(focus);
  return cats[0] ?? "shooting";
}

export function useOnboardingPreferences() {
  const [prefs, setPrefs] = useState<OnboardingPreferences>(loadPreferences);

  // Re-read when localStorage changes in another tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === ONBOARDING_DATA_KEY) {
        setPrefs(loadPreferences());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  /** Update the active sport without going through onboarding again. */
  const switchSport = useCallback((sportSlug: string) => {
    setPrefs((prev) => {
      const updated = { ...prev, primarySport: sportSlug };
      // Also make sure the sport is in the list
      if (!updated.sports.includes(sportSlug)) {
        updated.sports = [...updated.sports, sportSlug];
      }
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Update focus area on-the-fly. */
  const switchFocus = useCallback((focus: string) => {
    setPrefs((prev) => {
      const updated = { ...prev, focus };
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    ...prefs,
    /** The sport slug to use for navigation / drill fetching */
    activeSport: prefs.primarySport ?? prefs.sports[0] ?? "football",
    defaultCategory: defaultCategoryForFocus(prefs.focus),
    switchSport,
    switchFocus,
  };
}
