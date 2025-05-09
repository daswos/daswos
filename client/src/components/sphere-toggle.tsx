import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, AlertTriangleIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

interface SphereToggleProps {
  activeSphere: 'safesphere' | 'opensphere';
  onChange: (sphere: 'safesphere' | 'opensphere') => void;
  className?: string;
}

const SphereToggle: React.FC<SphereToggleProps> = ({
  activeSphere,
  onChange,
  className = ''
}) => {
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [protectedText, setProtectedText] = useState('');
  const isSafeSphere = activeSphere === 'safesphere';
  const protectedFullText = 'Protected';

  // Animated text effect for "Protected" message
  useEffect(() => {
    if (isSafeSphere) {
      // Reset the text
      setProtectedText('');

      // Animate the text letter by letter
      const letters = protectedFullText.split('');
      let currentText = '';

      const animateText = (index: number) => {
        if (index < letters.length) {
          currentText += letters[index];
          setProtectedText(currentText);

          // Schedule the next letter animation
          setTimeout(() => animateText(index + 1), 150);
        }
      };

      // Start the animation with a small delay
      const animationTimeout = setTimeout(() => animateText(0), 300);

      // Clear timeout on cleanup
      return () => clearTimeout(animationTimeout);
    } else {
      // Clear the text when SafeSphere is turned off
      setProtectedText('');
    }
  }, [isSafeSphere]);

  const handleSphereToggle = (checked: boolean) => {
    // If turning off SafeSphere, show confirmation dialog
    if (!checked && isSafeSphere) {
      setAlertDialogOpen(true);
      return;
    }

    // If enabling SafeSphere or confirmation not needed, apply directly
    onChange(checked ? 'safesphere' : 'opensphere');
  };

  const handleConfirmSphereChange = () => {
    onChange('opensphere');
    setAlertDialogOpen(false);
  };

  const handleCancelSphereChange = () => {
    setAlertDialogOpen(false);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1 SafeSphere-active-indicator">
        <input
          type="checkbox"
          id="sphere-mode"
          checked={isSafeSphere}
          onChange={e => handleSphereToggle(e.target.checked)}
          className="mr-2 h-4 w-4"
        />
        <Label htmlFor="sphere-mode" className="flex items-center cursor-pointer text-sm">
          <ShieldCheckIcon className="h-4 w-4 mr-2 text-black dark:text-white" />
          <div className="flex items-center whitespace-nowrap">
            <span className="font-normal text-black dark:text-white">
              SafeSphere
            </span>
            {isSafeSphere && (
              <span className="ml-2 text-green-600 font-medium text-xs animated-text">
                {protectedText}
              </span>
            )}
          </div>
        </Label>

        {/* Confirmation dialog for disabling SafeSphere */}
        <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-[#222222] border border-gray-300 dark:border-gray-600 rounded-none shadow-md p-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black dark:text-white">Disable SafeSphere?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
                You are about to turn off SafeSphere protection. This means you will see unverified listings
                and sellers, which may include fraudulent or lower quality offerings.
                Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleCancelSphereChange}
                className="bg-gray-200 dark:bg-[#333333] border border-gray-400 dark:border-gray-600 rounded-none text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Keep SafeSphere On
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmSphereChange}
                className="bg-gray-200 dark:bg-[#333333] border border-gray-400 dark:border-gray-600 rounded-none text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Turn Off SafeSphere
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SphereToggle;
