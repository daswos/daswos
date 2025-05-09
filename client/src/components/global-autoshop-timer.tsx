import React, { useState, useEffect } from 'react';
import { Clock, ShoppingCart, X, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAutoShop } from '@/contexts/autoshop-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Mock data for selected items
interface SelectedItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const GlobalAutoShopTimer: React.FC = () => {
  const { isAutoShopEnabled, endTime, disableAutoShop } = useAutoShop();
  const { toast } = useToast();

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

  // Mock selected items - in a real app, this would come from the API or context
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    { id: '1', name: 'Wireless Earbuds', price: 89 },
    { id: '2', name: 'Smart Watch', price: 199 },
    { id: '3', name: 'Portable Charger', price: 49 },
  ]);

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
  const handleStopClick = () => {
    // Clear the selected items when stopping
    setSelectedItems([]);
    disableAutoShop();
    // Removed toast notification for stopping
  };

  // Simulate AI finding new items (for demonstration purposes)
  useEffect(() => {
    if (isAutoShopEnabled && endTime) {
      // Simulate AI finding new items every 20-30 seconds
      const mockItems = [
        { id: '4', name: 'Bluetooth Speaker', price: 79 },
        { id: '5', name: 'Fitness Tracker', price: 129 },
        { id: '6', name: 'Wireless Mouse', price: 39 },
        { id: '7', name: 'USB-C Hub', price: 59 },
        { id: '8', name: 'Phone Stand', price: 19 },
      ];

      let currentIndex = 0;

      const addItemInterval = setInterval(() => {
        if (currentIndex < mockItems.length) {
          const newItem = mockItems[currentIndex];
          setSelectedItems(prev => [...prev, newItem]);

          // Removed toast notification for new items

          currentIndex++;
        } else {
          clearInterval(addItemInterval);
        }
      }, Math.random() * 5000 + 10000); // Random interval between 10-15 seconds (for demo purposes)

      return () => clearInterval(addItemInterval);
    }
  }, [isAutoShopEnabled, endTime, toast]);

  // Don't render anything if AutoShop is not enabled
  if (!isAutoShopEnabled || !endTime) {
    return null;
  }

  return (
    <div className={`fixed top-16 right-4 z-50 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full shadow-md cursor-pointer flex items-center gap-2 p-1.5">
            <div className="relative flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="ml-1.5 text-xs font-medium">AutoShop</span>
            </div>
            <span className="text-xs font-mono">{formatCountdown()}</span>
            <div className="flex items-center gap-1">
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
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="text-sm font-medium">Selected Items</h4>
              <span className="text-xs text-muted-foreground">{selectedItems.length} items</span>
            </div>

            {selectedItems.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        <Package className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-xs truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">${item.price}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 p-0 ml-1"
                        onClick={() => {
                          setSelectedItems(items => items.filter(i => i.id !== item.id));
                          // Removed toast notification
                        }}
                        title="Remove item"
                      >
                        <X className="h-3 w-3 text-red-500" />
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

            <div className="pt-1 border-t flex justify-between items-center">
              <span className="text-xs font-medium">Total:</span>
              <span className="text-sm font-medium">
                ${selectedItems.reduce((sum, item) => sum + item.price, 0)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Items will be finalized when the timer ends
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GlobalAutoShopTimer;
