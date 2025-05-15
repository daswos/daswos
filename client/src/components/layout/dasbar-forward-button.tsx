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
