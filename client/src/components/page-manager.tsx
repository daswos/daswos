import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import MainContentContainer from './main-content-container';
import NotFound from '@/pages/not-found';
import { trackPageView } from '@/lib/analytics';

// Lazy load all pages
const Home = lazy(() => import('@/pages/home'));
const UnifiedSearch = lazy(() => import('@/pages/unified-search'));
const AuthPage = lazy(() => import('@/pages/auth-page'));
const UserSettings = lazy(() => import('@/pages/user-settings'));
const AutoShopDashboard = lazy(() => import('@/pages/autoshop-dashboard'));

// Additional pages based on the dasbar items
const BulkBuy = lazy(() => import('@/pages/bulk-buy'));
const SplitBuy = lazy(() => import('@/pages/split-buy'));
const DasList = lazy(() => import('@/pages/das-list'));
const BrowseJobs = lazy(() => import('@/pages/browse-jobs'));
const AiAssistant = lazy(() => import('@/pages/ai-assistant'));
const Cart = lazy(() => import('@/pages/cart'));
const DasWosCoins = lazy(() => import('@/pages/daswos-coins'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full py-12">
    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    <span className="ml-2 text-gray-500">Loading page...</span>
  </div>
);

/**
 * PageManager component
 * Handles the dynamic loading of pages based on the current route
 */
const PageManager: React.FC = () => {
  const [location] = useLocation();
  const [currentPath, setCurrentPath] = useState<string>('');

  // Extract the base path without query parameters and track page view
  useEffect(() => {
    const path = location.split('?')[0];
    setCurrentPath(path);

    // Track page view
    trackPageView(location);
  }, [location]);

  // Render the appropriate component based on the current path
  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/search':
      case '/unified-search':
        return <UnifiedSearch />;
      case '/auth':
        return <AuthPage />;
      case '/user-settings':
        return <UserSettings />;
      case '/autoshop-dashboard':
        return <AutoShopDashboard />;
      case '/bulk-buy':
        return <BulkBuy />;
      case '/split-buy':
        return <SplitBuy />;
      case '/d-list':
        return <DasList />;
      case '/browse-jobs':
        return <BrowseJobs />;
      case '/ai-assistant':
        return <AiAssistant />;
      case '/cart':
        return <Cart />;
      case '/daswos-coins':
        return <DasWosCoins />;
      default:
        return <NotFound />;
    }
  };

  return (
    <MainContentContainer>
      <Suspense fallback={<LoadingFallback />}>
        {renderPage()}
      </Suspense>
    </MainContentContainer>
  );
};

export default PageManager;
