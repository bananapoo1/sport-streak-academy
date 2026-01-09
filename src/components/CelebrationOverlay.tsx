import { useEffect, useState } from "react";
import { Trophy, Star, Zap, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CelebrationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  type: "challenge_won" | "challenge_complete" | "training_complete" | "streak";
  xpEarned?: number;
  title?: string;
  subtitle?: string;
}

const confettiColors = [
  "hsl(var(--primary))",
  "hsl(var(--streak-gold))",
  "hsl(var(--xp-purple))",
  "hsl(var(--success))",
  "hsl(var(--league-diamond))",
];

const CelebrationOverlay = ({ 
  isOpen, 
  onClose, 
  type, 
  xpEarned = 0,
  title,
  subtitle 
}: CelebrationOverlayProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "challenge_won":
        return <Trophy className="w-20 h-20 text-league-gold" />;
      case "challenge_complete":
        return <Zap className="w-20 h-20 text-xp" />;
      case "training_complete":
        return <Star className="w-20 h-20 text-primary" />;
      case "streak":
        return <PartyPopper className="w-20 h-20 text-streak" />;
      default:
        return <Sparkles className="w-20 h-20 text-primary" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "challenge_won":
        return "🏆 Victory!";
      case "challenge_complete":
        return "Challenge Complete!";
      case "training_complete":
        return "Training Complete!";
      case "streak":
        return "🔥 Streak Extended!";
      default:
        return "Awesome!";
    }
  };

  const getDefaultSubtitle = () => {
    switch (type) {
      case "challenge_won":
        return "You defeated your opponent!";
      case "challenge_complete":
        return "Great effort! Waiting for opponent...";
      case "training_complete":
        return "Keep up the amazing work!";
      case "streak":
        return "Your dedication is paying off!";
      default:
        return "Well done!";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 rounded-sm animate-confetti"
            style={{
              left: `${piece.x}%`,
              top: "-20px",
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 bg-card border-2 border-primary/30 rounded-3xl p-8 max-w-md mx-4 text-center animate-celebration-pop shadow-2xl">
        <div className="mb-6 animate-bounce-slow">
          {getIcon()}
        </div>
        
        <h2 className="text-4xl font-extrabold text-foreground mb-3">
          {title || getDefaultTitle()}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          {subtitle || getDefaultSubtitle()}
        </p>

        {xpEarned > 0 && (
          <div className="inline-flex items-center gap-2 bg-xp/20 text-xp px-6 py-3 rounded-full mb-6 animate-pulse">
            <Zap className="w-6 h-6" />
            <span className="text-2xl font-bold">+{xpEarned} XP</span>
          </div>
        )}

        <Button 
          onClick={onClose} 
          size="lg" 
          className="w-full bg-primary hover:bg-primary/90"
        >
          Continue
        </Button>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes celebration-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
        
        .animate-celebration-pop {
          animation: celebration-pop 0.5s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CelebrationOverlay;
