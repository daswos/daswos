import { FC, ComponentType } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';

interface ProtectedRouteProps {
  path: string;
  component: ComponentType<any>;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ path, component: Component }) => {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { adminSettings } = useAdminSettings();

  const paidFeaturesDisabled = adminSettings?.aiShopperDevMode || false;
  const isAuthenticated = !!user;

  return (
    <Route
      path={path}
      component={props => {
        // If features are in dev mode, allow access without auth
        if (paidFeaturesDisabled) {
          return <Component {...props} />;
        }

        // If still loading auth state, render nothing (or a loading indicator)
        if (isLoading) {
          return <div className="p-8 text-center">Loading...</div>;
        }

        // If not authenticated, redirect to auth page
        if (!isAuthenticated) {
          setLocation(`/auth?redirect=${encodeURIComponent(location)}`);
          return null;
        }

        // User is authenticated, render the protected component
        return <Component {...props} />;
      }}
    />
  );
};

// Special route that requires both authentication and a subscription
export const ProtectedSubscriptionRoute: FC<ProtectedRouteProps> = ({ path, component: Component }) => {
  const [location, setLocation] = useLocation();
  const { user, hasSubscription, isLoading } = useAuth();
  const { adminSettings } = useAdminSettings();

  const paidFeaturesDisabled = adminSettings?.aiShopperDevMode || false;
  const isAuthenticated = !!user;

  return (
    <Route
      path={path}
      component={props => {
        // If features are in dev mode, allow access without subscription
        if (paidFeaturesDisabled) {
          return <Component {...props} />;
        }

        // If still loading auth state, render nothing (or a loading indicator)
        if (isLoading) {
          return <div className="p-8 text-center">Loading...</div>;
        }

        // If not authenticated, redirect to auth page
        if (!isAuthenticated) {
          setLocation(`/auth?redirect=${encodeURIComponent(location)}`);
          return null;
        }

        // Check if user has necessary subscription
        if (!hasSubscription) {
          setLocation('/safesphere-subscription');
          return null;
        }

        // User is authenticated and has subscription, render the protected component
        return <Component {...props} />;
      }}
    />
  );
};

// Special route that requires authentication and specifically an Unlimited subscription
export const ProtectedUnlimitedSubscriptionRoute: FC<ProtectedRouteProps> = ({ path, component: Component }) => {
  const [location, setLocation] = useLocation();
  const { user, hasSubscription, subscriptionDetails, isLoading } = useAuth();
  const { settings } = useAdminSettings();

  const isAuthenticated = !!user;

  return (
    <Route
      path={path}
      component={props => {
        // Check if user has access to Unlimited features
        const hasUnlimitedAccess =
          // Admin settings override
          settings.paidFeaturesDisabled ||
          settings.subscriptionDevMode ||
          // Or user has Unlimited subscription
          (hasSubscription && subscriptionDetails?.type === 'unlimited');

        // If features are in dev mode or user has unlimited access, allow access
        if (hasUnlimitedAccess) {
          return <Component {...props} />;
        }

        // If still loading auth state, render nothing (or a loading indicator)
        if (isLoading) {
          return <div className="p-8 text-center">Loading...</div>;
        }

        // If not authenticated, redirect to auth page
        if (!isAuthenticated) {
          setLocation(`/auth?redirect=${encodeURIComponent(location)}`);
          return null;
        }

        // If user doesn't have Unlimited subscription, redirect to profile page
        setLocation('/profile');
        return null;
      }}
    />
  );
};