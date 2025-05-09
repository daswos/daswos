import React from 'react';

interface SplitBuyIconProps {
  className?: string;
}

const SplitBuyIcon: React.FC<SplitBuyIconProps> = ({ className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      style={{ transform: 'translate(0, 2px)' }}
    >
      {/* Exact Y shape with arrows from image */}
      <path d="M12 8L12 20" />
      <path d="M12 8L4 0" />
      <path d="M12 8L20 0" />
      <path d="M2 2L4 0L6 2" />
      <path d="M18 2L20 0L22 2" />
    </svg>
  );
};

export default SplitBuyIcon;
