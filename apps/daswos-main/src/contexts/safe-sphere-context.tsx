import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';

interface SafeSphereContextType {
  isSafeSphere: boolean;
  setIsSafeSphere: (active: boolean) => void;
  toggleSafeSphere: () => void;
  isLoading: boolean;
}

const SafeSphereContext = createContext<SafeSphereContextType>({
  isSafeSphere: true,
  setIsSafeSphere: () => {},
  toggleSafeSphere: () => {},
  isLoading: false
});

export const useSafeSphereContext = () => useContext(SafeSphereContext);

interface SafeSphereProviderProps {
  children: ReactNode;
}

export const SafeSphereProvider: React.FC<SafeSphereProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const [isSafeSphere, setIsSafeSphere] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the user's SafeSphere preference when logged in
  useEffect(() => {
    const fetchSafeSphereStatus = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/safesphere');
        if (!response.ok) {
          console.error('Failed to fetch SafeSphere status');
          return;
        }
        
        const data = await response.json();
        const userPreference = data.active;
        
        // Check current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentSphere = urlParams.get('sphere');
        
        // If sphere is explicitly set in URL, use that value but don't update database
        if (currentSphere === 'safesphere' || currentSphere === 'opensphere') {
          setIsSafeSphere(currentSphere === 'safesphere');
        } 
        // Otherwise use user's stored preference
        else {
          setIsSafeSphere(userPreference);
        }
      } catch (error) {
        console.error('Error fetching SafeSphere status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSafeSphereStatus();
  }, [user]);

  // Save the user's SafeSphere preference
  const saveSafeSpherePreference = async (active: boolean) => {
    if (!user && !settings.paidFeaturesDisabled) return;
    
    try {
      const response = await fetch('/api/user/safesphere', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active })
      });
      
      if (!response.ok) {
        console.error('Failed to update SafeSphere status');
      }
    } catch (error) {
      console.error('Error updating SafeSphere status:', error);
    }
  };

  const toggleSafeSphere = () => {
    const newValue = !isSafeSphere;
    setIsSafeSphere(newValue);
    saveSafeSpherePreference(newValue);
  };

  const updateSafeSphere = (value: boolean) => {
    setIsSafeSphere(value);
    saveSafeSpherePreference(value);
  };

  return (
    <SafeSphereContext.Provider 
      value={{ 
        isSafeSphere, 
        setIsSafeSphere: updateSafeSphere,
        toggleSafeSphere,
        isLoading 
      }}
    >
      {children}
    </SafeSphereContext.Provider>
  );
};

export default SafeSphereProvider;