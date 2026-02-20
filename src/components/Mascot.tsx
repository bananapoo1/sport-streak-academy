import mascotImage from "@/assets/mascot-panda.png";

interface MascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export const Mascot = ({ size = "md", animate = true, className = "" }: MascotProps) => {
  return (
    <div className={`${sizeClasses[size]} ${animate ? "animate-float" : ""} ${className}`}>
      <img
        src={mascotImage}
        alt="Rally the Red Panda - Sport Streak Academy mascot"
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
};

export default Mascot;
