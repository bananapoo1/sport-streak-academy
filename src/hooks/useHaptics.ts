import { useCallback } from "react";

type HapticStrength = "light" | "medium";

export const useHaptics = () => {
  const impact = useCallback((strength: HapticStrength = "light") => {
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate(strength === "medium" ? 18 : 10);
      }

      const capacitorHaptics = (window as Window & {
        Capacitor?: {
          Plugins?: {
            Haptics?: {
              impact: (options: { style: "LIGHT" | "MEDIUM" }) => Promise<void>;
            };
          };
        };
      }).Capacitor?.Plugins?.Haptics;

      if (capacitorHaptics) {
        capacitorHaptics.impact({ style: strength === "medium" ? "MEDIUM" : "LIGHT" });
      }
    } catch {
      // no-op: haptics are best-effort only
    }
  }, []);

  return { impact };
};
