import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import DasWosCoinIcon from '@/components/daswos-coin-icon';

const DasWosCoinsCancel: React.FC = () => {
  const [, navigate] = useLocation();
  
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-4">Purchase Cancelled</h1>
        
        <div className="flex items-center justify-center mb-6">
          <DasWosCoinIcon size={24} className="mr-2" />
          <p className="text-lg">Your DasWos Coins purchase was cancelled</p>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          No charges were made to your account. You can try again or explore other options.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/daswos-coins')}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DasWosCoinsCancel;
