import { Check, X, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, STRIPE_PRODUCTS } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  isPopular?: boolean;
  ctaText: string;
  priceId?: string;
}

export const PricingCard = ({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  ctaText,
  priceId,
}: PricingCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, productId, createCheckout } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentPlan = 
    (name === "Pro" && productId === STRIPE_PRODUCTS.pro.product_id) ||
    (name === "Single Sport" && productId === STRIPE_PRODUCTS.single_sport.product_id);

  const handleClick = async () => {
    if (name === "Free") {
      navigate("/sports");
      return;
    }

    if (!user) {
      toast.info("Please sign in first to subscribe");
      navigate("/auth");
      return;
    }

    if (isCurrentPlan) {
      toast.info("You're already subscribed to this plan");
      return;
    }

    if (!priceId) {
      toast.error("Price not configured");
      return;
    }

    setIsLoading(true);
    try {
      await createCheckout(priceId);
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-full">
          Your Plan
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

      <Button 
        variant={isPopular ? "hero" : "outline"} 
        size="lg" 
        className="w-full"
        onClick={handleClick}
        disabled={isLoading || isCurrentPlan}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading...
          </>
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : (
          ctaText
        )}
      </Button>
    </div>
  );
};

export default PricingCard;