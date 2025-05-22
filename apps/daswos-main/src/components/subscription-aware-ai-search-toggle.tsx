import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import AiSearchToggle from './ai-search-toggle';
import { Bot, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscriptionUpgrade } from '@/hooks/use-subscription-upgrade';

interface SubscriptionAwareAiSearchToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
  showDropdown?: boolean;
  onDropdownToggle?: () => void;
}

const SubscriptionAwareAiSearchToggle: React.FC<SubscriptionAwareAiSearchToggleProps> = ({
  isEnabled,
  onToggle,
  className = '',
  showDropdown = false,
  onDropdownToggle = () => {}
}) => {
  const { subscriptionDetails, hasSubscription } = useAuth();
  const { settings, loading } = useAdminSettings();
  const [, navigate] = useLocation();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { isUpgrading, upgradeToUnlimited } = useSubscriptionUpgrade();

  // If settings are still loading, don't render anything
  if (loading) {
    return null;
  }

  // If Daswos AI is disabled in admin settings, don't render the toggle
  if (!settings.aiShopperEnabled) {
    return null;
  }

  // Check if user has access to Daswos AI
  const hasDaswosAiAccess =
    // Admin settings override
    settings.paidFeaturesDisabled ||
    settings.subscriptionDevMode ||
    // Or user has Unlimited subscription
    (hasSubscription && subscriptionDetails?.type === 'unlimited');

  // If user doesn't have access, show locked version
  if (!hasDaswosAiAccess) {
    return (
      <>
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex items-center bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1 opacity-70">
            <input
              type="checkbox"
              id="daswos-ai-mode-locked"
              checked={false}
              onChange={() => setShowSubscriptionDialog(true)}
              className="mr-2 h-4 w-4"
              aria-label="Toggle Daswos AI (Locked)"
            />
            <Label htmlFor="daswos-ai-mode-locked" className="flex items-center cursor-pointer text-sm">
              <Lock className="h-4 w-4 mr-1 text-gray-400" />
              <Bot className="h-4 w-4 mr-2 text-black dark:text-white" />
              <div className="flex items-center whitespace-nowrap">
                <span className="font-normal text-black dark:text-white">
                  Daswos AI
                </span>
                <span className="text-xs ml-2 text-gray-500">(Unlimited only)</span>
              </div>
            </Label>
          </div>
        </div>

        {/* Subscription Required Dialog */}
        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Subscription Required
              </DialogTitle>
              <DialogDescription>
                Daswos AI requires an Unlimited subscription. Would you like to upgrade?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Daswos AI provides advanced AI-powered shopping assistance and personalized recommendations.
                This premium feature is only available with the Unlimited subscription plan.
              </p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Unlimited Subscription Benefits:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access to Daswos AI assistant</li>
                  <li>AutoShop integration</li>
                  <li>Family account support (up to 5 accounts)</li>
                  <li>Control of umbrella accounts' SafeSphere and SuperSafe settings</li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setShowSubscriptionDialog(false)}
                disabled={isUpgrading}
              >
                Stay Limited
              </Button>
              <Button
                onClick={async () => {
                  const success = await upgradeToUnlimited();
                  if (success) {
                    setShowSubscriptionDialog(false);
                  }
                }}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Go Unlimited"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Otherwise, render the normal AiSearchToggle
  return (
    <AiSearchToggle
      isEnabled={isEnabled}
      onToggle={onToggle}
      className={className}
      showDropdown={showDropdown}
      onDropdownToggle={onDropdownToggle}
    />
  );
};

export default SubscriptionAwareAiSearchToggle;
