import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShoppingCart, X, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAutoShop as useLocalAutoShop } from '@/contexts/autoshop-context';
import { useAutoShop } from '@/contexts/global-autoshop-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSafeSphereContext } from '@/contexts/safe-sphere-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Item interface
interface SelectedItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const GlobalAutoShopTimer: React.FC = () => {
  // Use both contexts - local for UI state and global for data
  const { isAutoShopEnabled, endTime, disableAutoShop } = useLocalAutoShop();
  const {
    isAutoShopActive,
    pendingItems,
    stopAutoShop,
    removeItem,
    refreshItems
  } = useAutoShop();

  const { toast } = useToast();
  const { user } = useAuth();
  const { isSafeSphere } = useSafeSphereContext();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    progress: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    progress: 100
  });

  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Convert pendingItems to the format needed for display
  const selectedItems: SelectedItem[] = pendingItems?.map(item => ({
    id: item.id.toString(),
    name: item.name || 'Unknown Product',
    price: item.estimatedPrice ? Math.floor(item.estimatedPrice) : 0,
    image: item.imageUrl
  })) || [];

  // Use a ref to track if we've already set up the refresh interval
  const hasSetupInterval = useRef(false);

  // Refresh items when AutoShop is active, but only set up the interval once
  useEffect(() => {
    if ((isAutoShopEnabled || isAutoShopActive) && !hasSetupInterval.current) {
      hasSetupInterval.current = true;

      // Initial refresh
      refreshItems();

      // Set up interval to refresh items
      const interval = setInterval(() => {
        refreshItems();
      }, 30000); // Refresh every 30 seconds (increased from 10 seconds)

      return () => {
        clearInterval(interval);
        hasSetupInterval.current = false;
      };
    }
  }, [isAutoShopEnabled, isAutoShopActive, refreshItems]);

  // Calculate time left and update state
  useEffect(() => {
    if (!isAutoShopEnabled || !endTime) {
      return;
    }

    // Calculate initial total seconds for progress calculation
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    const initialSeconds = Math.max(0, Math.floor(diffMs / 1000));
    setInitialTotalSeconds(initialSeconds);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diffMs = endTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        // Time's up
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          progress: 0
        };
      }

      // Calculate time components
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      // Calculate progress percentage (inverted: 100% at start, 0% at end)
      const progress = initialSeconds > 0
        ? Math.max(0, Math.min(100, (totalSeconds / initialSeconds) * 100))
        : 0;

      return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        progress
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.totalSeconds <= 0) {
        clearInterval(timer);
        // Clear selected items when timer expires
        setSelectedItems([]);
        // Removed toast notification for completion
      }
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [isAutoShopEnabled, endTime, initialTotalSeconds, toast]);

  // Format time component with leading zero
  const formatTimeComponent = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  // Format the countdown display
  const formatCountdown = (): string => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${formatTimeComponent(timeLeft.hours)}h`;
    } else if (timeLeft.hours > 0) {
      return `${formatTimeComponent(timeLeft.hours)}:${formatTimeComponent(timeLeft.minutes)}`;
    } else {
      return `${formatTimeComponent(timeLeft.minutes)}:${formatTimeComponent(timeLeft.seconds)}`;
    }
  };

  // Handle stop button click
  const handleStopClick = async () => {
    try {
      // Stop the AutoShop process using the global context
      await stopAutoShop();

      // Disable AutoShop in the local context
      disableAutoShop();

      toast({
        title: "AutoShop Stopped",
        description: "AutoShop has been stopped. Items remain in your list and can be removed or kept for next time.",
      });
    } catch (error) {
      console.error("Failed to stop AutoShop:", error);

      // Still disable AutoShop even if stopping fails
      disableAutoShop();

      toast({
        title: "AutoShop Stopped",
        description: "AutoShop has been stopped, but there was an error with the server.",
        variant: "destructive"
      });
    }
  };

  // The automatic item selection is now handled by the global AutoShop context
  // We don't need to implement it here anymore

  // Don't render anything if AutoShop is not enabled
  if (!isAutoShopEnabled || !endTime) {
    return null;
  }

  return (
    <div className={`fixed top-16 right-4 z-50 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-md cursor-pointer flex items-center gap-2 p-2 pr-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">AutoShop</span>
            </div>
            <span className="text-sm font-mono ml-1">{formatCountdown()}</span>
            <div className="flex items-center gap-1 ml-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                title="View selected items"
              >
                {isOpen ?
                  <ChevronUp className="h-3 w-3 text-gray-500" /> :
                  <ChevronDown className="h-3 w-3 text-gray-500" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStopClick();
                }}
                title="Stop AutoShop"
              >
                <X className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 border rounded-md shadow-lg" align="end">
          <div>
            <div className="flex items-center justify-between p-4 pb-3">
              <h4 className="text-lg font-medium">Selected Items</h4>
              <span className="text-sm text-gray-500">{selectedItems.length} items</span>
            </div>

            {selectedItems.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${item.price} ({item.price} coins)</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-red-100 p-0"
                        onClick={async () => {
                          try {
                            // Use the global context to remove the item
                            await removeItem(item.id);

                            toast({
                              title: "Item Removed",
                              description: "The item has been removed from your AutoShop list.",
                            });
                          } catch (error) {
                            console.error("Failed to remove item:", error);
                            toast({
                              title: "Error",
                              description: "Failed to remove item. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                        title="Remove item"
                      >
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No items selected yet
              </div>
            )}

            <div className="border-t border-gray-200">
              <div className="flex justify-between items-center p-4">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-xl font-bold">
                  ${selectedItems.reduce((sum, item) => sum + item.price, 0)}
                  <span className="text-sm font-normal ml-1">
                    ({selectedItems.reduce((sum, item) => sum + item.price, 0)} coins)
                  </span>
                </span>
              </div>

              <p className="text-xs text-gray-500 px-4 pb-4">
                Items will be finalized when the timer ends
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GlobalAutoShopTimer;
