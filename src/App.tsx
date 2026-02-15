import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
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
import DailySpinWheel from "./components/DailySpinWheel";
import MobileTabBar from "./components/MobileTabBar";
import DefaultTabOnboarding from "./components/DefaultTabOnboarding";
import { DEFAULT_TAB_STORAGE_KEY, deepLinkToPath } from "./lib/mobileNav";

const queryClient = new QueryClient();

const RoutedApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <DailySpinWheel />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
