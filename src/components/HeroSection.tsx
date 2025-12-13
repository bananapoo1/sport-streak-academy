import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/Mascot";
import { ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden gradient-hero">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Train like a pro, from anywhere</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Level Up Your{" "}
              <span className="text-gradient relative z-10">Sports Skills</span>{" "}
              with Fun Drills
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Practice drills for 12+ sports, maintain your streak, climb the leagues, and become the athlete you've always wanted to be. All from home!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/sports">
                <Button variant="hero" size="xl">
                  Start Training Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/sports">
                <Button variant="outline" size="xl">
                  View All Sports
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Drills Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Sports</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>
            </div>
          </div>

          {/* Mascot */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-full blur-3xl opacity-20 scale-75" />
              <Mascot size="xl" className="relative z-10 w-64 h-64 md:w-80 md:h-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
