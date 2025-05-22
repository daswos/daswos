import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import DasWosCoinIcon from '@/components/daswos-coin-icon';

const DasWosCoinsSuccess: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Show success message
    toast({
      title: 'Purchase Successful',
      description: 'Your DasWos Coins have been added to your account',
      variant: 'default',
    });
    
    // Refresh the balance
    queryClient.invalidateQueries({ queryKey: ['/api/daswos-coins/balance'] });
    queryClient.invalidateQueries({ queryKey: ['/api/daswos-coins/transactions'] });
  }, [toast, queryClient]);
  
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-4">Purchase Successful!</h1>
        
        <div className="flex items-center justify-center mb-6">
          <DasWosCoinIcon size={24} className="mr-2" />
          <p className="text-lg">Your DasWos Coins have been added to your account</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/daswos-coins')}
            className="w-full"
          >
            View My Coins
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

export default DasWosCoinsSuccess;
