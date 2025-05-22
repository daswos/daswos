import React, { useState } from 'react';
import { ShoppingCart, Loader2, Coins, Settings } from 'lucide-react';
import { Label } from "@/components/ui/label";
import AutoShopSettingsDialog from './autoshop-settings-dialog-new';
import { useToast } from '@/hooks/use-toast';
import { useAutoShop } from '@/contexts/autoshop-context';
import { useAutoShop as useGlobalAutoShop } from '@/contexts/global-autoshop-context';
import { useLocation } from 'wouter';

interface AutoShopToggleProps {
  className?: string;
}

const AutoShopToggle: React.FC<AutoShopToggleProps> = ({
  className = ''
}) => {
  const { toast } = useToast();
  const { isAutoShopEnabled, enableAutoShop, disableAutoShop, userCoins, settings } = useAutoShop();
  const { isAutoShopActive, pendingItems, startAutoShop, stopAutoShop } = useGlobalAutoShop();
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Use the global context's active state if available, otherwise fall back to the local context
  const isActive = isAutoShopActive || isAutoShopEnabled;
  const totalItems = pendingItems?.length || 0;

  // Animated text effect for status message
  React.useEffect(() => {
    if (isActive) {
      // Reset the text
      setStatusText('');

      // Animate the text letter by letter
      const fullText = 'Active';
      const letters = fullText.split('');
      let currentText = '';

      const animateText = (index: number) => {
        if (index < letters.length) {
          currentText += letters[index];
          setStatusText(currentText);

          // Schedule the next letter animation
          setTimeout(() => animateText(index + 1), 150);
        }
      };

      // Start the animation with a small delay
      const animationTimeout = setTimeout(() => animateText(0), 300);

      // Clear timeout on cleanup
      return () => clearTimeout(animationTimeout);
    } else {
      // Clear the text when AutoShop is turned off
      setStatusText('');
    }
  }, [isActive]);

  // Handle checkbox click - open settings dialog if not enabled
  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    if (checked) {
      // When trying to enable, show settings dialog first
      e.preventDefault(); // Prevent checkbox from being checked
      setSettingsDialogOpen(true);
    } else {
      // When disabling, just turn it off
      handleAutoShopToggle(false);
    }
  };

  // Handle settings save and enable AutoShop
  const handleSettingsSave = async (newSettings: typeof settings) => {
    if (!newSettings) return;

    setIsLoading(true);
    setSettingsDialogOpen(false);

    try {
      // First update the local context settings
      enableAutoShop(newSettings);

      // Then start the global AutoShop
      await startAutoShop();

      // Navigate to the dashboard
      setLocation('/autoshop-dashboard');
    } catch (error) {
      console.error('Error starting AutoShop:', error);
      toast({
        title: 'Error',
        description: 'Failed to start AutoShop. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disabling AutoShop
  const handleAutoShopToggle = async (checked: boolean) => {
    if (checked) return; // Should never happen, as enabling is handled by settings dialog

    setIsLoading(true);

    try {
      // Stop the global AutoShop
      await stopAutoShop();

      // Then update the local context
      disableAutoShop();
    } catch (error) {
      console.error('Error stopping AutoShop:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop AutoShop. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1">
        <input
          type="checkbox"
          id="autoshop-mode"
          checked={isActive}
          onChange={handleCheckboxClick}
          className="mr-2 h-4 w-4"
          disabled={isLoading}
        />
        <Label htmlFor="autoshop-mode" className="flex items-center cursor-pointer text-sm">
          <ShoppingCart className="h-4 w-4 mr-2 text-black dark:text-white" />
          <div className="flex items-center">
            <span className="font-normal text-black dark:text-white">
              {isLoading ? 'Processing...' : 'AutoShop'}
            </span>
            {isActive && (
              <>
                <span className="ml-2 text-green-600 font-medium text-xs animated-text">
                  {statusText}
                </span>
                {totalItems > 0 && (
                  <div
                    className="ml-2 flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[10px] rounded px-1.5 py-0.5 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Navigate to AutoShop dashboard with items view
                      setLocation('/autoshop-dashboard?tab=pending');
                    }}
                    title="View AutoShop items"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </Label>

        {!isActive && (
          <button
            onClick={() => setSettingsDialogOpen(true)}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="AutoShop Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Navigate to DasWos coins section
            setLocation('/daswos-coins');
          }}
          title="Go to DasWos Coins"
        >
          <Coins className="h-3 w-3" />
          <span>{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Settings Dialog */}
      <AutoShopSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        onSave={handleSettingsSave}
        userCoins={userCoins}
      />
    </div>
  );
};

export default AutoShopToggle;
