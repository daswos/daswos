import React from 'react';
import DasWosCoinIcon from './daswos-coin-icon';

interface DasWosCoinDisplayProps {
  coinBalance: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DasWosCoinDisplay: React.FC<DasWosCoinDisplayProps> = ({ 
  coinBalance, 
  size = 'md',
  className = '' 
}) => {
  // Determine icon and text size based on the size prop
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };
  
  const getTextClass = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };
  
  const containerClass = `flex items-center ${className}`;
  const textClass = `font-medium ${getTextClass()} ml-1`;
  
  return (
    <div className={containerClass}>
      <DasWosCoinIcon size={getIconSize()} />
      <span className={textClass}>{coinBalance.toLocaleString()}</span>
    </div>
  );
};

export default DasWosCoinDisplay;
