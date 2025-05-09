import React, { useContext } from 'react';
import { useTheme } from '@/providers/theme-provider';

interface DasWosLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  size?: number;
}

export const DasWosLogo: React.FC<DasWosLogoProps> = ({ 
  className = "",
  width = "auto",
  height = "100%",
  size
}) => {
  // If size is provided, use it for both width and height
  if (size !== undefined) {
    width = size;
    height = size;
  }
  // Get current theme from context
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 60" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g>
        {/* Text part */}
        <text 
          x="10" 
          y="40" 
          fontFamily="Arial, sans-serif" 
          fontSize="40" 
          fontWeight="bold" 
          fill={isDarkMode ? "white" : "black"}
        >
          daswos
        </text>
        
        {/* Box part */}
        <rect x="140" y="12" width="40" height="36" fill={isDarkMode ? "white" : "black"} />
        <rect x="142" y="14" width="18" height="12" fill={isDarkMode ? "#222222" : "white"} />
        <rect x="142" y="30" width="10" height="10" fill={isDarkMode ? "#222222" : "white"} />
      </g>
    </svg>
  );
};

export default DasWosLogo;