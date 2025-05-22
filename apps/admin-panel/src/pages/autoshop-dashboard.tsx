import React, { useState, useEffect, useRef } from 'react';
import { useDasWosCoins } from '@/hooks/use-daswos-coins';
import { Bot, ShoppingBag, Clock, Check, X, AlertCircle, Package } from 'lucide-react';
import { formatDasWosCoins, formatDate } from '@/lib/utils';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AutoShopStartButton from '@/components/autoshop-start-button';
import { useToast } from '@/hooks/use-toast';
import { useAutoShop } from '@/contexts/global-autoshop-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AutoShopDashboard: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { toast } = useToast();

  // Get DasWos coins balance
  const { balance: coinsBalance } = useDasWosCoins();

  // Use the global AutoShop context
  const {
    pendingItems,
    orderHistory,
    isLoading,
    removeItem,
    clearAllItems,
    refreshItems
  } = useAutoShop();

  // Refresh items only once when the component mounts
  const hasInitiallyFetched = useRef(false);

  useEffect(() => {
    // Only refresh if we don't already have data and haven't fetched yet
    if (!pendingItems?.length && !isLoading && !hasInitiallyFetched.current) {
      hasInitiallyFetched.current = true;
      refreshItems();
    }
  }, [pendingItems, isLoading, refreshItems]);

  // Use empty arrays if data is not available yet
  const displayPendingItems = pendingItems || [];
  const displayOrderHistory = orderHistory || [];

  // Loading states
  const isPendingLoading = isLoading;
  const isHistoryLoading = isLoading;

  // Function to remove an item from pending purchases
  const handleRemoveItem = async (itemId: string) => {
    try {
      // Use the global context to remove the item
      await removeItem(itemId);

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

  // Function to clear all pending items
  const handleClearAllItems = () => {
    setShowClearDialog(true);
  };

  // Function to confirm clearing all items
  const confirmClearAllItems = async () => {
    setIsClearing(true);
    try {
      // Use the global context to clear all items
      await clearAllItems();

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
      setIsClearing(false);
      setShowClearDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Clear Items Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all items from your AutoShop list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmClearAllItems();
              }}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isClearing ? 'Clearing...' : 'Clear All Items'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bot className="h-6 w-6 mr-2 text-blue-600" />
            <h1 className="text-2xl font-bold">My AutoShop Dashboard</h1>
          </div>
          <div className="flex items-center">
            <DasWosCoinIcon className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">{formatDasWosCoins(coinsBalance)}</span>
            <Button
              variant="link"
              className="ml-2 text-sm text-blue-600 hover:text-blue-800"
              onClick={() => window.location.href = '/daswos-coins'}
            >
              Purchase Coins
            </Button>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          View and manage your AutoShop AI purchases. See what items are pending purchase and your order history.
        </p>

        {coinsBalance === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <DasWosCoinIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You currently have 0 DasWos Coins. AutoShop requires coins to make purchases on your behalf.
                  <Button
                    variant="link"
                    className="ml-1 text-sm text-blue-600 hover:text-blue-800 p-0"
                    onClick={() => window.location.href = '/daswos-coins'}
                  >
                    Purchase coins now
                  </Button>
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="pending" className="w-full">
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
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Items Pending Purchase
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      These items will be purchased automatically when your AutoShop timer completes.
                    </p>
                  </div>
                  {displayPendingItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={handleClearAllItems}
                    >
                      <X className="h-3 w-3 mr-1" />
                      <span className="text-xs">Clear All Items</span>
                    </Button>
                  )}
                </div>
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
                  <div className="mt-4">
                    <AutoShopStartButton className="mx-auto" />
                  </div>
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
                  <div className="mt-4">
                    <AutoShopStartButton className="mx-auto" />
                  </div>
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
