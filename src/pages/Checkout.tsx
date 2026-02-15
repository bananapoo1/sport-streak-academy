import { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Crown, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    if (success) {
      // Refresh subscription status after successful payment
      checkSubscription();
    }
  }, [success, checkSubscription]);

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 md:pt-24 md:pb-16">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="bg-card border-2 border-success rounded-3xl p-8 shadow-card">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h1 className="text-3xl font-extrabold text-foreground mb-4">
                Welcome to DrillZone Pro!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your subscription is now active. You have access to all premium features!
              </p>
              <div className="space-y-3">
                <Link to="/sports">
                  <Button variant="hero" size="lg" className="w-full">
                    <Crown className="w-5 h-5" />
                    Start Training
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="lg" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 md:pt-24 md:pb-16">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-card">
              <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-extrabold text-foreground mb-4">
                Checkout Canceled
              </h1>
              <p className="text-muted-foreground mb-6">
                No worries! Your checkout was canceled and you haven't been charged.
                You can try again whenever you're ready.
              </p>
              <div className="space-y-3">
                <Link to="/#pricing">
                  <Button variant="hero" size="lg" className="w-full">
                    View Plans
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Default: redirect to pricing
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-card">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Redirecting...
            </h1>
            <p className="text-muted-foreground mb-6">
              Please choose a plan from our pricing page.
            </p>
            <Link to="/#pricing">
              <Button variant="hero" size="lg" className="w-full">
                <ArrowLeft className="w-5 h-5" />
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;