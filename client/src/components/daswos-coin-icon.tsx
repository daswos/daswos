import React from 'react';

interface DasWosCoinIconProps {
  className?: string;
  size?: number;
}

export const DasWosCoinIcon: React.FC<DasWosCoinIconProps> = ({ 
  className = "", 
  size = 16 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Base coin circle */}
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      
      {/* D Symbol */}
      <path 
        d="M8 6.5h4.5c2.5 0 4 2 4 5s-1.5 5-4 5H8V6.5z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
      />
      
      {/* Vertical line */}
      <line 
        x1="12" 
        y1="4" 
        x2="12" 
        y2="20" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
    </svg>
  );
};