import { Home, Trophy, Dumbbell, Medal, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Sports", href: "/sports", icon: Trophy },
  { label: "Drills", href: "/drills", icon: Dumbbell },
  { label: "Leagues", href: "/leagues", icon: Medal },
  { label: "Profile", href: "/profile", icon: User },
];

const hiddenRoutes = ["/auth"];

const MobileTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { impact } = useHaptics();

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl shadow-[0_-8px_24px_hsl(var(--background)/0.8)]">
      <div className="grid grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.href || (tab.href !== "/" && location.pathname.startsWith(`${tab.href}/`));

          return (
            <button
              key={tab.href}
              aria-label={tab.label}
              onClick={() => {
                impact("light");
                navigate(tab.href);
              }}
              className={cn(
                "flex items-center justify-center rounded-2xl py-3.5 min-h-12 transition-all duration-200 active:scale-95",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;
