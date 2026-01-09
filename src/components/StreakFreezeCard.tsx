import { Snowflake, Shield, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StreakFreezeCardProps {
  freezeCount: number;
  hasSubscription: boolean;
  onUseFreeze?: () => void;
  onGetMore?: () => void;
  compact?: boolean;
}

const StreakFreezeCard = ({ 
  freezeCount, 
  hasSubscription, 
  onUseFreeze, 
  onGetMore,
  compact = false 
}: StreakFreezeCardProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-[hsl(195,85%,55%)]/20 flex items-center justify-center">
          <Snowflake className="w-5 h-5 text-[hsl(195,85%,55%)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Streak Freezes</p>
          <p className="text-xs text-muted-foreground">Protect your streak</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{freezeCount}</span>
          {!hasSubscription && <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[hsl(195,85%,55%)]/10 to-[hsl(195,85%,65%)]/5 border-2 border-[hsl(195,85%,55%)]/30 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[hsl(195,85%,55%)]/20 flex items-center justify-center">
            <Snowflake className="w-7 h-7 text-[hsl(195,85%,55%)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Streak Freeze</h3>
            <p className="text-sm text-muted-foreground">Protect your streak when life gets busy</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">{freezeCount}</div>
          <p className="text-xs text-muted-foreground">available</p>
        </div>
      </div>

      <div className="bg-card/50 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">How it works</p>
            <p className="text-xs text-muted-foreground">
              If you miss a day, a Streak Freeze is automatically used to keep your streak alive. 
              Pro members earn 1 freeze per week!
            </p>
          </div>
        </div>
      </div>

      {hasSubscription ? (
        <div className="flex items-center gap-2 text-sm text-success">
          <Crown className="w-4 h-4" />
          <span>Pro member - Earning 1 freeze/week</span>
        </div>
      ) : (
        <Button 
          onClick={onGetMore} 
          variant="outline" 
          className="w-full border-[hsl(195,85%,55%)]/50 hover:bg-[hsl(195,85%,55%)]/10"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro for Weekly Freezes
        </Button>
      )}
    </div>
  );
};

export default StreakFreezeCard;
