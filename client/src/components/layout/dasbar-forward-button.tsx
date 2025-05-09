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
    >
      <div className="flex items-center justify-center relative">
        <ArrowRight className="h-5 w-5" />
        <div className="logo-container h-3 w-3 absolute" style={{ transform: 'translateX(-8px)' }}>
          <DasWosHeaderLogo size={12} />
        </div>
      </div>
      <span>Forward</span>
    </button>
  );
};

export default DasbarForwardButton;
