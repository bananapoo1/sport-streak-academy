import { Flame, Trophy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Mascot from "./Mascot";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Mascot size="sm" animate={false} className="w-10 h-10" />
            <span className="font-extrabold text-xl text-foreground">DrillZone</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#sports" className="font-medium text-muted-foreground hover:text-primary transition-colors">
              Sports
            </a>
            <a href="#drills" className="font-medium text-muted-foreground hover:text-primary transition-colors">
              Drills
            </a>
            <a href="#leagues" className="font-medium text-muted-foreground hover:text-primary transition-colors">
              Leagues
            </a>
            <a href="#pricing" className="font-medium text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
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
            <Button size="sm">Get Started</Button>
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
              <a href="#sports" className="font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Sports
              </a>
              <a href="#drills" className="font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Drills
              </a>
              <a href="#leagues" className="font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Leagues
              </a>
              <a href="#pricing" className="font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Pricing
              </a>
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
              <Button className="mt-2">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
