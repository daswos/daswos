import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronRight, Loader2 } from 'lucide-react';
import DasWosCoinDisplay from './daswos-coin-display';

interface QuickPurchaseButtonProps {
  amount: number;
  onClick: (amount: number) => void;
  disabled?: boolean;
}

const QuickPurchaseButton: React.FC<QuickPurchaseButtonProps> = ({
  amount,
  onClick,
  disabled = false
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs h-8"
      onClick={() => onClick(amount)}
      disabled={disabled}
    >
      {amount.toLocaleString()}
    </Button>
  );
};

const DasWosCoinsBalance: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user's coin balance
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/daswos-coins/balance'],
    queryFn: async () => {
      if (!user) return { balance: 0 };
      const response = await fetch('/api/daswos-coins/balance');
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleQuickPurchase = (amount: number) => {
    navigate(`/daswos-coins?amount=${amount}`);
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-[#E0E0E0] dark:bg-[#222222] border border-gray-300 dark:border-gray-700"
        onClick={() => handleNavigation('/daswos-coins')}
      >
        <DasWosCoinDisplay coinBalance={0} size="sm" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-[#E0E0E0] dark:bg-[#222222] border border-gray-300 dark:border-gray-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span>Loading...</span>
            </div>
          ) : isError ? (
            <DasWosCoinDisplay coinBalance={0} size="sm" />
          ) : (
            <DasWosCoinDisplay coinBalance={data?.balance || 0} size="sm" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2 border-b">
          <p className="text-sm font-medium">DasWos Coins</p>
          {isLoading ? (
            <Skeleton className="h-4 w-20 mt-1" />
          ) : (
            <p className="text-lg font-bold">{data?.balance?.toLocaleString() || 0}</p>
          )}
        </div>

        <div className="p-2">
          <p className="text-xs text-gray-500 mb-2">Quick Purchase</p>
          <div className="flex gap-2 mb-2">
            <QuickPurchaseButton
              amount={100}
              onClick={handleQuickPurchase}
              disabled={isLoading}
            />
            <QuickPurchaseButton
              amount={500}
              onClick={handleQuickPurchase}
              disabled={isLoading}
            />
            <QuickPurchaseButton
              amount={1000}
              onClick={handleQuickPurchase}
              disabled={isLoading}
            />
          </div>

          <DropdownMenuItem
            onClick={() => handleNavigation('/daswos-coins')}
            className="cursor-pointer"
          >
            Manage Coins
            <ChevronRight className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DasWosCoinsBalance;
