import React, { createContext, useContext, useState, useEffect } from 'react';
import { List, Bot, User, Package, FileText, Plus, MoreHorizontal, Home, ChevronsRight, Briefcase, LogOut, ShoppingCart, Coins } from 'lucide-react';
import BulkBuyIcon from '@/components/icons/bulk-buy-icon';
import SplitBuyIcon from '@/components/icons/split-buy-icon';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
  isDefault?: boolean;
}

interface DasbarContextType {
  items: NavigationItem[];
  visibleItems: NavigationItem[];
  moreItems: NavigationItem[];
  addItem: (item: NavigationItem) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
  updateDasbarItems: (newItems: NavigationItem[]) => void;
  maxVisibleItems: number;
  setMaxVisibleItems: (count: number) => void;
  isLoading: boolean;
  savePreferences: () => Promise<void>;
}

const defaultItems: NavigationItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: Home, isDefault: true },
  { id: 'daslist', label: 'das.list', path: '/d-list', icon: List, isDefault: true },
  { id: 'bulkbuy', label: 'BulkBuy', path: '/bulk-buy', icon: BulkBuyIcon },
  { id: 'jobs', label: 'Jobs', path: '/browse-jobs', icon: Briefcase },
  { id: 'ai-assistant', label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
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
  'ShoppingCart': ShoppingCart,
  'Coins': Coins
};

export const availableItems: NavigationItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: Home, isDefault: true },
  { id: 'daslist', label: 'das.list', path: '/d-list', icon: List, isDefault: true },
  { id: 'bulkbuy', label: 'BulkBuy', path: '/bulk-buy', icon: BulkBuyIcon },
  { id: 'jobs', label: 'Jobs', path: '/browse-jobs', icon: Briefcase },
  { id: 'ai-assistant', label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  { id: 'profile', label: 'My Profile', path: '/profile', icon: User },
  { id: 'split-buys', label: 'My Split Buys', path: '/split-buy-dashboard', icon: SplitBuyIcon },
  { id: 'orders', label: 'My Orders', path: '/my-orders', icon: Package },
  { id: 'list-item', label: 'List an Item', path: '/list-item', icon: Plus },
  { id: 'listings', label: 'My Listings', path: '/my-listings', icon: FileText },
  { id: 'cart', label: 'Cart', path: '/cart', icon: ShoppingCart },
  { id: 'daswos-coins', label: 'DasWos Coins', path: '/daswos-coins', icon: Coins },
  { id: 'logout', label: 'Log out', path: '/auth/logout', icon: LogOut }
];

const DasbarContext = createContext<DasbarContextType | undefined>(undefined);

export const DasbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>(defaultItems);
  const [maxVisibleItems, setMaxVisibleItems] = useState<number>(7); // Default to 7 visible items
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
        setMaxVisibleItems(data.maxVisibleItems);
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
      localStorage.setItem('dasbar-max-visible', maxVisibleItems.toString());
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
          items: itemsForApi,
          maxVisibleItems
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

  // Split items into visible and more items
  const visibleItems = items.slice(0, maxVisibleItems);
  const moreItems = items.slice(maxVisibleItems);

  // Helper function to save to localStorage only
  const saveToLocalStorage = (updatedItems: NavigationItem[]) => {
    localStorage.setItem('dasbar-items', JSON.stringify(updatedItems));
    localStorage.setItem('dasbar-max-visible', maxVisibleItems.toString());
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
    setItems(defaultItems);
    setMaxVisibleItems(7); // Reset to 7 visible items by default

    // Save to localStorage but don't trigger server save
    if (!user) {
      saveToLocalStorage(defaultItems);
    }
  };

  // Direct update function for the entire items array
  const updateDasbarItems = (newItems: NavigationItem[]) => {
    setItems(newItems);

    // Save to localStorage for non-authenticated users
    if (!user) {
      saveToLocalStorage(newItems);
    }
  };

  return (
    <DasbarContext.Provider value={{
      items,
      visibleItems,
      moreItems,
      addItem,
      removeItem,
      moveItem,
      resetToDefaults,
      updateDasbarItems,
      maxVisibleItems,
      setMaxVisibleItems,
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
