import React from 'react';

interface StatusLabelProps {
  text: string;
  color: string;
  bgColor: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({
  text,
  color,
  bgColor,
}) => {
  return (
    <span
      className="px-1.5 py-0.5 text-[11px] rounded-sm font-bold whitespace-nowrap overflow-hidden inline-block"
      style={{
        backgroundColor: bgColor,
        color: color,
        textShadow: '0 0 1px rgba(255,255,255,0.3)',
        letterSpacing: '0.02em'
      }}
    >
      {text}
    </span>
  );
};

export default StatusLabel;
