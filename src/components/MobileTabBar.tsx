import { Home, Trophy, Swords, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Sports", href: "/sports", icon: Trophy },
  { label: "Challenges", href: "/challenges", icon: Swords },
  { label: "Profile", href: "/profile", icon: User },
];

const hiddenRoutes = ["/auth"];

const MobileTabBar = () => {
  const location = useLocation();

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur">
      <div className="grid grid-cols-4 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.href || (tab.href !== "/" && location.pathname.startsWith(`${tab.href}/`));

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabBar;
