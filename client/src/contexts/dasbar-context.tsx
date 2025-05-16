import React, { createContext, useContext, useState, useEffect } from 'react';
import { List, Bot, User, Package, FileText, Plus, MoreHorizontal, Home, ChevronsRight, Briefcase, LogOut, ShoppingCart, Coins } from 'lucide-react';
import BulkBuyIcon from '@/components/icons/bulk-buy-icon';
import SplitBuyIcon from '@/components/icons/split-buy-icon';
import AutoShopIcon from '@/components/icons/auto-shop-icon';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
  isDefault?: boolean;
  showInCollapsed?: boolean;
}

interface DasbarContextType {
  items: NavigationItem[];
  collapsedItems: NavigationItem[];
  addItem: (item: NavigationItem) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
  updateDasbarItems: (newItems: NavigationItem[]) => void;
  toggleCollapsedVisibility: (id: string) => void;
  isLoading: boolean;
  savePreferences: () => Promise<void>;
}

const defaultItems: NavigationItem[] = [
  // Home is now fixed in the navigation bar and not part of customizable items
  { id: 'bulkbuy', label: 'BulkBuy', path: '/bulk-buy', icon: BulkBuyIcon },
  { id: 'splitbuy', label: 'SplitBuy', path: '/split-buy', icon: SplitBuyIcon },
  { id: 'daslist', label: 'das.list', path: '/d-list', icon: List },
  { id: 'jobs', label: 'Jobs', path: '/browse-jobs', icon: Briefcase },
  { id: 'ai-assistant', label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  { id: 'autoshop', label: 'AutoShop', path: '/autoshop-dashboard', icon: AutoShopIcon },
  { id: 'cart', label: 'Cart', path: '/cart', icon: ShoppingCart },
  { id: 'daswos-coins', label: 'DasWos Coins', path: '/daswos-coins', icon: Coins }
];

// Map icon strings to actual components for when we load from API
const iconMap: Record<string, React.ComponentType<any>> = {
  'Home': Home,
  'BulkBuyIcon': BulkBuyIcon,
  'SplitBuyIcon': SplitBuyIcon,
  'List': List,
  'Bot': Bot,
  'User': User,
  'Package': Package,
  'FileText': FileText,
  'Plus': Plus,
  'Briefcase': Briefcase,
  'LogOut': LogOut,
  'AutoShopIcon': AutoShopIcon,
  'ShoppingCart': ShoppingCart,
  'Coins': Coins
};

export const availableItems: NavigationItem[] = [
  // Home is now fixed in the navigation bar and not part of customizable items
  { id: 'bulkbuy', label: 'BulkBuy', path: '/bulk-buy', icon: BulkBuyIcon },
  { id: 'splitbuy', label: 'SplitBuy', path: '/split-buy', icon: SplitBuyIcon },
  { id: 'daslist', label: 'das.list', path: '/d-list', icon: List },
  { id: 'jobs', label: 'Jobs', path: '/browse-jobs', icon: Briefcase },
  { id: 'ai-assistant', label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  { id: 'autoshop', label: 'AutoShop', path: '/autoshop-dashboard', icon: AutoShopIcon },
  { id: 'cart', label: 'Cart', path: '/cart', icon: ShoppingCart },
  { id: 'daswos-coins', label: 'DasWos Coins', path: '/daswos-coins', icon: Coins }
];

const DasbarContext = createContext<DasbarContextType | undefined>(undefined);

export const DasbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>(defaultItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load preferences from API on initial render and when user changes
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/dasbar-preferences');
        if (!response.ok) {
          throw new Error('Failed to load dasbar preferences');
        }

        const data = await response.json();

        // Convert icon strings to actual components
        const itemsWithIcons = data.items.map((item: any) => ({
          ...item,
          icon: iconMap[item.icon] || Home // Default to Home icon if not found
        }));

        setItems(itemsWithIcons);
      } catch (error) {
        console.error('Error loading dasbar preferences:', error);
        // Fall back to default items
        setItems(defaultItems);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Save preferences to API
  const savePreferences = async () => {
    if (!user) {
      // Only save to localStorage for non-authenticated users
      localStorage.setItem('dasbar-items', JSON.stringify(items));
      return;
    }

    try {
      // Convert icon components to strings for API
      const itemsForApi = items.map(item => ({
        ...item,
        icon: item.icon?.displayName || 'Home' // Use component displayName as string
      }));

      const response = await fetch('/api/user/dasbar-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: itemsForApi
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save dasbar preferences');
      }

      // Removed toast notification to prevent constant notifications
    } catch (error) {
      // Only log errors to console, don't show toast notifications
      console.error('Error saving dasbar preferences:', error);
    }
  };

  // Get items that should be visible in collapsed mode
  const collapsedItems = items.filter(item => item.showInCollapsed);

  // Helper function to save to localStorage only
  const saveToLocalStorage = (updatedItems: NavigationItem[]) => {
    localStorage.setItem('dasbar-items', JSON.stringify(updatedItems));
  };

  const addItem = (item: NavigationItem) => {
    // Check if item already exists
    if (!items.some(i => i.id === item.id)) {
      const updatedItems = [...items, item];
      setItems(updatedItems);

      // Save to localStorage but don't trigger server save
      if (!user) {
        saveToLocalStorage(updatedItems);
      }
    }
  };

  const removeItem = (id: string) => {
    // Don't allow removing default items
    const itemToRemove = items.find(item => item.id === id);
    if (itemToRemove && !itemToRemove.isDefault) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);

      // Save to localStorage but don't trigger server save
      if (!user) {
        saveToLocalStorage(updatedItems);
      }
    }
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;

    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      // Swap with previous item
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      // Swap with next item
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setItems(newItems);

    // Save to localStorage but don't trigger server save
    if (!user) {
      saveToLocalStorage(newItems);
    }
  };

  const resetToDefaults = () => {
    // Make sure to clear any showInCollapsed properties
    const resetItems = defaultItems.map(item => ({
      ...item,
      showInCollapsed: false // Reset all items to not show in collapsed mode
    }));

    setItems(resetItems);

    // Save to localStorage but don't trigger server save
    if (!user) {
      saveToLocalStorage(resetItems);
    }

    console.log("Reset to defaults:", resetItems);
  };

  // Direct update function for the entire items array
  const updateDasbarItems = (newItems: NavigationItem[]) => {
    setItems(newItems);

    // Save to localStorage for non-authenticated users
    if (!user) {
      saveToLocalStorage(newItems);
    }
  };

  // Toggle whether an item should be visible in collapsed mode
  const toggleCollapsedVisibility = (id: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          showInCollapsed: !item.showInCollapsed
        };
      }
      return item;
    });

    setItems(updatedItems);

    // Save to localStorage for non-authenticated users
    if (!user) {
      saveToLocalStorage(updatedItems);
    } else {
      // Save to server for authenticated users
      savePreferences();
    }

    // Log for debugging
    console.log(`Toggled collapsed visibility for ${id}:`,
      updatedItems.find(item => item.id === id)?.showInCollapsed);
  };

  return (
    <DasbarContext.Provider value={{
      items,
      collapsedItems,
      addItem,
      removeItem,
      moveItem,
      resetToDefaults,
      updateDasbarItems,
      toggleCollapsedVisibility,
      isLoading,
      savePreferences
    }}>
      {children}
    </DasbarContext.Provider>
  );
};

export const useDasbar = () => {
  const context = useContext(DasbarContext);
  if (context === undefined) {
    throw new Error('useDasbar must be used within a DasbarProvider');
  }
  return context;
};

export const availableNavItems = availableItems;
