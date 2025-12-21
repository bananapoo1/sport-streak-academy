interface DayProgress {
  day: string;
  progress: number; // 0-100
}

interface WeekProgressProps {
  days: DayProgress[];
}

const WeekProgress = ({ days }: WeekProgressProps) => {
  // Get current day index (0 = Sunday, we show days starting from first day in array)
  const today = new Date().getDay();
  
  // Map day letters to day indices (assuming array starts with Sunday or Monday)
  const dayLetterToIndex: Record<string, number[]> = {
    "S": [0, 6], // Sunday or Saturday
    "M": [1],
    "T": [2, 4], // Tuesday or Thursday
    "W": [3],
    "F": [5],
  };
  
  // Track which days have been used to differentiate T and S
  const usedIndices = new Set<number>();
  
  return (
    <div className="flex gap-3 justify-center">
      {days.map((day, index) => {
        const radius = 16;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (day.progress / 100) * circumference;
        
        // Determine if this is "today"
        // We need to figure out which actual day this represents based on position in the week
        // Assuming week starts from the oldest day (6 days ago) to today
        const daysAgo = 6 - index;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const isToday = daysAgo === 0;
        
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className={`relative w-10 h-10 ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full' : ''}`}>
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
            <span className={`text-xs font-semibold uppercase ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
              {day.day}
              {isToday && <span className="block text-[8px] text-primary">TODAY</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WeekProgress;
