import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Bot, ShoppingBag, Clock, Check, X, AlertCircle, Package } from 'lucide-react';
import { formatDasWosCoins, formatDate } from '@/lib/utils';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const AutoShopDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch AutoShop pending purchases
  const { data: pendingItems, isLoading: isPendingLoading } = useQuery({
    queryKey: ['/api/user/autoshop/pending'],
    queryFn: async () => {
      return apiRequest('/api/user/autoshop/pending', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Fetch AutoShop order history
  const { data: orderHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/user/autoshop/history'],
    queryFn: async () => {
      return apiRequest('/api/user/autoshop/history', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Mock data for development (remove in production)
  const mockPendingItems = [
    {
      id: '1',
      name: 'Wireless Earbuds',
      description: 'Noise cancelling with long battery life',
      estimatedPrice: 5000,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      addedAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: '2',
      name: 'Smart Watch',
      description: 'Fitness tracking and notifications',
      estimatedPrice: 8000,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      addedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending'
    }
  ];

  const mockOrderHistory = [
    {
      id: '3',
      name: 'Bluetooth Speaker',
      description: 'Waterproof portable speaker',
      price: 4500,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      purchasedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    },
    {
      id: '4',
      name: 'Phone Charger',
      description: 'Fast charging USB-C cable',
      price: 1200,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      purchasedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed'
    }
  ];

  // Use mock data if real data is not available yet
  const displayPendingItems = pendingItems || mockPendingItems;
  const displayOrderHistory = orderHistory || mockOrderHistory;

  // Function to remove an item from pending purchases
  const handleRemoveItem = async (itemId: string) => {
    try {
      await apiRequest(`/api/user/autoshop/pending/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      // Refetch pending items
      // queryClient.invalidateQueries({ queryKey: ['/api/user/autoshop/pending'] });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Bot className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">My AutoShop Dashboard</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          View and manage your AutoShop AI purchases. See what items are pending purchase and your order history.
        </p>

        <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pending" className="text-sm">
              <Clock className="h-4 w-4 mr-2" />
              Pending Purchases
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Items Pending Purchase
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  These items will be purchased automatically when your AutoShop timer completes.
                </p>
              </div>

              {isPendingLoading ? (
                <div className="p-4">
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : displayPendingItems.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No pending purchases</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    AutoShop hasn't selected any items for purchase yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayPendingItems.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-start">
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mr-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <div className="flex items-center">
                            <DasWosCoinIcon className="mr-1" size={14} />
                            <span className="text-sm">{formatDasWosCoins(item.estimatedPrice)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-300">
                              {item.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              Added {formatDate(item.addedAt)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Order History
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Items that have been purchased by AutoShop on your behalf.
                </p>
              </div>

              {isHistoryLoading ? (
                <div className="p-4">
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : displayOrderHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No purchase history</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    AutoShop hasn't purchased any items for you yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {displayOrderHistory.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-start">
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mr-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <div className="flex items-center">
                            <DasWosCoinIcon className="mr-1" size={14} />
                            <span className="text-sm">{formatDasWosCoins(item.price)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-200 text-green-800 dark:border-green-800 dark:text-green-300">
                              {item.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              Purchased {formatDate(item.purchasedAt)}
                            </span>
                          </div>
                          <Badge className="text-[10px] px-1 py-0 h-5 bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutoShopDashboard;
