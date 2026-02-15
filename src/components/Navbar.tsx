import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Flame,
  Trophy,
  User,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Swords,
  Settings,
  Bell,
  EllipsisVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useChallenges } from "@/hooks/useChallenges";
import { useFriends } from "@/hooks/useFriends";
import NotificationDropdown from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getMobileTitle = (pathname: string) => {
  if (pathname === "/") return "Home";
  if (pathname === "/sports") return "Sports";
  if (pathname.startsWith("/sports/")) return "Sport Details";
  if (pathname === "/drills") return "Drills";
  if (pathname.startsWith("/drill/")) return "Drill";
  if (pathname === "/leagues") return "Leagues";
  if (pathname === "/achievements") return "Achievements";
  if (pathname === "/pricing") return "Pricing";
  if (pathname === "/challenges") return "Challenges";
  if (pathname === "/profile") return "Profile";
  if (pathname.startsWith("/profile/")) return "Athlete Profile";
  if (pathname === "/checkout") return "Checkout";
  if (pathname === "/auth") return "Sign In";
  return "DrillZone";
};

export const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { streak } = useProgress();
  const { pendingChallenges } = useChallenges();
  const { pendingRequests } = useFriends();

  const totalNotifications = pendingChallenges.length + pendingRequests.length;

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") !== "false";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link to="/" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">⚽</span>
            <span className="font-extrabold text-xl text-foreground">DrillZone</span>
          </Link>

          <div className="md:hidden flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-lg text-foreground">{getMobileTitle(location.pathname)}</span>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-6">
              <Link to="/sports" className="font-medium text-muted-foreground hover:text-primary transition-colors">Sports</Link>
              <Link to="/drills" className="font-medium text-muted-foreground hover:text-primary transition-colors">Drills</Link>
              <Link to="/leagues" className="font-medium text-muted-foreground hover:text-primary transition-colors">Leagues</Link>
              <Link to="/achievements" className="font-medium text-muted-foreground hover:text-primary transition-colors">Achievements</Link>
              <Link to="/pricing" className="font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={toggleDarkMode} className="w-9 h-9">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user && (
              <>
                <NotificationDropdown />
                <Link to="/challenges" className="relative">
                  <Button size="icon" variant="ghost" className="w-9 h-9">
                    <Swords className="w-4 h-4" />
                    {pendingChallenges.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                        {pendingChallenges.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <div className="flex items-center gap-1 text-streak">
                  <Flame className="w-5 h-5 fill-current" />
                  <span className="font-bold">{streak}</span>
                </div>
                <div className="flex items-center gap-1 text-league-gold">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-sm">Gold</span>
                </div>
                <Link to="/profile">
                  <Button size="sm" variant="outline">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
            {!user && (
              <>
                <Link to="/auth">
                  <Button size="sm" variant="outline">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/sports">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="w-9 h-9 relative">
                  <EllipsisVertical className="w-4 h-4" />
                  {user && totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                      {totalNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/challenges")}> 
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {darkMode ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
