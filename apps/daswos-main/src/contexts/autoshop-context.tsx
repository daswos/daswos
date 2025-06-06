import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDasWosCoins } from '@/hooks/use-daswos-coins';

// Define the settings interface
export interface AutoShopSettings {
  maxTotalCoins: number;
  minItemPrice: number;
  maxItemPrice: number;
  duration: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  categories: string[];
  customPrompt: string;
  useRandomMode: boolean;
  itemsPerMinute: number; // Number of items to select per minute
}

// Define the context interface
interface AutoShopContextType {
  isAutoShopEnabled: boolean;
  endTime: Date | null;
  settings: AutoShopSettings | null;
  enableAutoShop: (settings: AutoShopSettings) => void;
  disableAutoShop: () => void;
  userCoins: number;
  timeRemaining: number;
  totalItems: number;
  setTotalItems: React.Dispatch<React.SetStateAction<number>>;
}

// Create local storage keys
const AUTOSHOP_MODE_STORAGE_KEY = 'daswos-autoshop-mode-enabled';
const AUTOSHOP_END_TIME_KEY = 'daswos-autoshop-end-time';
const AUTOSHOP_SETTINGS_KEY = 'daswos-autoshop-settings';

// Default settings
const DEFAULT_SETTINGS: AutoShopSettings = {
  maxTotalCoins: 5000,
  minItemPrice: 50,  // 50 dollars
  maxItemPrice: 250, // 250 dollars
  duration: {
    value: 30,
    unit: 'minutes'
  },
  categories: ['Electronics', 'Sports & Outdoors', 'Fashion'],
  customPrompt: '',
  useRandomMode: false,
  itemsPerMinute: 1 // Default to 1 item per minute
};

// Create the context
const AutoShopContext = createContext<AutoShopContextType | undefined>(undefined);

// Provider component
export const AutoShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAutoShopEnabled, setIsAutoShopEnabled] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState<AutoShopSettings | null>(null);
  const { balance } = useDasWosCoins(); // Use the DasWos coins hook
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalItems, setTotalItems] = useState(0); // Mock items in AutoShop cart

  // Load state from localStorage on component mount
  useEffect(() => {
    const storedEnabled = localStorage.getItem(AUTOSHOP_MODE_STORAGE_KEY);
    if (storedEnabled) {
      setIsAutoShopEnabled(storedEnabled === 'true');
    }

    // Load end time if available
    const storedEndTime = localStorage.getItem(AUTOSHOP_END_TIME_KEY);
    if (storedEndTime) {
      const endTimeDate = new Date(storedEndTime);
      // Only set if end time is in the future
      if (endTimeDate > new Date()) {
        setEndTime(endTimeDate);
      } else {
        // Clear expired end time and disable AutoShop
        localStorage.removeItem(AUTOSHOP_END_TIME_KEY);
        localStorage.setItem(AUTOSHOP_MODE_STORAGE_KEY, 'false');
        setIsAutoShopEnabled(false);
      }
    }

    // Load settings if available
    const storedSettings = localStorage.getItem(AUTOSHOP_SETTINGS_KEY);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Error parsing saved AutoShop settings:', e);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    // Fetch user coins from API in a real implementation
    // For now, we'll use a mock value
  }, []);

  // Calculate end time based on duration settings
  const calculateEndTime = (settings: AutoShopSettings): Date => {
    const now = new Date();
    const { value, unit } = settings.duration;

    switch (unit) {
      case 'minutes':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'hours':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'days':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + value * 60 * 1000); // Default to minutes
    }
  };

  // Enable AutoShop with settings
  const enableAutoShop = (newSettings: AutoShopSettings) => {
    // Save settings
    setSettings(newSettings);
    localStorage.setItem(AUTOSHOP_SETTINGS_KEY, JSON.stringify(newSettings));

    // Calculate and save end time
    const newEndTime = calculateEndTime(newSettings);
    setEndTime(newEndTime);
    localStorage.setItem(AUTOSHOP_END_TIME_KEY, newEndTime.toISOString());

    // Enable AutoShop
    setIsAutoShopEnabled(true);
    localStorage.setItem(AUTOSHOP_MODE_STORAGE_KEY, 'true');

    // Dispatch a custom event so other components can react to this change
    window.dispatchEvent(new CustomEvent('autoShopModeChanged', {
      detail: { enabled: true, settings: newSettings }
    }));
  };

  // Disable AutoShop
  const disableAutoShop = () => {
    setIsAutoShopEnabled(false);
    setEndTime(null);

    // Clear from localStorage
    localStorage.setItem(AUTOSHOP_MODE_STORAGE_KEY, 'false');
    localStorage.removeItem(AUTOSHOP_END_TIME_KEY);

    // Dispatch a custom event
    window.dispatchEvent(new CustomEvent('autoShopModeChanged', {
      detail: { enabled: false }
    }));
  };

  // Check if AutoShop should be disabled due to time expiration
  useEffect(() => {
    if (isAutoShopEnabled && endTime) {
      const now = new Date();
      if (now >= endTime) {
        disableAutoShop();
      } else {
        // Set a timeout to disable AutoShop when time expires
        const timeoutId = setTimeout(() => {
          disableAutoShop();
        }, endTime.getTime() - now.getTime());

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isAutoShopEnabled, endTime]);

  // Update timeRemaining every second
  useEffect(() => {
    if (isAutoShopEnabled && endTime) {
      // Initial calculation
      const calculateTimeRemaining = () => {
        const now = new Date();
        if (now >= endTime) {
          setTimeRemaining(0);
          return false; // Return false to indicate time has expired
        } else {
          setTimeRemaining(endTime.getTime() - now.getTime());
          return true; // Return true to continue interval
        }
      };

      // Calculate immediately
      const shouldContinue = calculateTimeRemaining();
      if (!shouldContinue) return;

      // Then set up interval to update every second
      const intervalId = setInterval(() => {
        const shouldContinue = calculateTimeRemaining();
        if (!shouldContinue) {
          clearInterval(intervalId);
        }
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      setTimeRemaining(0);
    }
  }, [isAutoShopEnabled, endTime]);

  // Reset total items when AutoShop is disabled
  useEffect(() => {
    if (!isAutoShopEnabled) {
      setTotalItems(0);
    }
  }, [isAutoShopEnabled]);

  return (
    <AutoShopContext.Provider value={{
      isAutoShopEnabled,
      endTime,
      settings,
      enableAutoShop,
      disableAutoShop,
      userCoins: balance, // Use the balance from the DasWos coins hook
      timeRemaining,
      totalItems,
      setTotalItems
    }}>
      {children}
    </AutoShopContext.Provider>
  );
};

// Hook for using the AutoShop context
export const useAutoShop = () => {
  const context = useContext(AutoShopContext);
  if (context === undefined) {
    throw new Error('useAutoShop must be used within an AutoShopProvider');
  }
  return context;
};
