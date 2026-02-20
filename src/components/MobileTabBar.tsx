import { Home, Trophy, Dumbbell, User, Rss } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Train", href: "/sports", icon: Dumbbell },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "Progress", href: "/achievements", icon: Trophy },
  { label: "Profile", href: "/profile", icon: User },
];

const hiddenRoutes = ["/auth", "/onboarding"];

const MobileTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { impact } = useHaptics();

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl shadow-[0_-4px_20px_hsl(var(--background)/0.9)]">
      <div className="grid grid-cols-5 px-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5">
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
                "flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 min-h-[3rem] transition-all duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
              <span className={cn(
                "text-[10px] leading-none font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-[max(env(safe-area-inset-bottom),0.5rem)] w-5 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;
