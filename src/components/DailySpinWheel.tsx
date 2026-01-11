import { useState, useRef, useEffect } from "react";
import { Gift, Zap, Snowflake, Star, Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  probability: number;
  value: number;
  type: "xp" | "freeze" | "cosmetic" | "bonus";
}

const rewards: Reward[] = [
  { id: "xp_50", name: "+50 XP", icon: <Zap className="w-6 h-6" />, color: "hsl(var(--xp-purple))", probability: 30, value: 50, type: "xp" },
  { id: "xp_100", name: "+100 XP", icon: <Zap className="w-6 h-6" />, color: "hsl(var(--xp-purple))", probability: 25, value: 100, type: "xp" },
  { id: "xp_200", name: "+200 XP", icon: <Zap className="w-6 h-6" />, color: "hsl(var(--xp-purple))", probability: 15, value: 200, type: "xp" },
  { id: "freeze", name: "Streak Freeze", icon: <Snowflake className="w-6 h-6" />, color: "hsl(195 85% 55%)", probability: 10, value: 1, type: "freeze" },
  { id: "xp_500", name: "+500 XP", icon: <Star className="w-6 h-6" />, color: "hsl(var(--streak-gold))", probability: 10, value: 500, type: "xp" },
  { id: "double_xp", name: "2x XP Bonus", icon: <Crown className="w-6 h-6" />, color: "hsl(var(--league-gold))", probability: 7, value: 2, type: "bonus" },
  { id: "xp_1000", name: "+1000 XP", icon: <Sparkles className="w-6 h-6" />, color: "hsl(45 93% 55%)", probability: 3, value: 1000, type: "xp" },
];

const DailySpinWheel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (user) {
      checkSpinAvailability();
    }
  }, [user]);

  const checkSpinAvailability = async () => {
    if (!user) return;
    
    // Check if user has spun today using local storage + profile
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(`lastSpin_${user.id}`);
    
    if (storedDate !== today) {
      setCanSpin(true);
      setLastSpinDate(storedDate);
    } else {
      setCanSpin(false);
      setLastSpinDate(today);
    }
  };

  const selectReward = (): Reward => {
    const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
    let random = Math.random() * totalProbability;
    
    for (const reward of rewards) {
      random -= reward.probability;
      if (random <= 0) return reward;
    }
    return rewards[0];
  };

  const playSpinSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Tick sounds during spin
      let tickCount = 0;
      const tickInterval = setInterval(() => {
        if (tickCount > 30) {
          clearInterval(tickInterval);
          return;
        }
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = 400 + (tickCount * 5);
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
        
        tickCount++;
      }, 100 + tickCount * 10);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const playWinSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = freq;
        oscillator.type = "triangle";
        const startTime = ctx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const applyReward = async (reward: Reward) => {
    if (!user) return;

    try {
      if (reward.type === "xp") {
        // Add XP to profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("id", user.id)
          .single();
        
        await supabase
          .from("profiles")
          .update({ total_xp: (profile?.total_xp || 0) + reward.value })
          .eq("id", user.id);
      } else if (reward.type === "freeze") {
        // Add streak freeze
        const { data: profile } = await supabase
          .from("profiles")
          .select("streak_freezes")
          .eq("id", user.id)
          .single();
        
        await supabase
          .from("profiles")
          .update({ streak_freezes: (profile?.streak_freezes || 0) + reward.value })
          .eq("id", user.id);
      }
      // Other reward types can be handled similarly
    } catch (error) {
      console.error("Error applying reward:", error);
    }
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning || !user) return;

    setIsSpinning(true);
    setWonReward(null);
    playSpinSound();

    const selectedReward = selectReward();
    const rewardIndex = rewards.findIndex(r => r.id === selectedReward.id);
    const segmentAngle = 360 / rewards.length;
    
    // Calculate rotation to land on the selected reward
    const baseRotation = 360 * 5; // 5 full rotations
    const targetAngle = 360 - (rewardIndex * segmentAngle + segmentAngle / 2);
    const finalRotation = rotation + baseRotation + targetAngle + (Math.random() * 10 - 5);
    
    setRotation(finalRotation);

    // Wait for spin to complete
    setTimeout(async () => {
      setIsSpinning(false);
      setWonReward(selectedReward);
      playWinSound();
      
      // Mark as spun today
      const today = new Date().toDateString();
      localStorage.setItem(`lastSpin_${user.id}`, today);
      setCanSpin(false);
      
      // Apply the reward
      await applyReward(selectedReward);
      
      toast({
        title: "🎉 Congratulations!",
        description: `You won ${selectedReward.name}!`,
      });
    }, 4000);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Spin Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-24 right-6 z-40
          w-16 h-16 rounded-full
          bg-gradient-to-br from-amber-400 to-orange-500
          shadow-lg shadow-amber-500/30
          flex items-center justify-center
          transition-all duration-300
          ${canSpin ? "animate-bounce hover:scale-110" : "opacity-70"}
        `}
        aria-label="Daily Spin Wheel"
      >
        <Gift className="w-8 h-8 text-white" />
        {canSpin && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-[10px] text-destructive-foreground font-bold">
            1
          </span>
        )}
      </button>

      {/* Spin Wheel Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md overflow-visible">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-extrabold">
              🎡 Daily Spin Wheel
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            {/* Wheel Container */}
            <div className="relative w-72 h-72 mb-6">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
              </div>

              {/* Wheel */}
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-primary shadow-2xl overflow-hidden transition-transform"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? "4s" : "0s",
                  transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
                }}
              >
                {rewards.map((reward, index) => {
                  const angle = (360 / rewards.length) * index;
                  const skewAngle = 90 - 360 / rewards.length;
                  
                  return (
                    <div
                      key={reward.id}
                      className="absolute w-1/2 h-1/2 origin-bottom-right"
                      style={{
                        transform: `rotate(${angle}deg) skewY(-${skewAngle}deg)`,
                        left: "0",
                        top: "0",
                      }}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor: reward.color,
                          transform: `skewY(${skewAngle}deg) rotate(${180 / rewards.length}deg)`,
                        }}
                      >
                        <div 
                          className="text-white"
                          style={{
                            transform: `rotate(-${angle + 180 / rewards.length}deg)`,
                          }}
                        >
                          {reward.icon}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-card border-4 border-primary rounded-full flex items-center justify-center shadow-lg z-10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Won Reward Display */}
            {wonReward && (
              <div className="text-center mb-4 animate-fade-in">
                <div className="text-lg font-bold text-foreground mb-1">You Won!</div>
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white"
                  style={{ backgroundColor: wonReward.color }}
                >
                  {wonReward.icon}
                  {wonReward.name}
                </div>
              </div>
            )}

            {/* Spin Button */}
            <Button
              onClick={handleSpin}
              disabled={!canSpin || isSpinning}
              size="lg"
              className="w-full text-lg font-bold"
            >
              {isSpinning ? (
                "Spinning..."
              ) : canSpin ? (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Spin Now!
                </>
              ) : (
                "Come Back Tomorrow!"
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Spin once daily for free rewards!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailySpinWheel;
