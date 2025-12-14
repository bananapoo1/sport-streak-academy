import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, Trophy, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoSports from "@/assets/logo-sports.png";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + hash);
    } else {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoSports} alt="DrillZone" className="w-10 h-10 object-contain" />
            <span className="font-extrabold text-xl text-foreground">DrillZone</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Stats & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 text-streak">
              <Flame className="w-5 h-5 fill-current" />
              <span className="font-bold">7</span>
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
            <Link to="/sports">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1 text-streak">
                  <Flame className="w-5 h-5 fill-current" />
                  <span className="font-bold">7</span>
                </div>
                <div className="flex items-center gap-1 text-league-gold">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-sm">Gold</span>
                </div>
              </div>
              <Link to="/sports" onClick={() => setMobileMenuOpen(false)}>
                <Button className="mt-2 w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
