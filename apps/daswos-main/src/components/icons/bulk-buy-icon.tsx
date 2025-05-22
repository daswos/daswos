import React from 'react';

interface BulkBuyIconProps {
  className?: string;
}

const BulkBuyIcon: React.FC<BulkBuyIconProps> = ({ className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Base - Stacked boxes */}
      <rect x="2" y="13" width="7" height="7" rx="1" />
      <rect x="8" y="9" width="7" height="7" rx="1" />
      <rect x="14" y="5" width="7" height="7" rx="1" />

      {/* Connecting lines to show stacking */}
      <line x1="9" y1="9" x2="4" y2="13" />
      <line x1="15" y1="5" x2="10" y2="9" />

      {/* Quantity indicator */}
      <circle cx="5.5" cy="16.5" r="1" fill="currentColor" />
      <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="8.5" r="1" fill="currentColor" />
    </svg>
  );
};

export default BulkBuyIcon;
