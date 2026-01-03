import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, Trophy, Menu, X, User, LogIn, LogOut, Moon, Sun, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useChallenges } from "@/hooks/useChallenges";
import NotificationDropdown from "@/components/NotificationDropdown";
export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { streak } = useProgress();
  const { pendingChallenges } = useChallenges();

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + hash);
      setTimeout(() => {
        const element = document.querySelector(hash);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">⚽</span>
            <span className="font-extrabold text-xl text-foreground">DrillZone</span>
          </Link>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-8">
              <button onClick={() => handleNavClick("#sports")} className="font-medium text-muted-foreground hover:text-primary transition-colors">
                Sports
              </button>
              <button onClick={() => handleNavClick("#drills")} className="font-medium text-muted-foreground hover:text-primary transition-colors">
                Drills
              </button>
              <button onClick={() => handleNavClick("#leagues")} className="font-medium text-muted-foreground hover:text-primary transition-colors">
                Leagues
              </button>
              <button onClick={() => handleNavClick("#pricing")} className="font-medium text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </button>
            </div>
          </div>

          {/* Stats & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={toggleDarkMode} className="w-9 h-9">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user && (
              <>
                {/* Notifications */}
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
                <NotificationDropdown />
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <Button size="icon" variant="ghost" onClick={toggleDarkMode} className="w-9 h-9">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <button onClick={() => handleNavClick("#sports")} className="font-medium text-muted-foreground hover:text-primary transition-colors py-2 text-left">
                Sports
              </button>
              <button onClick={() => handleNavClick("#drills")} className="font-medium text-muted-foreground hover:text-primary transition-colors py-2 text-left">
                Drills
              </button>
              <button onClick={() => handleNavClick("#leagues")} className="font-medium text-muted-foreground hover:text-primary transition-colors py-2 text-left">
                Leagues
              </button>
              <button onClick={() => handleNavClick("#pricing")} className="font-medium text-muted-foreground hover:text-primary transition-colors py-2 text-left">
                Pricing
              </button>
              {user && (
                <>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-streak">
                      <Flame className="w-5 h-5 fill-current" />
                      <span className="font-bold">{streak}</span>
                    </div>
                    <div className="flex items-center gap-1 text-league-gold">
                      <Trophy className="w-5 h-5" />
                      <span className="font-bold text-sm">Gold</span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="mt-2 w-full" variant="outline">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button className="w-full" variant="ghost" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              )}
              {!user && (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="mt-2 w-full" variant="outline">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/sports" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;