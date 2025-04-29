import React from 'react';

interface DasWosCoinIconProps {
  className?: string;
}

/**
 * Custom icon for DasWos Coins
 */
const DasWosCoinIcon: React.FC<DasWosCoinIconProps> = ({ className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <path d="M10 8 A 1 1 0 0 1 14 8" />
    </svg>
  );
};

export default DasWosCoinIcon;