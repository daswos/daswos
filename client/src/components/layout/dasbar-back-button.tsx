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
    >
      <div className="flex items-center justify-center relative">
        <ArrowLeft className="h-5 w-5" />
        <div className="logo-container h-3 w-3 absolute" style={{ transform: 'translateX(8px)' }}>
          <DasWosHeaderLogo size={12} />
        </div>
      </div>
      <span>Back</span>
    </button>
  );
};

export default DasbarBackButton;
