import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';

const DasWosCoinsSuccessPage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get the session ID from the URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Refresh the balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/transactions'] });

      // Show success toast
      toast({
        title: 'Payment Successful',
        description: 'Your DasWos Coins have been added to your account',
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-green-200 shadow-md">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Your DasWos Coins purchase was completed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-4">
              Your coins have been added to your account and are ready to use.
            </p>
            <div className="flex items-center justify-center text-xl font-bold">
              <DasWosCoinIcon size={24} className="mr-2" />
              <span>Your coins are ready to use</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/daswos-coins')}
          >
            View My Coins
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DasWosCoinsSuccessPage;
