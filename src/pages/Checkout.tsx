import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Lock, Check, Crown } from "lucide-react";
import { toast } from "sonner";

const plans = {
  pro: {
    name: "Pro",
    price: "£9.99",
    period: "month",
    features: [
      "All 500+ drills unlocked",
      "All 12 sports access",
      "Unlimited daily drills",
      "All league tiers",
      "Advanced analytics",
      "Priority support",
    ],
  },
  "single-sport": {
    name: "Single Sport",
    price: "£4.99",
    period: "month",
    features: [
      "All drills for 1 sport",
      "Unlimited daily drills",
      "All league tiers",
      "Sport-specific analytics",
    ],
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get("plan") || "pro";
  const plan = plans[planType as keyof typeof plans] || plans.pro;

  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Payment processing...", {
      description: "This is a demo. In a real app, this would process your payment.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/#pricing" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="order-2 md:order-1">
              <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
                </div>

                <div className="border-b border-border pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-foreground">{plan.name} Plan</span>
                    <span className="text-2xl font-extrabold text-foreground">{plan.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{plan.price}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-2">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-xl font-extrabold text-foreground">{plan.price}/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground justify-center">
                <Lock className="w-4 h-4" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="order-1 md:order-2">
              <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-card">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Name on Card</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        name="cvc"
                        type="text"
                        placeholder="123"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="xl" className="w-full mt-6">
                    <Lock className="w-4 h-4" />
                    Start 7-Day Free Trial
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By subscribing, you agree to our Terms of Service and Privacy Policy. 
                    You can cancel anytime from your account settings.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
