import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';

/**
 * Hook to manage DasWos coins balance
 * Provides consistent access to the user's DasWos coins balance across the application
 */
export function useDasWosCoins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's coins balance
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/daswos-coins/balance'],
    queryFn: async () => {
      return apiRequest('/api/user/daswos-coins/balance', {
        method: 'GET',
        credentials: 'include'
      });
    },
    // Enable for all users, not just authenticated ones
    staleTime: 60000, // 1 minute
  });

  // Function to refresh the balance
  const refreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
  };

  // Function to purchase coins
  const purchaseCoins = async (amount: number) => {
    try {
      const response = await apiRequest('/api/user/daswos-coins/purchase', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          metadata: {
            packageName: `${amount} DasWos Coins`,
            purchaseTimestamp: new Date().toISOString()
          }
        }),
      });

      // Refresh the balance after purchase
      refreshBalance();

      return response;
    } catch (error) {
      console.error('Error purchasing DasWos coins:', error);
      throw error;
    }
  };

  return {
    balance: data?.balance || 0,
    isLoading,
    error,
    refreshBalance,
    purchaseCoins
  };
}
