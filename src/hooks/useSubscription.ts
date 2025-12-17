import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Stripe product and price IDs
export const STRIPE_PRODUCTS = {
  pro: {
    product_id: "prod_TceBkBKC06XWa5",
    price_id: "price_1SfOtEHuDkJH2JuHnV7SnZu8",
  },
  single_sport: {
    product_id: "prod_TceB4Fh694z0iv",
    price_id: "price_1SfOtLHuDkJH2JuHcHl4JkOs",
  },
};

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setSubscription(prev => ({ ...prev, subscribed: false, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      setSubscription({
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        priceId: data.price_id || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, [user, session]);

  const createCheckout = async (priceId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
        headers,
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      throw error;
    }
  };

  const isPro = subscription.productId === STRIPE_PRODUCTS.pro.product_id;
  const isSingleSport = subscription.productId === STRIPE_PRODUCTS.single_sport.product_id;

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription status periodically
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    ...subscription,
    isPro,
    isSingleSport,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};