import React from 'react';
import { useTheme } from '@/providers/theme-provider';

interface DasWosIconLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  size?: number;
}

export const DasWosIconLogo: React.FC<DasWosIconLogoProps> = ({
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
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Black square with white rectangles */}
      <rect x="0" y="0" width="40" height="40" fill="black" />
      <rect x="4" y="4" width="16" height="16" fill="white" />
      <rect x="4" y="24" width="10" height="10" fill="white" />
    </svg>
  );
};

export default DasWosIconLogo;
