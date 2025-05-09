import React from 'react';

interface BulkBuyLogoProps {
  className?: string;
}

const BulkBuyLogo: React.FC<BulkBuyLogoProps> = ({ className = '' }) => {
  return (
    <div className={className}>
      <img 
        src="/assets/bulkbuy-logo.png" 
        alt="BulkBuy Logo" 
        className="h-full"
      />
    </div>
  );
};

export default BulkBuyLogo;