import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AdminSettings {
  paidFeaturesDisabled: boolean;
  safesphereDevMode: boolean;
  aiShopperDevMode: boolean;
  safesphereDevMessage: string;
  aiShopperDevMessage: string;
}

interface AdminSettingsContextType {
  settings: AdminSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: AdminSettings = {
  paidFeaturesDisabled: false,
  safesphereDevMode: false,
  aiShopperDevMode: false,
  safesphereDevMessage: '',
  aiShopperDevMessage: ''
};

const AdminSettingsContext = createContext<AdminSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {}
});

export const AdminSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin settings from context...');
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        console.log('Admin settings received in context:', data);
        setSettings({
          paidFeaturesDisabled: data.paidFeaturesDisabled === true,
          safesphereDevMode: data.safesphereDevMode === true, 
          aiShopperDevMode: data.aiShopperDevMode === true,
          safesphereDevMessage: data.safesphereDevMessage || '',
          aiShopperDevMessage: data.aiShopperDevMessage || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch only, no polling to prevent page refreshes
  useEffect(() => {
    fetchSettings();
    // No setInterval to prevent unwanted refreshes
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <AdminSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = () => useContext(AdminSettingsContext);

export default useAdminSettings;