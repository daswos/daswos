import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useLocation } from 'wouter';

export function useSubscriptionUpgrade() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscriptionMutation } = useAuth();
  const { settings } = useAdminSettings();
  const [, navigate] = useLocation();

  const upgradeToUnlimited = async () => {
    setIsUpgrading(true);

    // Check if in dev mode
    if (settings.subscriptionDevMode) {
      toast({
        title: "Development Mode",
        description: "Subscription upgraded to Unlimited (Development Mode)",
        variant: "default",
      });

      // Refresh subscription data
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      setIsUpgrading(false);
      return true;
    }

    try {
      // Instead of trying to update the subscription directly,
      // redirect to the subscription page with the Stripe payment form
      toast({
        title: "Redirecting",
        description: "Taking you to the payment page for Daswos Unlimited...",
        variant: "default"
      });

      // Redirect to the subscription page with the Unlimited plan pre-selected
      navigate('/safesphere-subscription?selectedPlan=unlimited&billingCycle=monthly&showPayment=true');

      setIsUpgrading(false);
      return true;
    } catch (error) {
      console.error("Error redirecting to payment page:", error);

      toast({
        title: "Navigation Failed",
        description: "There was an error redirecting to the payment page. Please try again.",
        variant: "destructive"
      });

      setIsUpgrading(false);
      return false;
    }
  };

  return {
    isUpgrading,
    upgradeToUnlimited
  };
}
