import React, { useState } from 'react';
import { ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
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

interface AutoShopStartButtonProps {
  className?: string;
}

const AutoShopStartButton: React.FC<AutoShopStartButtonProps> = ({
  className = ''
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showExistingItemsDialog, setShowExistingItemsDialog] = useState(false);

  // Use the global AutoShop context
  const {
    pendingItems,
    startAutoShop: startGlobalAutoShop,
    clearAllItems
  } = useAutoShop();

  const hasPendingItems = pendingItems && pendingItems.length > 0;

  const startAutoShop = async (clearExistingItems = false) => {
    setIsLoading(true);
    try {
      // If we need to clear existing items first
      if (clearExistingItems && hasPendingItems) {
        await clearAllItems();
      }

      // Start AutoShop using the global context
      await startGlobalAutoShop();

      toast({
        title: 'AutoShop Started',
        description: 'AutoShop is now actively shopping for you!',
      });

      // Refresh the page to show the timer
      window.location.reload();
    } catch (error) {
      console.error('Error starting AutoShop:', error);
      toast({
        title: 'Error',
        description: 'Failed to start AutoShop. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowExistingItemsDialog(false);
    }
  };

  const handleStartClick = () => {
    // If there are pending items, show the dialog
    if (hasPendingItems) {
      setShowExistingItemsDialog(true);
    } else {
      // Otherwise start directly
      startAutoShop(false);
    }
  };

  return (
    <>
      <AlertDialog open={showExistingItemsDialog} onOpenChange={setShowExistingItemsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Existing Items Found
            </AlertDialogTitle>
            <AlertDialogDescription>
              There are still items in your AutoShop list from a previous session.
              Would you like to clear these items before starting a new AutoShop session,
              or keep them and continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                startAutoShop(false); // Keep existing items
              }}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Starting...' : 'Keep Items & Start'}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                startAutoShop(true); // Clear existing items
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Starting...' : 'Clear Items & Start'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <button
        onClick={handleStartClick}
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
    </>
  );
};

export default AutoShopStartButton;
