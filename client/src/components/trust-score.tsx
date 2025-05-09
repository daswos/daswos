import React from 'react';
import { getTrustScoreColor } from '@/lib/utils';

interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function TrustScore({ score, size = 'md', className = '', showLabel = true }: TrustScoreProps) {
  const strokeColor = getTrustScoreColor(score);
  
  const getSizeValues = () => {
    switch (size) {
      case 'sm':
        return { width: 'w-8 h-8', fontSize: 'text-[10px]', labelSize: 'text-[8px]' };
      case 'lg':
        return { width: 'w-12 h-12', fontSize: 'text-base', labelSize: 'text-xs' };
      case 'md':
      default:
        return { width: 'w-10 h-10', fontSize: 'text-xs', labelSize: 'text-xs' };
    }
  };
  
  const { width, fontSize, labelSize } = getSizeValues();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${width}`}>
        <svg viewBox="0 0 36 36" className={width}>
          <circle cx="18" cy="18" r="16" className="fill-gray-100 stroke-gray-200" strokeWidth="2"></circle>
          <circle 
            cx="18" 
            cy="18" 
            r="16" 
            fill="none" 
            className="transition-all duration-700 ease-out" 
            stroke={strokeColor} 
            strokeWidth="4" 
            strokeDasharray={`${score} 100`} 
            strokeLinecap="round" 
            transform="rotate(-90 18 18)" 
          ></circle>
          <text 
            x="18" 
            y="21" 
            textAnchor="middle" 
            className={`${fontSize} font-bold fill-current`}
          >
            {score}
          </text>
        </svg>
      </div>
      {showLabel && (
        <span className={`${labelSize} text-gray-500 mt-1`}>Trust Score</span>
      )}
    </div>
  );
}
