import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * Displays a product's trust score using appropriate colors and icons
 */
const TrustScore: React.FC<TrustScoreProps> = ({
  score,
  size = 'md',
  showText = true,
  className = '',
}) => {
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3 mr-0.5',
    md: 'h-4 w-4 mr-1',
    lg: 'h-5 w-5 mr-1.5',
  };

  // Determine color based on score
  let variant: 'outline' | 'destructive' | 'default';
  let icon;
  let textColor = '';

  if (score >= 85) {
    variant = 'default';
    icon = <ShieldCheck className={iconSizes[size]} />;
    textColor = 'text-green-50';
  } else if (score >= 70) {
    variant = 'outline';
    icon = <Shield className={iconSizes[size]} />;
    textColor = 'text-amber-700';
  } else {
    variant = 'destructive';
    icon = <ShieldAlert className={iconSizes[size]} />;
  }

  return (
    <Badge 
      variant={variant} 
      className={`${sizeClasses[size]} flex items-center ${textColor} ${className}`}
    >
      {icon}
      {showText && <span>{score}</span>}
    </Badge>
  );
};

export default TrustScore;