import React from 'react';
import { Bot } from 'lucide-react';

interface AutoShopIconProps {
  className?: string;
  size?: number;
}

const AutoShopIcon: React.FC<AutoShopIconProps> = ({ className, size = 24 }) => {
  return (
    <div className={`relative ${className}`}>
      <Bot size={size} />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
    </div>
  );
};

export default AutoShopIcon;
