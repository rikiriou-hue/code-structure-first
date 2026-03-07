import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PREMIUM_PRODUCT_ID = "prod_U6UUJWrZ3R2uHc";
export const PREMIUM_PRICE_ID = "price_1T8HVXCjYsJkyL6vXBK2YN69";

interface SubscriptionState {
  isLoading: boolean;
  isPremium: boolean;
  subscriptionEnd: string | null;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isPremium: false,
    subscriptionEnd: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setState({ isLoading: false, isPremium: false, subscriptionEnd: null });
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setState({
        isLoading: false,
        isPremium: data?.subscribed === true,
        subscriptionEnd: data?.subscription_end || null,
      });
    } catch {
      setState({ isLoading: false, isPremium: false, subscriptionEnd: null });
    }
  }, []);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const checkout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PREMIUM_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("Portal error:", err);
    }
  };

  return { ...state, checkout, manageSubscription, refresh: checkSubscription };
};
