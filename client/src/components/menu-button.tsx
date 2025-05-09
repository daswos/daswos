import React from 'react';

interface MenuButtonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  size?: number;
  onClick?: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  className = "",
  width = "auto",
  height = "100%",
  size,
  onClick
}) => {
  // If size is provided, use it for both width and height
  if (size !== undefined) {
    width = size;
    height = size;
  }

  return (
    <div 
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Menu button design with two squares */}
        <rect x="5" y="5" width="20" height="20" stroke="black" strokeWidth="2" fill="white" />
        <rect x="5" y="30" width="10" height="10" stroke="black" strokeWidth="2" fill="white" />
      </svg>
    </div>
  );
};

export default MenuButton;
