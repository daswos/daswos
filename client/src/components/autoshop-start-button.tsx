import React, { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AutoShopStartButtonProps {
  className?: string;
}

const AutoShopStartButton: React.FC<AutoShopStartButtonProps> = ({
  className = ''
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const startAutoShop = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/user/autoshop/start', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.success) {
        toast({
          title: 'AutoShop Started',
          description: 'AutoShop is now actively shopping for you!',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to start AutoShop',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error starting AutoShop:', error);
      toast({
        title: 'Error',
        description: 'Failed to start AutoShop. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={startAutoShop}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Start AutoShop
        </>
      )}
    </button>
  );
};

export default AutoShopStartButton;
