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

  // Set the protected text immediately without animation
  useEffect(() => {
    if (isSafeSphere) {
      setProtectedText(protectedFullText);
    } else {
      setProtectedText('');
    }
  }, [isSafeSphere, protectedFullText]);

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
      <div
        className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1.5 ${isSafeSphere ? 'w-[185px]' : 'w-[135px]'} cursor-pointer transition-all duration-200`}
        onClick={() => handleSphereToggle(!isSafeSphere)}
      >
        {/* Square checkbox */}
        <div className="w-5 h-5 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
          {isSafeSphere && (
            <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          )}
        </div>

        {/* Shield icon */}
        <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300 flex-shrink-0" />

        {/* Text */}
        <span className="text-gray-900 dark:text-gray-100 font-medium text-sm flex-shrink-0 whitespace-nowrap w-[80px]">SafeSphere</span>

        {/* Status label - only shown when active */}
        {isSafeSphere && (
          <span className="ml-auto text-green-500 text-[9px] font-medium w-[65px] text-right pr-2">Protected</span>
        )}

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
