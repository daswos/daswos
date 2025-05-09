import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AdminSettings {
  paidFeaturesDisabled: boolean;
  safesphereDevMode: boolean;
  aiShopperDevMode: boolean;
  safesphereDevMessage: string;
  aiShopperDevMessage: string;
}

interface AdminSettingsContextType {
  admin_settings: AdminSettings;
  admin_users: string[];
  paidFeaturesDisabled: boolean;
  isLoading: boolean;
  error: any;
}

const defaultAdminSettings: AdminSettings = {
  paidFeaturesDisabled: true, // Default to enabled for development
  safesphereDevMode: false,
  aiShopperDevMode: false,
  safesphereDevMessage: '',
  aiShopperDevMessage: ''
};

const AdminSettingsContext = createContext<AdminSettingsContextType>({
  admin_settings: defaultAdminSettings,
  admin_users: ['admin'],
  paidFeaturesDisabled: true,
  isLoading: false,
  error: null
});

export const useAdminSettings = () => useContext(AdminSettingsContext);

interface AdminSettingsProviderProps {
  children: ReactNode;
}

export const AdminSettingsProvider = ({ children }: AdminSettingsProviderProps) => {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings);
  const [adminUsers, setAdminUsers] = useState<string[]>(['admin']);

  // Query to fetch admin settings
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/settings'],
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && typeof data === 'object') {
      // Handle the API response with type safety
      interface ApiResponse {
        settings?: AdminSettings;
        admin_users?: string[];
      }
      
      const typedData = data as ApiResponse;
      setAdminSettings(typedData.settings || defaultAdminSettings);
      setAdminUsers(typedData.admin_users || ['admin']);
    }
  }, [data]);

  const value: AdminSettingsContextType = {
    admin_settings: adminSettings,
    admin_users: adminUsers,
    paidFeaturesDisabled: adminSettings.paidFeaturesDisabled,
    isLoading,
    error
  };

  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
};