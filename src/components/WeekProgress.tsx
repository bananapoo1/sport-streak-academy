interface DayProgress {
  day: string;
  progress: number; // 0-100
}

interface WeekProgressProps {
  days: DayProgress[];
}

const WeekProgress = ({ days }: WeekProgressProps) => {
  return (
    <div className="flex gap-3 justify-center">
      {days.map((day, index) => {
        const radius = 16;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (day.progress / 100) * circumference;
        
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className="relative w-10 h-10">
              <svg width={40} height={40} className="transform -rotate-90">
                <circle
                  cx={20}
                  cy={20}
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                />
                <circle
                  cx={20}
                  cy={20}
                  r={radius}
                  fill="none"
                  stroke={day.progress >= 100 ? "hsl(var(--success))" : "hsl(var(--primary))"}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-300"
                />
              </svg>
              {day.progress >= 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-success text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {day.day}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WeekProgress;
