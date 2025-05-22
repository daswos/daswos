import React from 'react';

interface DasWosHeaderLogoProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  size?: number;
}

export const DasWosHeaderLogo: React.FC<DasWosHeaderLogoProps> = ({
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

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simple black and white logo based on the image */}
      <rect x="0" y="0" width="20" height="20" fill="black" />
      <rect x="2" y="2" width="16" height="16" fill="white" />
      <rect x="0" y="22" width="12" height="12" fill="black" />
      <rect x="2" y="24" width="8" height="8" fill="white" />
    </svg>
  );
};

export default DasWosHeaderLogo;
