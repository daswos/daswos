import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define the shape of our AutoShop context
interface AutoShopContextType {
  isAutoShopActive: boolean;
  pendingItems: any[];
  orderHistory: any[];
  startAutoShop: () => Promise<void>;
  stopAutoShop: () => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearAllItems: () => Promise<void>;
  isLoading: boolean;
  refreshItems: () => Promise<void>;
}

// Create the context with a default value
const AutoShopContext = createContext<AutoShopContextType>({
  isAutoShopActive: false,
  pendingItems: [],
  orderHistory: [],
  startAutoShop: async () => {},
  stopAutoShop: async () => {},
  removeItem: async () => {},
  clearAllItems: async () => {},
  isLoading: false,
  refreshItems: async () => {},
});

// Create a provider component
export const AutoShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAutoShopActive, setIsAutoShopActive] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Use a ref to track if a refresh is in progress
  const isRefreshing = useRef(false);
  // Use a ref to track the last refresh time
  const lastRefreshTime = useRef(0);

  // Refresh items from the server with debouncing
  const refreshItems = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshing.current) {
      return;
    }

    // Implement debouncing - only refresh if it's been at least 5 seconds since the last refresh
    const now = Date.now();
    if (now - lastRefreshTime.current < 5000) {
      return;
    }

    isRefreshing.current = true;
    lastRefreshTime.current = now;
    setIsLoading(true);

    try {
      // Fetch pending items
      const pendingData = await apiRequest('/api/user/autoshop/pending', {
        method: 'GET',
        credentials: 'include'
      });
      setPendingItems(pendingData || []);

      // Fetch order history
      const historyData = await apiRequest('/api/user/autoshop/history', {
        method: 'GET',
        credentials: 'include'
      });
      setOrderHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching AutoShop items:', error);
    } finally {
      setIsLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  // Check if AutoShop is active on mount
  useEffect(() => {
    const checkAutoShopStatus = async () => {
      try {
        const status = await apiRequest('/api/user/autoshop/status', {
          method: 'GET',
          credentials: 'include'
        });

        setIsAutoShopActive(status?.active || false);

        // If active, fetch items, but only if we haven't fetched recently
        if (status?.active && Date.now() - lastRefreshTime.current > 5000) {
          refreshItems();
        }
      } catch (error) {
        console.error('Error checking AutoShop status:', error);
      }
    };

    checkAutoShopStatus();
  }, [refreshItems]);

  // Start AutoShop
  const startAutoShop = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/user/autoshop/start', {
        method: 'POST',
        credentials: 'include'
      });

      setIsAutoShopActive(true);
      refreshItems();

      toast({
        title: "AutoShop Started",
        description: "AutoShop is now running and will select items for you.",
      });
    } catch (error) {
      console.error('Error starting AutoShop:', error);
      toast({
        title: "Error",
        description: "Failed to start AutoShop. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stop AutoShop
  const stopAutoShop = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/user/autoshop/stop', {
        method: 'POST',
        credentials: 'include'
      });

      setIsAutoShopActive(false);

      toast({
        title: "AutoShop Stopped",
        description: "AutoShop has been stopped. Items remain in your list.",
      });
    } catch (error) {
      console.error('Error stopping AutoShop:', error);
      toast({
        title: "Error",
        description: "Failed to stop AutoShop. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an item
  const removeItem = async (itemId: string) => {
    try {
      await apiRequest(`/api/user/autoshop/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      // Update local state
      setPendingItems(current => current.filter(item => item.id !== itemId));

      toast({
        title: "Item Removed",
        description: "The item has been removed from your AutoShop list.",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Clear all items
  const clearAllItems = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/user/autoshop/clear', {
        method: 'POST',
        credentials: 'include'
      });

      // Clear local state
      setPendingItems([]);

      toast({
        title: "Items Cleared",
        description: "All items have been removed from your AutoShop list.",
      });
    } catch (error) {
      console.error('Error clearing items:', error);
      toast({
        title: "Error",
        description: "Failed to clear items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up a polling interval to refresh items when AutoShop is active
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoShopActive) {
      // Refresh items every 30 seconds when AutoShop is active
      interval = setInterval(() => {
        refreshItems();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoShopActive, refreshItems]);

  return (
    <AutoShopContext.Provider
      value={{
        isAutoShopActive,
        pendingItems,
        orderHistory,
        startAutoShop,
        stopAutoShop,
        removeItem,
        clearAllItems,
        isLoading,
        refreshItems
      }}
    >
      {children}
    </AutoShopContext.Provider>
  );
};

// Create a hook to use the AutoShop context
export const useAutoShop = () => useContext(AutoShopContext);
