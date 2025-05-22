import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ChevronRight } from 'lucide-react';

const DasWosCoinsCancelPage = () => {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your DasWos Coins purchase was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-4">
              Your payment was cancelled and you have not been charged.
            </p>
            <p className="text-gray-600 text-sm">
              If you experienced any issues during checkout, please try again or contact support.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/daswos-coins')}
          >
            Try Again
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

export default DasWosCoinsCancelPage;
