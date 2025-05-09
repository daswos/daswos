import React, { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';

/**
 * A component that shows a tooltip informing users about the backspace navigation feature.
 * The tooltip is shown only once per session and disappears after a few seconds.
 */
const BackspaceTip: React.FC = () => {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    // Check if we've already shown the tip in this session
    const tipShown = sessionStorage.getItem('backspace-tip-shown');
    
    if (!tipShown) {
      // Show the tip after a short delay
      const showTimer = setTimeout(() => {
        setShowTip(true);
        
        // Hide the tip after 5 seconds
        const hideTimer = setTimeout(() => {
          setShowTip(false);
          // Mark the tip as shown for this session
          sessionStorage.setItem('backspace-tip-shown', 'true');
        }, 5000);
        
        return () => clearTimeout(hideTimer);
      }, 2000);
      
      return () => clearTimeout(showTimer);
    }
  }, []);

  if (!showTip) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center max-w-xs text-sm">
      <Delete className="h-4 w-4 mr-2 flex-shrink-0" />
      <span>Press <strong>Backspace</strong> to go back to the previous page</span>
    </div>
  );
};

export default BackspaceTip;
