import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

/**
 * A simple back button that navigates to the previous page or a fallback path
 */
const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = '/',
  className = ''
}) => {
  const [, navigate] = useLocation();

  const handleBack = () => {
    // Try to go back in history if possible
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, navigate to the fallback path
      navigate(fallbackPath);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleBack}
        className={`flex items-center justify-center w-8 h-8 bg-[#e0e0e0] dark:bg-[#333333] border border-gray-400 dark:border-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded-md ${className}`}
        aria-label="Go back"
        title="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BackButton;
