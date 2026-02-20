import PricingCard from "@/components/PricingCard";
import { STRIPE_PRODUCTS } from "@/hooks/useSubscription";

const pricingPlans = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Perfect for trying out Sport Streak Academy",
    features: [
      { text: "3 free drills per sport", included: true },
      { text: "1 drill per day for streak", included: true },
      { text: "Join Bronze league", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "All 12 sports access", included: false },
      { text: "Unlimited drills", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Priority support", included: false },
    ],
    ctaText: "Get Started Free",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "£19.99",
    period: "month",
    description: "Unlock everything for all sports",
    features: [
      { text: "All 500+ drills unlocked", included: true },
      { text: "All 12 sports access", included: true },
      { text: "Unlimited daily drills", included: true },
      { text: "All league tiers", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Personalized training plans", included: true },
      { text: "2-player drill guides", included: true },
      { text: "Priority support", included: true },
    ],
    ctaText: "Start Pro Trial",
    isPopular: true,
    priceId: STRIPE_PRODUCTS.pro.price_id,
  },
  {
    name: "Single Sport",
    price: "£9.99",
    period: "month",
    description: "Master one sport at a time",
    features: [
      { text: "All drills for 1 sport", included: true },
      { text: "Unlimited daily drills", included: true },
      { text: "All league tiers", included: true },
      { text: "Sport-specific analytics", included: true },
      { text: "Training plan for chosen sport", included: true },
      { text: "Other sports access", included: false },
      { text: "Cross-sport analytics", included: false },
      { text: "Priority support", included: false },
    ],
    ctaText: "Choose Your Sport",
    isPopular: false,
    priceId: STRIPE_PRODUCTS.single_sport.price_id,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Simple, Flexible Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready. Cancel anytime - no strings attached!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PricingCard {...plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;