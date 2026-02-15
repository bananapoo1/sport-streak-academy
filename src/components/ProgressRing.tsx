import { useMemo } from "react";
import { designTokens } from "@/theme/designTokens";

type Props = {
  size?: number;
  stroke?: number;
  progress: number;
  animate?: boolean;
  label?: string;
};

export function getRingGeometry(size: number, stroke: number, progress: number) {
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedProgress / 100);

  return {
    radius,
    circumference,
    strokeDashoffset,
    normalizedProgress,
  };
}

export default function ProgressRing({ size = 96, stroke = 8, progress, animate = true, label }: Props) {
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const geometry = useMemo(() => getRingGeometry(size, stroke, progress), [size, stroke, progress]);

  const center = size / 2;
  const transition = !prefersReducedMotion && animate
    ? `stroke-dashoffset ${designTokens.motion.normal}ms ${designTokens.motion.easing}`
    : "none";

  return (
    <div className="relative inline-flex items-center justify-center" aria-label={label ?? "Progress ring"} role="img">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={geometry.radius}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={center}
          cy={center}
          r={geometry.radius}
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={geometry.circumference}
          strokeDashoffset={geometry.strokeDashoffset}
          style={{ transition, transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold text-foreground">{Math.round(geometry.normalizedProgress)}%</div>
        {label ? <div className="text-xs text-muted-foreground">{label}</div> : null}
      </div>
    </div>
  );
}
