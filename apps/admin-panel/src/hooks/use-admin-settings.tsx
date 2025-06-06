import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AdminSettings {
  paidFeaturesDisabled: boolean;
  // Development mode toggles
  safesphereDevMode: boolean;
  aiShopperDevMode: boolean;
  subscriptionDevMode: boolean;
  superSafeDevMode: boolean;
  // Feature visibility toggles
  safesphereEnabled: boolean;
  aiShopperEnabled: boolean;
  superSafeEnabled: boolean;
  autoShopEnabled: boolean;
  // Page visibility toggles
  jobsPageEnabled: boolean;
  dasListPageEnabled: boolean;
  aiAssistantEnabled: boolean;
  splitBuyEnabled: boolean;
  bulkBuyEnabled: boolean;
  daswosCoinsEnabled: boolean;
  sellFunctionalityEnabled: boolean;
  // Development messages
  safesphereDevMessage: string;
  aiShopperDevMessage: string;
  subscriptionDevMessage: string;
  superSafeDevMessage: string;
}

interface AdminSettingsContextType {
  settings: AdminSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: AdminSettings = {
  paidFeaturesDisabled: false,
  // Development mode toggles
  safesphereDevMode: false,
  aiShopperDevMode: false,
  subscriptionDevMode: false,
  superSafeDevMode: false,
  // Feature visibility toggles
  safesphereEnabled: true,
  aiShopperEnabled: true,
  superSafeEnabled: true,
  autoShopEnabled: true,
  // Page visibility toggles
  jobsPageEnabled: true,
  dasListPageEnabled: true,
  aiAssistantEnabled: true,
  splitBuyEnabled: true,
  bulkBuyEnabled: true,
  daswosCoinsEnabled: true,
  sellFunctionalityEnabled: true,
  // Development messages
  safesphereDevMessage: '',
  aiShopperDevMessage: '',
  subscriptionDevMessage: '',
  superSafeDevMessage: ''
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
          // Development mode toggles
          safesphereDevMode: data.safesphereDevMode === true,
          aiShopperDevMode: data.aiShopperDevMode === true,
          subscriptionDevMode: data.subscriptionDevMode === true,
          superSafeDevMode: data.superSafeDevMode === true,
          // Feature visibility toggles
          safesphereEnabled: data.safesphereEnabled !== false, // Default to true if not set
          aiShopperEnabled: data.aiShopperEnabled !== false, // Default to true if not set
          superSafeEnabled: data.superSafeEnabled !== false, // Default to true if not set
          autoShopEnabled: data.autoShopEnabled !== false, // Default to true if not set
          // Page visibility toggles
          jobsPageEnabled: data.jobsPageEnabled !== false, // Default to true if not set
          dasListPageEnabled: data.dasListPageEnabled !== false, // Default to true if not set
          aiAssistantEnabled: data.aiAssistantEnabled !== false, // Default to true if not set
          splitBuyEnabled: data.splitBuyEnabled !== false, // Default to true if not set
          bulkBuyEnabled: data.bulkBuyEnabled !== false, // Default to true if not set
          daswosCoinsEnabled: data.daswosCoinsEnabled !== false, // Default to true if not set
          sellFunctionalityEnabled: data.sellFunctionalityEnabled !== false, // Default to true if not set
          // Development messages
          safesphereDevMessage: data.safesphereDevMessage || '',
          aiShopperDevMessage: data.aiShopperDevMessage || '',
          subscriptionDevMessage: data.subscriptionDevMessage || '',
          superSafeDevMessage: data.superSafeDevMessage || ''
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