import { useEffect, useState, useRef } from "react";
import { Star, Trophy, Medal, Crown, Zap, Flame, Target, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementUnlockOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    iconType: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    xpReward: number;
  } | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  flame: Flame,
  target: Target,
  medal: Medal,
  crown: Crown,
  zap: Zap,
  trophy: Trophy,
  award: Award,
};

type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

const rarityConfig = {
  common: {
    gradient: "from-slate-400 to-slate-600",
    glow: "shadow-slate-500/50",
    particles: "#94a3b8",
    sound: 220,
  },
  rare: {
    gradient: "from-blue-400 to-cyan-500",
    glow: "shadow-blue-500/50",
    particles: "#3b82f6",
    sound: 330,
  },
  epic: {
    gradient: "from-purple-400 to-pink-500",
    glow: "shadow-purple-500/50",
    particles: "#a855f7",
    sound: 440,
  },
  legendary: {
    gradient: "from-amber-400 via-orange-500 to-red-500",
    glow: "shadow-amber-500/60",
    particles: "#f59e0b",
    sound: 550,
  },
};

const AchievementUnlockOverlay = ({ isOpen, onClose, achievement }: AchievementUnlockOverlayProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [showContent, setShowContent] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen && achievement) {
      // Generate particles
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      // Play sound effect
      playSoundEffect(achievement.rarity);

      // Delay content reveal for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen, achievement]);

  const playSoundEffect = (rarity: "common" | "rare" | "epic" | "legendary") => {
    try {
      if (!audioContextRef.current) {
        const audioCtor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
        if (!audioCtor) return;
        audioContextRef.current = new audioCtor();
      }
      const ctx = audioContextRef.current;
      
      const baseFreq = rarityConfig[rarity].sound;
      
      // Create a triumphant sound
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = rarity === "legendary" ? "triangle" : "sine";
        
        const startTime = ctx.currentTime + i * 0.15;
        const duration = rarity === "legendary" ? 0.4 : 0.25;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });

      // Add a final flourish for legendary
      if (rarity === "legendary") {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.frequency.value = baseFreq * 3;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.6);
        }, 600);
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  if (!isOpen || !achievement) return null;

  const config = rarityConfig[achievement.rarity];
  const IconComponent = iconMap[achievement.iconType] || Trophy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-particle-burst"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: config.particles,
              animationDelay: `${particle.delay}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* Radial glow effect */}
      <div 
        className={`absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-pulse-glow`}
        style={{
          background: `radial-gradient(circle, ${config.particles} 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className={`
        relative z-10 max-w-sm mx-4 text-center
        ${showContent ? "animate-achievement-reveal" : "opacity-0 scale-50"}
      `}>
        {/* Badge container with glow */}
        <div className={`
          relative w-32 h-32 mx-auto mb-6
          rounded-full bg-gradient-to-br ${config.gradient}
          shadow-2xl ${config.glow}
          flex items-center justify-center
          animate-badge-spin
        `}>
          {/* Inner shine */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
          
          {/* Icon */}
          <IconComponent className="w-14 h-14 text-white drop-shadow-lg relative z-10" />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin-slow" />
          
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full animate-sparkle" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full animate-sparkle" style={{ animationDelay: "0.3s" }} />
        </div>

        {/* Rarity label */}
        <div className={`
          inline-block px-4 py-1 rounded-full mb-4
          bg-gradient-to-r ${config.gradient}
          text-white text-sm font-bold uppercase tracking-wider
          animate-bounce-gentle
        `}>
          {achievement.rarity} Achievement
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-foreground mb-2 animate-fade-in-up">
          🎉 {achievement.title}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {achievement.description}
        </p>

        {/* XP Reward */}
        <div className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6
          bg-gradient-to-r ${config.gradient}
          text-white font-bold text-xl
          animate-pulse-scale
        `}>
          <Zap className="w-6 h-6" />
          +{achievement.xpReward} XP
        </div>

        {/* Close button */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button 
            onClick={onClose}
            size="lg"
            className="w-full"
          >
            Awesome!
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes particle-burst {
          0% {
            transform: scale(0) translate(0, 0);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: scale(1) translate(
              ${Math.random() > 0.5 ? "" : "-"}${Math.random() * 200}px,
              ${Math.random() > 0.5 ? "" : "-"}${Math.random() * 200}px
            );
            opacity: 0;
          }
        }
        
        @keyframes achievement-reveal {
          0% {
            opacity: 0;
            transform: scale(0.5) rotateY(180deg);
          }
          50% {
            transform: scale(1.1) rotateY(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }
        
        @keyframes badge-spin {
          0% {
            transform: rotateY(0deg) scale(0);
          }
          50% {
            transform: rotateY(180deg) scale(1.2);
          }
          100% {
            transform: rotateY(360deg) scale(1);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-particle-burst {
          animation: particle-burst 1.5s ease-out forwards;
        }
        
        .animate-achievement-reveal {
          animation: achievement-reveal 0.8s ease-out forwards;
        }
        
        .animate-badge-spin {
          animation: badge-spin 0.8s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AchievementUnlockOverlay;
