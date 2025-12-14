import { Zap, Clock, Target, Flame } from "lucide-react";

interface DailyStatsProps {
  xp: number;
  minutes: number;
  drillsCompleted: number;
  streak: number;
}

const DailyStats = ({ xp, minutes, drillsCompleted, streak }: DailyStatsProps) => {
  const stats = [
    { icon: Zap, label: "XP", value: xp, color: "text-xp" },
    { icon: Clock, label: "Min", value: minutes, color: "text-primary" },
    { icon: Target, label: "Drills", value: drillsCompleted, color: "text-accent" },
    { icon: Flame, label: "Streak", value: streak, color: "text-streak" },
  ];

  return (
    <div className="flex justify-center gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center">
          <div className={`flex items-center gap-1 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
            <span className="font-extrabold text-lg">{stat.value}</span>
          </div>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default DailyStats;
