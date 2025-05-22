import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BrainCircuit, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionUpgrade } from '@/hooks/use-subscription-upgrade';

export function SubscriptionAwareDaswosAiButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { subscriptionDetails, hasSubscription } = useAuth();
  const { settings } = useAdminSettings();
  const [, navigate] = useLocation();
  const { isUpgrading, upgradeToUnlimited } = useSubscriptionUpgrade();

  // Check if user has access to Daswos AI
  const hasDaswosAiAccess =
    // Admin settings override
    settings.paidFeaturesDisabled ||
    settings.subscriptionDevMode ||
    // Or user has Unlimited subscription
    (hasSubscription && subscriptionDetails?.type === 'unlimited');

  // If user doesn't have access, show upgrade button with dialog
  if (!hasDaswosAiAccess) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative opacity-70"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setShowSubscriptionDialog(true)}
              >
                <BrainCircuit className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[250px]">
              <p className="font-medium">Daswos AI Assistant</p>
              <p className="text-xs mt-1">Subscribe to Daswos Unlimited to access this feature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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

  // User has access, show normal button
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/daswos-ai">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <BrainCircuit className="h-5 w-5" />
              {isHovered && (
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 -top-1 -right-1"></span>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">Daswos AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
