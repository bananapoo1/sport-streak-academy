import { Link } from "react-router-dom";
import { Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  isPopular?: boolean;
  ctaText: string;
  variant?: "default" | "popular";
}

export const PricingCard = ({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  ctaText,
  variant = "default",
}: PricingCardProps) => {
  return (
    <div
      className={`relative flex flex-col p-6 rounded-3xl transition-all duration-300 ${
        isPopular
          ? "bg-card border-2 border-primary shadow-card scale-105"
          : "bg-card border-2 border-border shadow-soft hover:shadow-card"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full flex items-center gap-1">
          <Crown className="w-4 h-4" />
          Most Popular
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground">{name}</h3>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-foreground">{price}</span>
        <span className="text-muted-foreground">/{period}</span>
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            {feature.included ? (
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm ${
                feature.included ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Link to={name === "Free" ? "/sports" : `/checkout?plan=${name.toLowerCase().replace(" ", "-")}`}>
        <Button variant={isPopular ? "hero" : "outline"} size="lg" className="w-full">
          {ctaText}
        </Button>
      </Link>
    </div>
  );
};

export default PricingCard;
