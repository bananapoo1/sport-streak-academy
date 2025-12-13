import { LucideIcon } from "lucide-react";

interface SportCardProps {
  name: string;
  icon: LucideIcon;
  drillCount: number;
  color: string;
  onClick?: () => void;
}

export const SportCard = ({ name, icon: Icon, drillCount, color, onClick }: SportCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 p-6 bg-card border-2 border-border rounded-2xl shadow-soft hover:shadow-card hover:border-primary transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{drillCount} drills</p>
      </div>
    </button>
  );
};

export default SportCard;
