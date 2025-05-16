import React from 'react';
import { ArrowRight } from 'lucide-react';
import DasWosHeaderLogo from '@/components/daswos-header-logo';

interface DasbarForwardButtonProps {
  className?: string;
}

/**
 * A forward button for the dasbar that incorporates the DasWos logo
 * Design is based on a circular button with a white arrow and DasWos logo
 */
const DasbarForwardButton: React.FC<DasbarForwardButtonProps> = ({
  className = ''
}) => {
  const handleForward = () => {
    // Try to go forward in history if possible
    window.history.forward();

    // Also dispatch a custom event to reset search interface if we're going to home
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
  };

  return (
    <button
      onClick={handleForward}
      className={`nav-button forward-button ${className}`}
      aria-label="Go forward"
      title="Forward"
    >
      <ArrowRight className="h-5 w-5" />
    </button>
  );
};

export default DasbarForwardButton;
