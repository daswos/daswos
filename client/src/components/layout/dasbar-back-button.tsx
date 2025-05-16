import React from 'react';
import { ArrowLeft } from 'lucide-react';
import DasWosHeaderLogo from '@/components/daswos-header-logo';

interface DasbarBackButtonProps {
  className?: string;
}

/**
 * A back button for the dasbar that incorporates the DasWos logo
 * Design is based on a circular black button with a white arrow and DasWos logo
 */
const DasbarBackButton: React.FC<DasbarBackButtonProps> = ({
  className = ''
}) => {
  const handleBack = () => {
    // Try to go back in history if possible
    if (window.history.length > 1) {
      window.history.back();

      // Also dispatch a custom event to reset search interface if we're going back to home
      // This helps ensure the search interface is properly reset
      setTimeout(() => {
        // Check if we're on the home page after navigation
        if (window.location.pathname === '/' || window.location.pathname === '') {
          const resetEvent = new CustomEvent('resetSearchInterface', {
            detail: { reset: true }
          });
          window.dispatchEvent(resetEvent);
        }
      }, 100);
    } else {
      // If no history, do nothing (user is likely already at home)
      console.log('No history to go back to');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`nav-button back-button ${className}`}
      aria-label="Go back"
      title="Back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
};

export default DasbarBackButton;
