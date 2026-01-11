import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import DailySpinWheel from "./components/DailySpinWheel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <DailySpinWheel />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;