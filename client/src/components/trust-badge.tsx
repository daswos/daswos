import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, AlertTriangleIcon, UserIcon } from 'lucide-react';

interface TrustBadgeProps {
  verified: boolean;
  sellerType?: 'merchant' | 'personal';
  className?: string;
}

export function TrustBadge({ verified, sellerType = 'merchant', className = '' }: TrustBadgeProps) {
  if (!verified) {
    return (
      <Badge variant="warning" className={`flex items-center ${className}`}>
        <AlertTriangleIcon className="w-3 h-3 mr-1" />
        Use Caution
      </Badge>
    );
  }
  
  if (sellerType === 'personal') {
    return (
      <Badge variant="success" className={`flex items-center ${className}`}>
        <UserIcon className="w-3 h-3 mr-1" />
        Personal Seller
      </Badge>
    );
  }
  
  return (
    <Badge variant="success" className={`flex items-center ${className}`}>
      <CheckIcon className="w-3 h-3 mr-1" />
      Verified Safe
    </Badge>
  );
}
