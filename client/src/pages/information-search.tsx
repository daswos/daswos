import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, AlertCircle, X, BookOpen, ExternalLink } from 'lucide-react';
import SearchBar from '@/components/search-bar';
import SphereToggle from '@/components/sphere-toggle';
import { InformationContent } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrustScore } from '@/components/trust-score';

// Helper function to parse query params
const useQueryParams = () => {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1] || '');
};

// Filter types
type FilterState = {
  category: string[];
  sourceType: {
    website: boolean;
    academic: boolean;
    government: boolean;
    news: boolean;
    other: boolean;
  };
  trustScore: [number, number];
  sourceVerified: boolean;
};

const InfoCard: React.FC<{ info: InformationContent }> = ({ info }) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg mr-2">{info.title}</CardTitle>
          <TrustScore score={info.trustScore} className="flex-shrink-0" />
        </div>
        <CardDescription className="flex items-center gap-1">
          <span className="capitalize">{info.sourceType}</span>
          {info.sourceVerified && (
            <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200">
              Verified
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 line-clamp-3 mb-2">{info.summary}</p>
        {info.imageUrl && (
          <div className="relative h-32 mb-3 bg-slate-100 rounded-md overflow-hidden">
            <img 
              src={info.imageUrl} 
              alt={info.title} 
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {info.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {info.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{info.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 pb-3">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-gray-500">
            From: {info.sourceName}
          </span>
          <Button size="sm" variant="outline" className="gap-1" asChild>
            <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer">
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const InformationSearch: React.FC = () => {
  const queryParams = useQueryParams();
  const searchQuery = queryParams.get('q') || '';
  // Get the sphere from URL params
  const sphereParam = queryParams.get('sphere');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { settings } = useAdminSettings();
  
  // Only allow safesphere or opensphere in the information search
  // If sphere is explicitly set in URL, use that value
  // Otherwise default to safesphere when user is logged in (since user preference is safesphere by default)
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    sphereParam ? 
      (sphereParam === 'safesphere' ? 'safesphere' : 'opensphere') : 
      (user ? 'safesphere' : 'opensphere')
  );
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    sourceType: {
      website: false,
      academic: false,
      government: false,
      news: false,
      other: false
    },
    trustScore: [0, 100],
    sourceVerified: false
  });
  
  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Filter popover states
  const [openFilterPopovers, setOpenFilterPopovers] = useState<Record<string, boolean>>({
    category: false,
    sourceType: false,
    trustScore: false,
    trustScoreDisabled: false,
    sourceVerified: false
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
      setLocation(`/information?${newParams.toString()}`);
    }
    // Hide the notification
    setShowSafeSphereNotification(false);
  };

  // Query for information content
  const { data: allInformation = [], isLoading, error } = useQuery<InformationContent[]>({
    queryKey: ['/api/information', activeSphere, searchQuery],
    queryFn: async () => {
      const url = `/api/information?sphere=${activeSphere}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch information');
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
  
  const handleCategoryChange = (category: string) => {
    const newCategories = [...filters.category];
    const index = newCategories.indexOf(category);
    
    if (index === -1) {
      newCategories.push(category);
    } else {
      newCategories.splice(index, 1);
    }
    
    setFilters(prev => ({
      ...prev,
      category: newCategories
    }));
    
    updateActiveFilters('category', newCategories.length > 0);
  };
  
  const handleSourceTypeChange = (type: 'website' | 'academic' | 'government' | 'news' | 'other') => {
    const newSourceType = {
      ...filters.sourceType,
      [type]: !filters.sourceType[type]
    };
    
    setFilters(prev => ({
      ...prev,
      sourceType: newSourceType
    }));
    
    // Update active filters
    const isActive = Object.values(newSourceType).some(Boolean);
    updateActiveFilters('sourceType', isActive);
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
  
  const handleSourceVerifiedChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sourceVerified: checked
    }));
    
    updateActiveFilters('sourceVerified', checked);
  };
  
  const updateActiveFilters = (filterName: string, isActive: boolean) => {
    if (isActive && !activeFilters.includes(filterName)) {
      setActiveFilters(prev => [...prev, filterName]);
    } else if (!isActive && activeFilters.includes(filterName)) {
      setActiveFilters(prev => prev.filter(f => f !== filterName));
    }
  };
  
  // Apply all the filters to information content
  const filteredInformation = React.useMemo(() => {
    return allInformation.filter(info => {
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(info.category)) {
        return false;
      }
      
      // Source Type filter
      const selectedSourceTypes = Object.entries(filters.sourceType)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type);
        
      if (selectedSourceTypes.length > 0 && !selectedSourceTypes.includes(info.sourceType)) {
        return false;
      }
      
      // Trust Score filter - only apply if we're in SafeSphere and logged in or paid features are disabled
      if (activeSphere === 'safesphere' && (user || settings.paidFeaturesDisabled)) {
        if (info.trustScore < filters.trustScore[0] || info.trustScore > filters.trustScore[1]) {
          return false;
        }
      }
      
      // Source Verified filter
      if (filters.sourceVerified && !info.sourceVerified) {
        return false;
      }
      
      return true;
    });
  }, [allInformation, filters, activeSphere, user, settings.paidFeaturesDisabled]);

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
    
    // Otherwise apply the change directly
    applySphereChange(sphere);
  };
  
  // Apply sphere change
  const applySphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);
    const newParams = new URLSearchParams(queryParams);
    newParams.set('sphere', sphere);
    setLocation(`/information?${newParams.toString()}`);
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
              contentType: "information", // Specify this is an information search
              filters: {}
            })
          });
        } catch (error) {
          console.error('Error saving search query:', error);
        }
      };

      saveSearch();
    }
  }, [searchQuery, activeSphere]);

  // Get unique categories for filters
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    allInformation.forEach(info => {
      uniqueCategories.add(info.category);
    });
    return Array.from(uniqueCategories).sort();
  }, [allInformation]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SafeSphere Access Notification */}
      {showSafeSphereNotification && (
        <Alert className="mb-8 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">SafeSphere requires an account</AlertTitle>
          <AlertDescription>
            <p className="mb-3">SafeSphere contains verified, high-quality information from trusted sources. You need to sign in or create an account to access this secure content environment.</p>
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
        <SearchBar initialQuery={searchQuery} className="max-w-2xl mx-auto mb-6" />
        
        <SphereToggle 
          activeSphere={activeSphere} 
          onChange={handleSphereChange} 
          className="mb-4"
        />
        
        {/* SafeSphere Info Alert */}
        {activeSphere === 'opensphere' && !user && !showSafeSphereNotification && !settings.paidFeaturesDisabled && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Viewing OpenSphere Results</AlertTitle>
            <AlertDescription>
              <p className="mb-2">You're currently viewing unverified information in OpenSphere. For verified, high-quality information, sign in to access SafeSphere.</p>
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
      </div>

      {/* Results Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isLoading ? 'Searching...' : `About ${filteredInformation.length || 0} results`}
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Information Type:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 px-3"
            onClick={() => setLocation('/search' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''))}
          >
            <BookOpen className="h-4 w-4" />
            Switch to Products
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex items-center flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-1">Active filters:</span>
          
          {activeFilters.includes('category') && filters.category.length > 0 && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Categories: {filters.category.join(', ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    category: []
                  }));
                  updateActiveFilters('category', false);
                }}
              />
            </Badge>
          )}
          
          {activeFilters.includes('sourceType') && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Source Type
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    sourceType: {
                      website: false,
                      academic: false,
                      government: false,
                      news: false,
                      other: false
                    }
                  }));
                  updateActiveFilters('sourceType', false);
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
          
          {activeFilters.includes('sourceVerified') && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Verified Sources Only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    sourceVerified: false
                  }));
                  updateActiveFilters('sourceVerified', false);
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
                  category: [],
                  sourceType: {
                    website: false,
                    academic: false,
                    government: false,
                    news: false,
                    other: false
                  },
                  trustScore: [0, 100],
                  sourceVerified: false
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
        {/* Category Filter */}
        <Popover open={openFilterPopovers.category} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, category: open}))}>
          <PopoverTrigger asChild>
            <Button 
              variant={activeFilters.includes('category') ? "default" : "outline"} 
              size="sm" 
              className="rounded-full flex items-center gap-1"
            >
              Category
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 max-h-80 overflow-y-auto">
            <h3 className="font-medium mb-3">Filter by Category</h3>
            <div className="flex flex-col gap-2">
              {categories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={filters.category.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`} className="flex-1 cursor-pointer capitalize">
                    {category}
                  </Label>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">No categories available.</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Source Type Filter */}
        <Popover open={openFilterPopovers.sourceType} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, sourceType: open}))}>
          <PopoverTrigger asChild>
            <Button 
              variant={activeFilters.includes('sourceType') ? "default" : "outline"} 
              size="sm" 
              className="rounded-full flex items-center gap-1"
            >
              Source Type
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h3 className="font-medium mb-3">Filter by Source Type</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="source-website" 
                  checked={filters.sourceType.website}
                  onCheckedChange={() => handleSourceTypeChange('website')}
                />
                <Label htmlFor="source-website" className="flex-1 cursor-pointer">
                  Website
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="source-academic" 
                  checked={filters.sourceType.academic}
                  onCheckedChange={() => handleSourceTypeChange('academic')}
                />
                <Label htmlFor="source-academic" className="flex-1 cursor-pointer">
                  Academic
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="source-government" 
                  checked={filters.sourceType.government}
                  onCheckedChange={() => handleSourceTypeChange('government')}
                />
                <Label htmlFor="source-government" className="flex-1 cursor-pointer">
                  Government
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="source-news" 
                  checked={filters.sourceType.news}
                  onCheckedChange={() => handleSourceTypeChange('news')}
                />
                <Label htmlFor="source-news" className="flex-1 cursor-pointer">
                  News
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="source-other" 
                  checked={filters.sourceType.other}
                  onCheckedChange={() => handleSourceTypeChange('other')}
                />
                <Label htmlFor="source-other" className="flex-1 cursor-pointer">
                  Other
                </Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Source Verified Filter */}
        <Popover open={openFilterPopovers.sourceVerified} onOpenChange={open => setOpenFilterPopovers(prev => ({...prev, sourceVerified: open}))}>
          <PopoverTrigger asChild>
            <Button 
              variant={activeFilters.includes('sourceVerified') ? "default" : "outline"} 
              size="sm" 
              className="rounded-full flex items-center gap-1"
            >
              Verified Sources
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <h3 className="font-medium mb-3">Filter by Source Verification</h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="verified-sources" 
                checked={filters.sourceVerified}
                onCheckedChange={(checked) => handleSourceVerifiedChange(!!checked)}
              />
              <Label htmlFor="verified-sources" className="flex-1 cursor-pointer">
                Show only verified sources
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Verified sources have been confirmed for accuracy and reliability.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Display */}
      {isLoading ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        // Error state
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load information content. Please try again later.
          </AlertDescription>
        </Alert>
      ) : filteredInformation.length === 0 ? (
        // Empty state
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No information found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            We couldn't find any information matching your search criteria.
            Try adjusting your filters or search with different keywords.
          </p>
          {activeFilters.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  category: [],
                  sourceType: {
                    website: false,
                    academic: false,
                    government: false,
                    news: false,
                    other: false
                  },
                  trustScore: [0, 100],
                  sourceVerified: false
                });
                setActiveFilters([]);
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        // Results grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInformation.map((info) => (
            <InfoCard key={info.id} info={info} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InformationSearch;