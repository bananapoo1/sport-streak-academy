import { Trophy, TrendingUp } from "lucide-react";

interface LeagueBadgeProps {
  league: "bronze" | "silver" | "gold" | "diamond";
  rank?: number;
}

const leagueConfig = {
  bronze: {
    label: "Bronze League",
    bgClass: "bg-league-bronze/20",
    textClass: "text-league-bronze",
    borderClass: "border-league-bronze",
  },
  silver: {
    label: "Silver League",
    bgClass: "bg-league-silver/20",
    textClass: "text-league-silver",
    borderClass: "border-league-silver",
  },
  gold: {
    label: "Gold League",
    bgClass: "bg-league-gold/20",
    textClass: "text-league-gold",
    borderClass: "border-league-gold",
  },
  diamond: {
    label: "Diamond League",
    bgClass: "bg-league-diamond/20",
    textClass: "text-league-diamond",
    borderClass: "border-league-diamond",
  },
};

export const LeagueBadge = ({ league, rank }: LeagueBadgeProps) => {
  const config = leagueConfig[league];

  return (
    <div
      className={`flex items-center gap-3 ${config.bgClass} border-2 ${config.borderClass} rounded-2xl px-4 py-2 shadow-soft`}
    >
      <Trophy className={`w-6 h-6 ${config.textClass}`} />
      <div className="flex flex-col">
        <span className="font-bold text-foreground text-sm">{config.label}</span>
        {rank && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            Rank #{rank}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueBadge;
