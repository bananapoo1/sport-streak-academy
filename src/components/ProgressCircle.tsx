interface ProgressCircleProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg" | "xl";
  showMinutes?: boolean;
  minutes?: number;
  goalMinutes?: number;
}

const sizeConfig = {
  sm: { size: 48, strokeWidth: 4, fontSize: "text-xs" },
  md: { size: 80, strokeWidth: 6, fontSize: "text-sm" },
  lg: { size: 160, strokeWidth: 10, fontSize: "text-2xl" },
  xl: { size: 240, strokeWidth: 14, fontSize: "text-4xl" },
};

const ProgressCircle = ({ 
  progress, 
  size = "lg", 
  showMinutes = false,
  minutes = 0,
  goalMinutes = 10
}: ProgressCircleProps) => {
  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showMinutes ? (
          <>
            <span className={`font-extrabold text-foreground ${config.fontSize}`}>
              {minutes}
            </span>
            <span className="text-xs text-muted-foreground">/ {goalMinutes} min</span>
          </>
        ) : (
          <span className={`font-extrabold text-foreground ${config.fontSize}`}>
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
