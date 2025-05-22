import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAdminSettings } from '@/contexts/admin-settings-context';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const [location, setLocation] = useLocation();
  const { admin_settings, admin_users, paidFeaturesDisabled } = useAdminSettings();
  
  // Query to get user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    // If paid features are disabled, allow access without authentication
    if (paidFeaturesDisabled) {
      console.log("ProtectedRoute: Paid features are disabled, allowing access without auth");
      return;
    }

    // If loading, wait
    if (isLoading) return;

    // If error or no user, redirect to login
    if (error || !user) {
      setLocation('/login?redirect=' + encodeURIComponent(location));
      return;
    }

    // If admin only and user is not an admin, redirect to home
    if (adminOnly && user && typeof user === 'object' && 'username' in user) {
      const username = user.username as string;
      if (!admin_users.includes(username)) {
        setLocation('/');
        return;
      }
    }
  }, [user, isLoading, error, setLocation, location, adminOnly, admin_users, paidFeaturesDisabled]);

  return <>{children}</>;
};