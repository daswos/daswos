import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useSuperSafe } from '@/contexts/super-safe-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SuperSafeToggleProps {
  className?: string;
}

const SuperSafeToggle: React.FC<SuperSafeToggleProps> = ({
  className = ''
}) => {
  const { isSuperSafeEnabled, toggleSuperSafe } = useSuperSafe();
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Animated text effect for "Active" message
  useEffect(() => {
    if (isSuperSafeEnabled) {
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
      // Clear the text when SuperSafe is turned off
      setStatusText('');
    }
  }, [isSuperSafeEnabled]);

  const handleSuperSafeToggle = (checked: boolean) => {
    // If turning off SuperSafe, show confirmation dialog
    if (!checked && isSuperSafeEnabled) {
      setAlertDialogOpen(true);
      return;
    }

    // If enabling SuperSafe or confirmation not needed, apply directly
    toggleSuperSafe(checked);
  };

  const handleConfirmToggle = () => {
    toggleSuperSafe(false);
    setAlertDialogOpen(false);
  };

  const handleCancelToggle = () => {
    setAlertDialogOpen(false);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1">
        <input
          type="checkbox"
          id="super-safe-mode"
          checked={isSuperSafeEnabled}
          onChange={e => handleSuperSafeToggle(e.target.checked)}
          className="mr-2 h-4 w-4"
        />
        <Label htmlFor="super-safe-mode" className="flex items-center cursor-pointer text-sm">
          <ShieldCheck className="h-4 w-4 mr-2 text-black dark:text-white" />
          <div className="flex items-center whitespace-nowrap">
            <span className="font-normal text-black dark:text-white">
              SuperSafe
            </span>
            {isSuperSafeEnabled && (
              <span className="ml-2 text-green-600 font-medium text-xs animated-text">
                {statusText}
              </span>
            )}
          </div>
        </Label>

        {/* Confirmation dialog for disabling SuperSafe */}
        <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-[#222222] border border-gray-300 dark:border-gray-600 rounded-none shadow-md p-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black dark:text-white">Disable SuperSafe?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                You are about to turn off SuperSafe protection. This means you will lose additional
                safety features like blocking adult content and gambling sites.
                Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleCancelToggle}
                className="bg-gray-200 dark:bg-[#333333] border border-gray-400 dark:border-gray-600 rounded-none text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Keep SuperSafe On
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggle}
                className="bg-gray-200 dark:bg-[#333333] border border-gray-400 dark:border-gray-600 rounded-none text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Turn Off SuperSafe
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SuperSafeToggle;
