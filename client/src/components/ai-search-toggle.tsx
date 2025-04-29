import React, { useState, useEffect } from 'react';
import { Check, Bot } from 'lucide-react';
import { Label } from "@/components/ui/label";

interface AiSearchToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const AiSearchToggle: React.FC<AiSearchToggleProps> = ({
  isEnabled,
  onToggle,
  className = ''
}) => {
  const [statusText, setStatusText] = useState('');

  // Animated text effect for status message
  useEffect(() => {
    if (isEnabled) {
      // Reset the text
      setStatusText('');

      // Animate the text letter by letter
      const fullText = 'Enabled';
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
      // Clear the text when AI Search is turned off
      setStatusText('');
    }
  }, [isEnabled]);

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center bg-white dark:bg-[#333333] border border-gray-300 dark:border-gray-600 px-3 py-1">
        <input
          type="checkbox"
          id="daswos-ai-mode"
          checked={isEnabled}
          onChange={e => onToggle(e.target.checked)}
          className="mr-2 h-4 w-4"
          aria-label="Toggle Daswos AI"
        />
        <Label htmlFor="daswos-ai-mode" className="flex items-center cursor-pointer text-sm">
          <Check className={`h-4 w-4 mr-1 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
          <Bot className="h-4 w-4 mr-2 text-black dark:text-white" />
          <div className="flex items-center">
            <span className="font-normal text-black dark:text-white">
              Daswos AI
            </span>
            {isEnabled && (
              <span className="ml-2 text-green-600 font-medium text-xs animated-text">
                {statusText}
              </span>
            )}
          </div>
        </Label>
      </div>
    </div>
  );
};

export default AiSearchToggle;
