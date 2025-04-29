import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BulkBuySearch from '@/components/bulk-buy-search';
import SphereToggle from '@/components/sphere-toggle';
import AutoShopToggle from '@/components/autoshop-toggle';
import SellerCTA from '@/components/seller-cta';
import ProductTile from '@/components/product-tile';
import '@/styles/product-tile.css';
import BulkBuyLogo from '@/components/bulkbuy-logo';
import { Product } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBagIcon, AlertCircle, Search, Package, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';

const BulkBuy: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const { user } = useAuth();
  const { settings } = useAdminSettings();

  // Show notification when trying to use SafeSphere without being logged in
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // For filtering within BulkBuy
  const [sphereFilter, setSphereFilter] = useState<'safesphere' | 'opensphere'>(
    user || settings.paidFeaturesDisabled ? 'safesphere' : 'opensphere'
  );

  // Listen for AI mode changes
  useEffect(() => {
    // Load initial state from localStorage
    const storedValue = localStorage.getItem('daswos-ai-mode-enabled');
    if (storedValue) {
      setAiModeEnabled(storedValue === 'true');
    }

    // Listen for AI mode toggle events
    const handleAiModeChange = (event: CustomEvent) => {
      setAiModeEnabled(event.detail.enabled);
    };

    // Add event listener
    window.addEventListener('aiModeChanged', handleAiModeChange as EventListener);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('aiModeChanged', handleAiModeChange as EventListener);
    };
  }, []);

  // Handle sphere change - keep on bulk buy page but filter items
  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    // When paid features are disabled, allow SafeSphere access without login
    if (settings.paidFeaturesDisabled) {
      setSphereFilter(sphere);
      setShowLoginAlert(false);
      console.log(`Selected filter: ${sphere} - free access mode (paid features disabled)`);
      return;
    }

    // If trying to use SafeSphere while not logged in, show alert
    if (sphere === 'safesphere' && !user) {
      setShowLoginAlert(true);
      // Don't change sphere filter, stay on opensphere
      return;
    }

    // Always stay on the BulkBuy page
    setSphereFilter(sphere);
    setShowLoginAlert(false);
    console.log(`Selected filter: ${sphere} - still on BulkBuy page`);
  };

  // Query for bulk buy products with search filter using dedicated endpoint
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ['/api/bulk-buy', searchQuery, sphereFilter],
    queryFn: async () => {
      let url = `/api/bulk-buy`;
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      // Add sphere to filter by safesphere/opensphere
      params.append('sphere', sphereFilter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`Fetching bulk buy products from: ${url}`);

      try {
        const response = await fetch(url);
        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch bulk buy products: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Received ${data.length} bulk buy products`);

        return data;
      } catch (err) {
        console.error('Error fetching bulk buy products:', err);
        throw err;
      }
    }
  });

  // Handle search submission - search within bulk buy items
  const handleSearch = (query: string) => {
    console.log(`BulkBuy Search: Query='${query}', Sphere=${sphereFilter}`);
    setSearchQuery(query);
    setAiResponse(null); // Clear any previous AI response
    // No need to change location, we'll filter products based on the query
    refetch().then(data => {
      console.log('BulkBuy Search Results:', data);
    }).catch(err => {
      console.error('BulkBuy Search Error:', err);
    });
  };

  // Handle AI-enhanced search with Daswos AI
  const handleAiSearch = async (query: string): Promise<any> => {
    console.log('Performing AI-enhanced BulkBuy search for:', query);
    setIsAiSearching(true);
    setSearchQuery(query);

    try {
      // Call the AI search API with type=shopping to focus on products
      const response = await fetch(`/api/ai-search?query=${encodeURIComponent(query)}&type=shopping`);
      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const aiData = await response.json();
      console.log('AI BulkBuy search response:', aiData);
      setAiResponse(aiData);

      // Search for products using the query as well to display in the results
      refetch().then(data => {
        console.log('BulkBuy AI Search Results:', data);
        setIsAiSearching(false);
      }).catch(err => {
        console.error('BulkBuy AI Search Error:', err);
        setIsAiSearching(false);
      });

      return aiData;
    } catch (error) {
      console.error('Error during AI BulkBuy search:', error);
      setIsAiSearching(false);
      return {
        text: 'Sorry, I encountered an error. Please try again.',
        hasAudio: false
      };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">


      <div className="flex flex-col items-center mb-8">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center mb-4">
            <BulkBuyLogo className="h-14 mb-2" />
            <h2 className="text-2xl font-bold text-center text-blue-800">
              BulkBuy
            </h2>
          </div>
          <p className="text-gray-600 text-center mb-6">
            Wholesale and bulk purchases for businesses and groups.
          </p>

          <BulkBuySearch
            onSearch={handleSearch}
            onAiSearch={handleAiSearch}
            className="mb-6"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <SphereToggle
              activeSphere={sphereFilter}
              onChange={handleSphereChange}
            />
            {/* Only show AutoShopToggle if AI mode is enabled */}
            {aiModeEnabled && <AutoShopToggle />}
          </div>

          {/* Login alert for SafeSphere */}
          {showLoginAlert && (
            <Alert className="mb-4 bg-warning-50 text-warning-800 border-warning-100">
              <AlertCircle className="h-4 w-4 text-warning-600" />
              <AlertTitle className="text-warning-800">Login Required</AlertTitle>
              <AlertDescription className="text-warning-700">
                <p className="mb-2">You need to log in to access SafeSphere verified items in BulkBuy.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/auth')}
                  className="mt-1 bg-warning-100 border-warning-200 hover:bg-warning-200"
                >
                  Login / Register
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* SafeSphere Success Alert removed as requested */}

          {/* Removed BulkBuy Marketplace message */}
        </div>
      </div>

      {/* Search Results Section */}
      <div>
        {/* Show results only if search query exists */}
        {searchQuery && (
          <h2 className="text-xl font-semibold mb-4">
            Results for "{searchQuery}" in BulkBuy
          </h2>
        )}

        {isAiSearching ? (
          <div className="mt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-2">Searching with Daswos AI...</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-gray-300 p-3 h-72">
                <div className="flex flex-col mb-2">
                  <Skeleton className="w-full h-32 rounded-md mb-2" />
                  <div className="flex-grow">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2 mt-4" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-6 w-16" />
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-10 mr-3" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && products?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-gray-600">
              Try a different search term or browse popular categories
            </p>
          </div>
        ) : searchQuery && products?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-20">
            <div className="bg-blue-50 p-8 rounded-full inline-block mb-4">
              <BulkBuyLogo className="h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Search for Bulk Products</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Use the search bar above to find wholesale and bulk products.
              Perfect for businesses, group purchases, and high-volume orders.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleSearch("office supplies")}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Office Supplies
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSearch("electronics")}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Electronics
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSearch("wholesale")}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Wholesale Items
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* SellerCTA without InfoSection */}
      <SellerCTA />
    </div>
  );
};

export default BulkBuy;