import React, { useState } from 'react';
import { ShoppingCart, Loader2, Coins, Settings } from 'lucide-react';
import { Label } from "@/components/ui/label";
import AutoShopSettingsDialog from './autoshop-settings-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAutoShop } from '@/contexts/autoshop-context';

interface AutoShopToggleProps {
  className?: string;
}

const AutoShopToggle: React.FC<AutoShopToggleProps> = ({
  className = ''
}) => {
  const { toast } = useToast();
  const { isAutoShopEnabled, enableAutoShop, disableAutoShop, userCoins, settings } = useAutoShop();
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Animated text effect for status message
  React.useEffect(() => {
    if (isAutoShopEnabled) {
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
  }, [isAutoShopEnabled]);

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
  const handleSettingsSave = (newSettings: typeof settings) => {
    if (!newSettings) return;

    setIsLoading(true);
    setSettingsDialogOpen(false);

    // Simulate API call to enable AutoShop with settings
    setTimeout(() => {
      enableAutoShop(newSettings);

      // Removed toast notification for activation

      setIsLoading(false);
    }, 1000);
  };

  // Handle disabling AutoShop
  const handleAutoShopToggle = (checked: boolean) => {
    if (checked) return; // Should never happen, as enabling is handled by settings dialog

    setIsLoading(true);

    // Simulate API call to disable AutoShop
    setTimeout(() => {
      disableAutoShop();

      // Removed toast notification for deactivation

      setIsLoading(false);
    }, 500);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1">
        <input
          type="checkbox"
          id="autoshop-mode"
          checked={isAutoShopEnabled}
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
            {isAutoShopEnabled && (
              <span className="ml-2 text-green-600 font-medium text-xs animated-text">
                {statusText}
              </span>
            )}
          </div>
        </Label>

        {!isAutoShopEnabled && (
          <button
            onClick={() => setSettingsDialogOpen(true)}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="AutoShop Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
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
