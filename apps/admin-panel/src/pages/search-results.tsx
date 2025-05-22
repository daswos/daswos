import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, AlertCircle, X, ShoppingBag } from 'lucide-react';
import SearchBar from '@/components/search-bar';
import FeatureAwareSphereToggle from '@/components/feature-aware-sphere-toggle';
import FeatureAwareSuperSafeToggle from '@/components/feature-aware-super-safe-toggle';
import ProductTile from '@/components/product-tile';
import CarouselSearchResults from '@/components/carousel-search-results';
import '@/styles/product-tile.css';
import { Product } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useSuperSafe } from '@/contexts/super-safe-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to parse query params
const useQueryParams = () => {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1] || '');
};

// Filter types
type FilterState = {
  sellerType: {
    merchant: boolean;
    personal: boolean;
  };
  priceRange: [number, number];
  trustScore: [number, number];
  tags: string[];
  hasDiscount: boolean;
  shipping: string[];
};

const SearchResults: React.FC = () => {
  const queryParams = useQueryParams();
  const searchQuery = queryParams.get('q') || '';
  // Get the sphere from URL params
  const sphereParam = queryParams.get('sphere');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  const { isSuperSafeEnabled, settings: superSafeSettings } = useSuperSafe();
  const { toast } = useToast();

  // Handle bulkbuy as a special case that redirects to the bulkbuy page
  useEffect(() => {
    if (sphereParam === 'bulkbuy') {
      setLocation(`/bulk-buy${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
    }
  }, [sphereParam, searchQuery]);

  // Only allow safesphere or opensphere in the regular search
  // If sphere is explicitly set in URL, use that value
  // Otherwise respect SuperSafe Mode settings if enabled
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    sphereParam ?
      (sphereParam === 'safesphere' ? 'safesphere' : 'opensphere') :
      (user && isSuperSafeEnabled && superSafeSettings.blockOpenSphere ? 'safesphere' :
       user ? 'safesphere' : 'opensphere')
  );

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sellerType: {
      merchant: false,
      personal: false
    },
    priceRange: [0, 50000], // in cents, $0-$500
    trustScore: [0, 100],
    tags: [],
    hasDiscount: false,
    shipping: []
  });

  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter popover states
  const [openFilterPopovers, setOpenFilterPopovers] = useState<Record<string, boolean>>({
    sellerType: false,
    priceRange: false,
    trustScore: false,
    trustScoreDisabled: false,
    tags: false,
    discount: false,
    shipping: false
  });

  // Notification state for SafeSphere access attempt
  const [showSafeSphereNotification, setShowSafeSphereNotification] = useState(false);

  // Alert dialog for confirming sphere change
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [pendingSphereChange, setPendingSphereChange] = useState<'safesphere' | 'opensphere' | null>(null);

  // Handle SafeSphere access attempt from unauthenticated user
  useEffect(() => {
    // If paid features are disabled, allow SafeSphere access without login
    if (settings.paidFeaturesDisabled) {
      return;
    }

    if (activeSphere === 'safesphere' && !user) {
      // Show notification instead of silently redirecting
      setShowSafeSphereNotification(true);

      // Still set the sphere to opensphere in state
      setActiveSphere('opensphere');
      // But don't redirect in the URL yet - we'll let the user decide
    }
  }, [activeSphere, user, queryParams, settings.paidFeaturesDisabled]);

  // Function to handle user decision on the notification
  const handleSafeSphereNotificationAction = (action: 'continue' | 'auth') => {
    if (action === 'auth') {
      // Redirect to auth page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      setLocation(`/auth?returnTo=${returnUrl}`);
    } else {
      // Update URL to reflect opensphere
      const newParams = new URLSearchParams(queryParams);
      newParams.set('sphere', 'opensphere');
      setLocation(`/search?${newParams.toString()}`);
    }
    // Hide the notification
    setShowSafeSphereNotification(false);
  };

  // Query for products
  const { data: allProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', activeSphere, searchQuery, isSuperSafeEnabled, superSafeSettings],
    queryFn: async () => {
      // Build URL with SuperSafe Mode parameters if enabled
      let url = `/api/products?sphere=${activeSphere}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;

      // Add SuperSafe Mode parameters if enabled
      if (isSuperSafeEnabled) {
        url += `&superSafeEnabled=true`;
        if (superSafeSettings.blockGambling) {
          url += `&blockGambling=true`;
        }
        if (superSafeSettings.blockAdultContent) {
          url += `&blockAdultContent=true`;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Filter handler functions
  const toggleFilterPopover = (filterName: string) => {
    setOpenFilterPopovers(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleSellerTypeChange = (type: 'merchant' | 'personal') => {
    const newSellerType = {
      ...filters.sellerType,
      [type]: !filters.sellerType[type]
    };

    setFilters(prev => ({
      ...prev,
      sellerType: newSellerType
    }));

    // Update active filters
    updateActiveFilters('sellerType',
      newSellerType.merchant || newSellerType.personal
    );
  };

  const handlePriceRangeChange = (values: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: values
    }));

    // Only add as active filter if not default range
    updateActiveFilters('priceRange',
      !(values[0] === 0 && values[1] === 50000)
    );
  };

  const handleTrustScoreChange = (values: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      trustScore: values
    }));

    // Only add as active filter if not default range
    updateActiveFilters('trustScore',
      !(values[0] === 0 && values[1] === 100)
    );
  };

  const handleDiscountChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      hasDiscount: checked
    }));

    updateActiveFilters('discount', checked);
  };

  const updateActiveFilters = (filterName: string, isActive: boolean) => {
    if (isActive && !activeFilters.includes(filterName)) {
      setActiveFilters(prev => [...prev, filterName]);
    } else if (!isActive && activeFilters.includes(filterName)) {
      setActiveFilters(prev => prev.filter(f => f !== filterName));
    }
  };

  // Apply all the filters to products
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter(product => {
      // Seller Type filter
      if (filters.sellerType.merchant || filters.sellerType.personal) {
        if (filters.sellerType.merchant && product.sellerType !== 'merchant') return false;
        if (filters.sellerType.personal && product.sellerType !== 'personal') return false;
      }

      // Price Range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;

      // Trust Score filter - only apply if we're in SafeSphere and logged in or paid features are disabled
      if (activeSphere === 'safesphere' && (user || settings.paidFeaturesDisabled)) {
        if (product.trustScore < filters.trustScore[0] || product.trustScore > filters.trustScore[1]) return false;
      }

      // Discount filter
      if (filters.hasDiscount && !product.discount) return false;

      return true;
    });
  }, [allProducts, filters, activeSphere, user]);

  // Apply sphere change
  const applySphereChange = (sphere: 'safesphere' | 'opensphere') => {
    // If switching to OpenSphere, remove any trust score filters
    if (sphere === 'opensphere' && activeFilters.includes('trustScore')) {
      setFilters(prev => ({
        ...prev,
        trustScore: [0, 100]
      }));
      updateActiveFilters('trustScore', false);
    }

    setActiveSphere(sphere);
    const newParams = new URLSearchParams(queryParams);
    newParams.set('sphere', sphere);
    setLocation(`/search?${newParams.toString()}`);
  };

  // Handle confirmation dialog actions
  const handleConfirmSphereChange = () => {
    if (pendingSphereChange) {
      applySphereChange(pendingSphereChange);
    }
    setAlertDialogOpen(false);
    setPendingSphereChange(null);
  };

  // Handle cancellation of sphere change
  const handleCancelSphereChange = () => {
    setAlertDialogOpen(false);
    setPendingSphereChange(null);
  };

  // Update URL when sphere changes
  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    // When paid features are disabled, allow SafeSphere access without login
    if (settings.paidFeaturesDisabled) {
      applySphereChange(sphere);
      return;
    }

    // If trying to access SafeSphere without being logged in, show notification
    if (sphere === 'safesphere' && !user) {
      setShowSafeSphereNotification(true);
      // Don't update URL yet - wait for user's decision in the notification
      return;
    }

    // If SuperSafe Mode is enabled and OpenSphere is blocked, prevent switching to OpenSphere
    if (sphere === 'opensphere' && user && isSuperSafeEnabled && superSafeSettings.blockOpenSphere) {
      toast({
        title: "OpenSphere Blocked",
        description: "OpenSphere access is blocked by your SuperSafe Mode settings.",
        variant: "destructive"
      });
      return;
    }

    // If switching from SafeSphere to OpenSphere, show confirmation dialog
    if (sphere === 'opensphere' && activeSphere === 'safesphere') {
      setPendingSphereChange(sphere);
      setAlertDialogOpen(true);
      return;
    }

    // Otherwise apply the change directly
    applySphereChange(sphere);
  };

  // Save search query to backend
  useEffect(() => {
    if (searchQuery) {
      const saveSearch = async () => {
        try {
          await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: searchQuery,
              timestamp: new Date().toISOString(),
              sphere: activeSphere,
              contentType: "products", // Specify this is a product search
              filters: {},
              // Include SuperSafe Mode settings
              superSafeEnabled: isSuperSafeEnabled,
              superSafeSettings: isSuperSafeEnabled ? superSafeSettings : null,
              userId: user?.id
            })
          });
        } catch (error) {
          console.error('Error saving search query:', error);
        }
      };

      saveSearch();
    }
  }, [searchQuery, activeSphere, isSuperSafeEnabled, superSafeSettings, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Confirmation Dialog for switching from SafeSphere to OpenSphere */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave SafeSphere?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to leave SafeSphere and enter OpenSphere, where listings aren't verified for safety or authenticity.
              OpenSphere may contain unreliable sellers and potentially fraudulent listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSphereChange}>Stay in SafeSphere</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSphereChange} className="bg-warning-500 hover:bg-warning-600">
              I understand, switch to OpenSphere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SafeSphere Access Notification */}
      {showSafeSphereNotification && (
        <Alert className="mb-8 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">SafeSphere requires an account</AlertTitle>
          <AlertDescription>
            <p className="mb-3">SafeSphere contains verified, scam-free listings from trusted sellers. You need to sign in or create an account to access this secure marketplace.</p>
            <div className="flex gap-3 mt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSafeSphereNotificationAction('auth')}
              >
                Sign in / Sign up
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSafeSphereNotificationAction('continue')}
              >
                Continue in OpenSphere
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        {/* DasWos logo and Shopping Engine text */}
        <div className="flex flex-col items-center justify-center mb-4">
          <img
            src="/daswos-logo.png"
            alt="DasWos Logo"
            className="h-auto max-h-16 w-auto mb-1"
          />
          <p className="text-sm text-gray-600 font-medium">Shopping Engine</p>
        </div>

        <SearchBar initialQuery={searchQuery} className="max-w-2xl mx-auto mb-6" />

        <div className="flex flex-row items-center justify-center gap-3 mb-4">
          <FeatureAwareSphereToggle
            activeSphere={activeSphere}
            onChange={handleSphereChange}
          />
          <FeatureAwareSuperSafeToggle />
        </div>

        {/* SafeSphere Info Alert */}
        {activeSphere === 'opensphere' && !user && !showSafeSphereNotification && !settings.paidFeaturesDisabled && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Viewing OpenSphere Results</AlertTitle>
            <AlertDescription>
              <p className="mb-2">You're currently viewing unverified listings in OpenSphere. For verified, scam-free listings, sign in to access SafeSphere.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/auth')}
                className="mt-1"
              >
                Sign in for SafeSphere
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* SafeSphere Success Alert removed as requested */}

        {/* BulkBuy has been moved to its own page */}
      </div>

      {/* Results Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isLoading ? 'Searching...' : `About ${filteredProducts.length || 0} results`}
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          <select
            className="text-sm bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
            onChange={(e) => {
              // Sorting logic can be implemented later
              console.log("Sort by:", e.target.value);
            }}
          >
            <option value="relevance">Relevance</option>
            {/* Only show Trust Score option in SafeSphere with user or when paid features are disabled */}
            {activeSphere === 'safesphere' && (user || settings.paidFeaturesDisabled) && (
              <option value="trustScore">Trust Score</option>
            )}
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex items-center flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-1">Active filters:</span>
          {activeFilters.includes('sellerType') && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Seller Type
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    sellerType: { merchant: false, personal: false }
                  }));
                  updateActiveFilters('sellerType', false);
                }}
              />
            </Badge>
          )}
          {activeFilters.includes('priceRange') && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Price: ${(filters.priceRange[0]/100).toFixed(2)} - ${(filters.priceRange[1]/100).toFixed(2)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    priceRange: [0, 50000]
                  }));
                  updateActiveFilters('priceRange', false);
                }}
              />
            </Badge>
          )}
          {activeFilters.includes('trustScore') && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Trust Score: {filters.trustScore[0]} - {filters.trustScore[1]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    trustScore: [0, 100]
                  }));
                  updateActiveFilters('trustScore', false);
                }}
              />
            </Badge>
          )}
          {activeFilters.includes('discount') && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Has Discount
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    hasDiscount: false
                  }));
                  updateActiveFilters('discount', false);
                }}
              />
            </Badge>
          )}

          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setFilters({
                  sellerType: { merchant: false, personal: false },
                  priceRange: [0, 50000],
                  trustScore: [0, 100],
                  tags: [],
                  hasDiscount: false,
                  shipping: []
                });
                setActiveFilters([]);
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {/* Seller Type Filter */}
        <Popover open={openFilterPopovers.sellerType} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, sellerType: open}))}>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilters.includes('sellerType') ? "default" : "outline"}
              size="sm"
              className="rounded-full flex items-center gap-1"
            >
              Seller Type
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h3 className="font-medium mb-3">Filter by Seller Type</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="merchant"
                  checked={filters.sellerType.merchant}
                  onCheckedChange={() => handleSellerTypeChange('merchant')}
                />
                <Label htmlFor="merchant" className="flex-1 cursor-pointer">
                  Merchant Sellers (Business)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personal"
                  checked={filters.sellerType.personal}
                  onCheckedChange={() => handleSellerTypeChange('personal')}
                />
                <Label htmlFor="personal" className="flex-1 cursor-pointer">
                  Personal Sellers (Individual)
                </Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Range Filter */}
        <Popover open={openFilterPopovers.priceRange} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, priceRange: open}))}>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilters.includes('priceRange') ? "default" : "outline"}
              size="sm"
              className="rounded-full flex items-center gap-1"
            >
              Price Range
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h3 className="font-medium mb-3">Filter by Price Range</h3>
            <div className="space-y-4">
              <div className="pt-6">
                <Slider
                  defaultValue={filters.priceRange}
                  min={0}
                  max={50000}
                  step={500}
                  onValueChange={(value) => handlePriceRangeChange(value as [number, number])}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="border rounded px-2 py-1 w-24 text-center">
                  ${(filters.priceRange[0]/100).toFixed(2)}
                </div>
                <div className="border rounded px-2 py-1 w-24 text-center">
                  ${(filters.priceRange[1]/100).toFixed(2)}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Trust Score Filter - Only available in SafeSphere while logged in or when paid features are disabled */}
        {(activeSphere === 'safesphere' && (user || settings.paidFeaturesDisabled)) ? (
          <Popover open={openFilterPopovers.trustScore} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, trustScore: open}))}>
            <PopoverTrigger asChild>
              <Button
                variant={activeFilters.includes('trustScore') ? "default" : "outline"}
                size="sm"
                className="rounded-full flex items-center gap-1"
              >
                Trust Score
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <h3 className="font-medium mb-3">Filter by Trust Score</h3>
              <div className="space-y-4">
                <div className="pt-6">
                  <Slider
                    defaultValue={filters.trustScore}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleTrustScoreChange(value as [number, number])}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="border rounded px-2 py-1 w-16 text-center">
                    {filters.trustScore[0]}
                  </div>
                  <div className="border rounded px-2 py-1 w-16 text-center">
                    {filters.trustScore[1]}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Popover open={openFilterPopovers.trustScoreDisabled} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, trustScoreDisabled: open}))}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full flex items-center gap-1 opacity-60"
              >
                Trust Score
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <h3 className="font-medium mb-3 text-gray-700">Trust Score Filter Unavailable</h3>
              <div className="text-sm text-gray-600 mb-2">
                {!user ? (
                  <p>You need to be logged in and using SafeSphere to filter by trust score.</p>
                ) : (
                  <p>Trust score filtering is only available in SafeSphere mode.</p>
                )}
              </div>
              {!user && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
                    setLocation(`/auth?returnTo=${returnUrl}`);
                  }}
                >
                  Log in to access
                </Button>
              )}
              {user && activeSphere !== 'safesphere' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handleSphereChange('safesphere')}
                >
                  Switch to SafeSphere
                </Button>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Discount Filter */}
        <Popover open={openFilterPopovers.discount} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, discount: open}))}>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilters.includes('discount') ? "default" : "outline"}
              size="sm"
              className="rounded-full flex items-center gap-1"
            >
              Discount
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h3 className="font-medium mb-3">Filter by Discount</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDiscount"
                checked={filters.hasDiscount}
                onCheckedChange={checked => handleDiscountChange(checked as boolean)}
              />
              <Label htmlFor="hasDiscount" className="flex-1 cursor-pointer">
                Show only items with discounts
              </Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Results */}
      <div>
        {isLoading ? (
          // Loading state
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
        ) : error ? (
          // Error state
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="font-medium">Error loading results</p>
            <p className="text-sm">{(error as Error).message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="bg-gray-100 p-8 rounded-lg inline-block mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              {activeFilters.length > 0
                ? "No products match your current filters. Try adjusting or clearing your filters."
                : `We couldn't find any products matching "${searchQuery}" in ${
                    activeSphere === 'safesphere' ? 'SafeSphere' : 'OpenSphere'
                  }.`
              }
            </p>
            <div className="flex justify-center space-x-4">
              {activeFilters.length > 0 ? (
                <Button
                  variant="default"
                  onClick={() => {
                    setFilters({
                      sellerType: { merchant: false, personal: false },
                      priceRange: [0, 50000],
                      trustScore: [0, 100],
                      tags: [],
                      hasDiscount: false,
                      shipping: []
                    });
                    setActiveFilters([]);
                  }}
                >
                  Clear All Filters
                </Button>
              ) : (
                <>
                  {activeSphere === 'safesphere' && (
                    <button
                      onClick={() => handleSphereChange('opensphere')}
                      className="bg-warning-500 text-white px-4 py-2 rounded hover:bg-warning-600 transition-colors"
                    >
                      Try OpenSphere
                    </button>
                  )}
                  {/* BulkBuy moved to separate page */}
                  <button
                    onClick={() => setLocation('/')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Back to Home
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          // Results
          <div className="mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">RESULTS</h2>
            <div className="mb-8">
              <CarouselSearchResults products={filteredProducts} />
            </div>

            {/* Traditional grid view as fallback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto mt-8">
              {filteredProducts.map((product: Product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          </div>

            {/* Pagination - Static for now */}
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow">
                <a href="#" className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </a>
                <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-primary-600 hover:bg-gray-50">
                  1
                </a>
                <a href="#" className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  2
                </a>
                <a href="#" className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  3
                </a>
                <span className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
                <a href="#" className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  10
                </a>
                <a href="#" className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
