import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Sports from "./pages/Sports";
import SportDetail from "./pages/SportDetail";
import DrillDetail from "./pages/DrillDetail";
import UserProfile from "./pages/UserProfile";
import SimulatedUserProfile from "./pages/SimulatedUserProfile";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Challenges from "./pages/Challenges";
import NotFound from "./pages/NotFound";
import Drills from "./pages/Drills";
import Leagues from "./pages/Leagues";
import Achievements from "./pages/Achievements";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import PrivacySettings from "./pages/PrivacySettings";
import MobileTabBar from "./components/MobileTabBar";
import DefaultTabOnboarding from "./components/DefaultTabOnboarding";
import StreakMilestone from "./components/StreakMilestone";
import AnalyticsConsentBanner from "./components/AnalyticsConsentBanner";
import { useProgress } from "./hooks/useProgress";
import { DEFAULT_TAB_STORAGE_KEY, deepLinkToPath } from "./lib/mobileNav";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const RoutedApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { streak, previousStreak } = useProgress();
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return;

    if (location.pathname === "/") {
      const savedDefaultTab = localStorage.getItem(DEFAULT_TAB_STORAGE_KEY);
      if (savedDefaultTab && savedDefaultTab !== "/") {
        navigate(savedDefaultTab, { replace: true });
      }
    }
  }, [location.pathname, navigate]);


  useEffect(() => {
    if (!navigator.serviceWorker) return;

    const handleMessage = (event: MessageEvent<{ type?: string; deepLink?: string }>) => {
      if (event.data?.type !== "OPEN_DEEP_LINK") return;
      const targetPath = deepLinkToPath(event.data.deepLink);
      navigate(targetPath);
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deepLink = params.get("deeplink");

    if (!deepLink) return;

    const targetPath = deepLinkToPath(deepLink);
    if (targetPath !== location.pathname) {
      navigate(targetPath, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCompletedOnboarding = localStorage.getItem("onboarding_v2_complete") === "true";
    const isOnboardingRoute = location.pathname.startsWith("/onboarding");
    const isAuthRoute = location.pathname.startsWith("/auth");

    if (!hasCompletedOnboarding && !isOnboardingRoute && !isAuthRoute) {
      navigate("/onboarding", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    const hasCompletedOnboarding = localStorage.getItem("onboarding_v2_complete") === "true";
    const hasSynced = localStorage.getItem("onboarding_v2_synced") === "true";
    const raw = localStorage.getItem("onboarding_v2_data");

    if (!hasCompletedOnboarding || hasSynced || !raw) return;

    let payload: Record<string, unknown> | null = null;
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }

    supabase
      .from("onboarding_responses")
      .upsert({
        user_id: user.id,
        data: payload,
        version: 1,
        source: "app",
      }, { onConflict: "user_id" })
      .then(({ error }) => {
        if (!error) {
          localStorage.setItem("onboarding_v2_synced", "true");
        }
      });
  }, [user]);

  return (
    <>
      <div key={location.pathname} className="route-transition">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/:sportSlug" element={<SportDetail />} />
          <Route path="/drill/:sportSlug/:drillId" element={<DrillDetail />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/simulated-profile/:userId" element={<SimulatedUserProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/drills" element={<Drills />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/privacy-settings" element={<PrivacySettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <StreakMilestone streak={streak} previousStreak={previousStreak} />
      <MobileTabBar />
      <DefaultTabOnboarding />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RoutedApp />
          <AnalyticsConsentBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
