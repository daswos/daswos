import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShoppingBag, Loader2, Check, X, Info, ShoppingCart, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ProductTile from '@/components/product-tile';
import '@/styles/product-tile.css';
import SphereToggle from '@/components/sphere-toggle';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import DasWosLogo from '@/components/daswos-logo';
import AnimatedTrustText from '@/components/animated-trust-text';


const ShoppingEngine: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isBulkBuy, setIsBulkBuy] = useState(false);
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // For sphere filtering
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    user || settings.paidFeaturesDisabled ? 'safesphere' : 'opensphere'
  );

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Extract search parameters from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const bulkBuy = params.get('bulk') === 'true';

    setSearchQuery(query);
    setSubmittedQuery(query);
    setIsBulkBuy(bulkBuy);
  }, []);

  // Products search query
  const {
    data: searchResults = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/products', submittedQuery, activeSphere, isBulkBuy],
    queryFn: async () => {
      let url = `/api/products?q=${encodeURIComponent(submittedQuery)}&sphere=${activeSphere}`;

      // Add bulk parameter if bulk buy mode is active
      if (isBulkBuy) {
        url += `&bulk=true`;
      }

      console.log(`Fetching products with URL: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: !!submittedQuery
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSubmittedQuery(searchQuery);

    // Update URL without navigating
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    params.set('sphere', activeSphere);
    if (isBulkBuy) {
      params.set('bulk', 'true');
    }

    const newUrl = `/shopping-engine?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);

    // If there's an active search, update results with new sphere
    if (submittedQuery) {
      const params = new URLSearchParams();
      params.set('q', submittedQuery);
      params.set('sphere', sphere);
      if (isBulkBuy) {
        params.set('bulk', 'true');
      }

      const newUrl = `/shopping-engine?${params.toString()}`;
      window.history.pushState({}, '', newUrl);

      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    }
  };

  const handleNavigation = (path: string) => {
    // Preserve the SafeSphere/OpenSphere state when navigating
    const newPath = activeSphere === 'safesphere' ?
      `${path}${path.includes('?') ? '&' : '?'}sphere=safesphere` :
      `${path}${path.includes('?') ? '&' : '?'}sphere=opensphere`;

    setLocation(newPath);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Design with proper dark mode support */}
      <div className="bg-[#E0E0E0] dark:bg-[#222222] pt-16 pb-8 flex-grow flex items-center">
        {/* Back button removed - now using the one in the navigation bar */}

        <div className="container mx-auto px-4 text-center w-full">
          {/* Logo with Theme Toggle */}
          <div className="flex flex-col items-center logo-container">
            <div className="relative inline-block">
              <div className="px-16 py-2">
                <DasWosLogo height={80} width="auto" />
              </div>
              {/* Theme Toggle Button - Positioned absolutely to the right of the logo */}
              <button
                onClick={toggleTheme}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent flex items-center justify-center w-6 h-6 text-xs rounded-full"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>

            {/* Animated Trust Heading - Moved above Info button */}
            <div className="mt-0 mb-3">
              <AnimatedTrustText
                sentences={[
                  "Shopping Engine - Find products from trusted sellers.",
                  "Helping you shop with confidence."
                ]}
                duration={5000} // 5 seconds per sentence
              />
            </div>

            {/* Info Button */}
            <div className="mt-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-black dark:text-white flex items-center text-sm rounded-sm bg-transparent">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Info</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-white dark:bg-[#333333] text-black dark:text-white p-1 border border-gray-300 dark:border-gray-600 rounded-sm shadow-md">
                  <div className="w-48">
                    <DropdownMenuItem onClick={() => handleNavigation('/shopping')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <ShoppingCart className="mr-2 h-3 w-3" />
                      <span>Shopping</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNavigation('/bulk-buy')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <ShoppingBag className="mr-2 h-3 w-3" />
                      <span>BulkBuy</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-4">
            <form onSubmit={handleSearch} className="flex flex-col space-y-2">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="What are you shopping for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-[#222222] focus:outline-none"
                  ref={searchInputRef}
                />
                <button
                  type="submit"
                  className="border border-l-0 px-4 search-button bg-white dark:bg-[#333333] border-gray-300 dark:border-gray-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <Search className="h-5 w-5 text-black dark:text-white" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* SafeSphere toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <SphereToggle
              activeSphere={activeSphere}
              onChange={handleSphereChange}
            />
          </div>

          {/* Navigation tabs removed - now using the dasbar at the bottom */}

          {/* Search Results */}
          {submittedQuery && (
            <div className="mt-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Searching for products...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">
                    Results for "{submittedQuery}"
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
                    {searchResults.map((product: any) => (
                      <ProductTile
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2 text-black dark:text-white">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try a different search term or browse popular categories
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingEngine;
