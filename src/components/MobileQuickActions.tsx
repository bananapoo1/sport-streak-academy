import { Filter, UserPlus, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";

const MobileQuickActions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { impact } = useHaptics();

  const onAction = () => {
    impact("medium");

    if (location.pathname === "/drills") {
      navigate("/drills?filter=level-1");
      toast({ title: "Filter applied", description: "Showing beginner-friendly drills." });
      return;
    }

    if (location.pathname === "/profile") {
      navigate("/profile#friends");
      toast({ title: "Friends", description: "Jumped to your friends section." });
      return;
    }

    if (location.pathname === "/sports") {
      navigate("/sports/football");
      return;
    }

    navigate("/drills");
  };

  const getLabel = () => {
    if (location.pathname === "/drills") return "Filter";
    if (location.pathname === "/profile") return "Add Friend";
    if (location.pathname === "/sports") return "Top Sport";
    return "Start Drill";
  };

  const Icon = location.pathname === "/profile" ? UserPlus : location.pathname === "/drills" ? Filter : Zap;

  const showForPath = ["/", "/sports", "/drills", "/leagues", "/profile"].some((path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  if (!showForPath || location.pathname === "/auth") {
    return null;
  }

  return (
    <div className="md:hidden sticky top-16 z-40 px-4 py-2 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground truncate">Quick actions</p>
        <Button size="sm" variant="outline" className="h-8 min-w-[110px]" onClick={onAction}>
          <Icon className="w-4 h-4 mr-1" />
          {getLabel()}
        </Button>
      </div>
    </div>
  );
};

export default MobileQuickActions;
