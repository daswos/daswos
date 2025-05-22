import React, { useState, useEffect } from 'react';

interface AnimatedStatusTextProps {
  text: string;
  color: string;
  active: boolean;
}

const AnimatedStatusText: React.FC<AnimatedStatusTextProps> = ({ text, color, active }) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (active) {
      setIsAnimating(true);
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 50); // Speed of animation

      return () => clearInterval(interval);
    } else {
      setDisplayText('');
    }
  }, [active, text]);

  if (!active && !isAnimating) return null;

  return (
    <span 
      className={`ml-2 px-2 py-0.5 text-xs rounded-sm font-medium`}
      style={{ backgroundColor: `${color}10`, color: color }}
    >
      {displayText}
    </span>
  );
};

export default AnimatedStatusText;
