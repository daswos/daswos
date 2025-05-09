import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Define the SuperSafe settings interface
export interface SuperSafeSettings {
  blockGambling: boolean;
  blockAdultContent: boolean;
  blockOpenSphere: boolean;
}

// Define the context type
interface SuperSafeContextType {
  isSuperSafeEnabled: boolean;
  settings: SuperSafeSettings;
  isLoading: boolean;
  toggleSuperSafe: (enabled: boolean) => void;
  updateSettings: (setting: keyof SuperSafeSettings, value: boolean) => void;
  updateAllSettings: (settings: SuperSafeSettings) => void;
}

// Default settings
const defaultSettings: SuperSafeSettings = {
  blockGambling: true,
  blockAdultContent: true,
  blockOpenSphere: false
};

// Create the context
const SuperSafeContext = createContext<SuperSafeContextType>({
  isSuperSafeEnabled: false,
  settings: defaultSettings,
  isLoading: true,
  toggleSuperSafe: () => {},
  updateSettings: () => {},
  updateAllSettings: () => {}
});

// Hook to use the SuperSafe context
export const useSuperSafe = () => useContext(SuperSafeContext);

// Provider component
interface SuperSafeProviderProps {
  children: ReactNode;
}

export const SuperSafeProvider: React.FC<SuperSafeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSuperSafeEnabled, setIsSuperSafeEnabled] = useState(false);
  const [settings, setSettings] = useState<SuperSafeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch SuperSafe status when user changes
  useEffect(() => {
    const fetchSuperSafeStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/user-settings/supersafe');
        if (!response.ok) {
          throw new Error('Failed to fetch SuperSafe status');
        }

        const data = await response.json();
        setIsSuperSafeEnabled(data.enabled);
        setSettings(data.settings || defaultSettings);
      } catch (error) {
        console.error('Error fetching SuperSafe status:', error);
        // Set defaults on error
        setIsSuperSafeEnabled(false);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuperSafeStatus();
  }, [user]);

  // Save SuperSafe settings to the server
  const saveSuperSafeSettings = async (enabled: boolean, updatedSettings: SuperSafeSettings) => {
    if (!user) return;

    try {
      const response = await fetch('/api/user-settings/supersafe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled,
          settings: updatedSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update SuperSafe settings');
      }

      // No toast notification to avoid constant notifications
      return true;
    } catch (error) {
      console.error('Error updating SuperSafe settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update SuperSafe settings',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Toggle SuperSafe mode
  const toggleSuperSafe = (enabled: boolean) => {
    setIsSuperSafeEnabled(enabled);
    saveSuperSafeSettings(enabled, settings);
  };

  // Update a single setting
  const updateSettings = (setting: keyof SuperSafeSettings, value: boolean) => {
    const updatedSettings = {
      ...settings,
      [setting]: value
    };
    setSettings(updatedSettings);

    // Only save if SuperSafe is enabled
    if (isSuperSafeEnabled) {
      saveSuperSafeSettings(isSuperSafeEnabled, updatedSettings);
    }
  };

  // Update all settings at once
  const updateAllSettings = (newSettings: SuperSafeSettings) => {
    setSettings(newSettings);

    // Only save if SuperSafe is enabled
    if (isSuperSafeEnabled) {
      saveSuperSafeSettings(isSuperSafeEnabled, newSettings);
    }
  };

  return (
    <SuperSafeContext.Provider
      value={{
        isSuperSafeEnabled,
        settings,
        isLoading,
        toggleSuperSafe,
        updateSettings,
        updateAllSettings
      }}
    >
      {children}
    </SuperSafeContext.Provider>
  );
};

export default SuperSafeProvider;
