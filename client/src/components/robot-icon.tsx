import React from 'react';

interface RobotIconProps {
  className?: string;
  size?: number;
}

const RobotIcon: React.FC<RobotIconProps> = ({
  className = "",
  size = 20
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Search icon - magnifying glass */}
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <line
        x1="16.5"
        y1="16.5"
        x2="20.5"
        y2="20.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default RobotIcon;
