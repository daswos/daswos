import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, ShieldCheck, Bot, Check, X, ArrowLeft } from 'lucide-react';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import CollaborativeSearchCard from '@/components/collaborative-search-card';
import CountdownCard from '@/components/art-exhibition/countdown-card';

// Define props for the category page template
interface CategoryPageTemplateProps {
  categoryId: string;
  categoryName: string;
  categoryDescription?: string;
  categoryColor?: string;
  showCollaborativeSearch?: boolean;
  showArtExhibition?: boolean;
}

const CategoryPageTemplate: React.FC<CategoryPageTemplateProps> = ({
  categoryId,
  categoryName,
  categoryDescription = 'Find exactly what you need in our trusted marketplace',
  categoryColor = '#6A7FDB',
  showCollaborativeSearch = false,
  showArtExhibition = false,
}) => {
  const [, setLocation] = useLocation();
  // Using showSearch directly as a constant since we always want to show it
  const showSearch = true;

  // Get the sphere from URL params if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const sphereParam = urlParams.get('sphere') as 'safesphere' | 'opensphere' | null;

  // Use SafeSphere by default, or use the value from URL if it's valid
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    sphereParam === 'opensphere' ? 'opensphere' : 'safesphere'
  );

  // AI mode state from local storage
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  // State for the AI conversation flow
  const [isAskingIfShopping, setIsAskingIfShopping] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Listen for AI mode toggle events
  useEffect(() => {
    // Load initial state from localStorage
    const storedValue = localStorage.getItem('daswos-ai-mode-enabled');
    if (storedValue) {
      setAiModeEnabled(storedValue === 'true');
    }

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

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const query = searchInput.value.trim();

    if (!query) return;

    // AI mode enabled, check if user is shopping
    if (aiModeEnabled && !isAskingIfShopping) {
      setCurrentQuery(query);
      setIsAskingIfShopping(true);
      return;
    }

    // If already asking if shopping or AI mode is disabled, perform the search
    const searchUrl = `/search?q=${encodeURIComponent(query)}&sphere=${activeSphere}&category=${categoryId}`;
    setLocation(searchUrl);
  };

  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);
  };

  // Handle the yes/no response to "Are you shopping?" question
  const handleShoppingResponse = (isShopping: boolean) => {
    if (isShopping) {
      // User is shopping, redirect to unified search
      const searchUrl = `/unified-search?q=${encodeURIComponent(currentQuery)}&sphere=${activeSphere}&category=${categoryId}`;
      setLocation(searchUrl);
    } else {
      // User is not shopping, redirect to information search
      const searchUrl = `/information-search?q=${encodeURIComponent(currentQuery)}&category=${categoryId}`;
      setLocation(searchUrl);
    }

    // Reset the shopping question state
    setIsAskingIfShopping(false);
  };

  return (
    <div>
      <Helmet>
        <title>{categoryName} | Daswos</title>
        <meta name="description" content={categoryDescription} />
      </Helmet>
      <div className="flex flex-col items-center py-6 px-4 overflow-hidden relative bg-[#E0E0E0] min-h-screen">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => setLocation('/enhanced-d-list')}
            className="flex items-center justify-center w-8 h-8 bg-[#e0e0e0] dark:bg-[#333333] border border-gray-400 dark:border-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded-md"
            aria-label="Back to categories"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-6 mt-8">
          <div className="flex items-center justify-center mb-2">
            <DasWosLogo size={24} className="mr-2" />
            <h1 className="text-xl font-bold">{categoryName}</h1>
          </div>

          <p className="text-center text-sm text-gray-700 mb-8 max-w-lg">
            {categoryDescription}
          </p>

          {/* Top search bar removed to avoid duplication */}

          {/* Large prominent exhibition button */}
          {showArtExhibition && (
            <div className="w-full max-w-lg mb-4">
              <button
                onClick={() => handleNavigation('/art-exhibition')}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-md flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Visit Virtual Art Exhibition
              </button>
            </div>
          )}

          {showSearch && (
            <div className="w-full max-w-lg">
              <form onSubmit={handleSearch} className="relative">
                <div className={`flex items-center border rounded-lg
                  ${aiModeEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                >
                  <input
                    type="text"
                    id="search-input"
                    className={`flex-1 p-2 rounded-l-lg outline-none
                      ${aiModeEnabled ? 'bg-blue-50 placeholder-blue-500' : 'bg-white'}`}
                    placeholder={aiModeEnabled ? "Ask Daswos..." : `Search for ${categoryName.toLowerCase()}...`}
                  />
                  <button
                    type="submit"
                    className={`p-2 rounded-r-lg
                      ${aiModeEnabled ? 'bg-blue-50 text-blue-500' : 'bg-white text-gray-500'}`}
                  >
                    {aiModeEnabled ? <Bot className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </button>
                </div>
              </form>

              {/* AI "Are you shopping?" question */}
              {isAskingIfShopping && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium mb-2">Are you shopping?</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white"
                      onClick={() => handleShoppingResponse(true)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white"
                      onClick={() => handleShoppingResponse(false)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center mt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="safesphere-toggle"
                    className="sr-only"
                    checked={activeSphere === 'safesphere'}
                    onChange={() => handleSphereChange('safesphere')}
                  />
                  <label
                    htmlFor="safesphere-toggle"
                    className="flex items-center cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                    <span className="text-xs font-medium">SafeSphere</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 w-full max-w-lg">
            {showCollaborativeSearch && (
              <div className="mb-6">
                <CollaborativeSearchCard
                  linkTo="/collaborative-search"
                />
              </div>
            )}

            {showArtExhibition && (
              <div
                className="mb-6 cursor-pointer"
                onClick={() => handleNavigation('/art-exhibition')}
              >
                <CountdownCard
                  exhibitionTitle="Spring Art Exhibition 2025"
                  exhibitionDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)} // 2 days from now
                  exhibitionDescription="Join our exclusive virtual art exhibition featuring selected artists and unique pieces available for bidding."
                  maxAttendees={250}
                />
              </div>
            )}

            {/* Navigation bar removed - now using global navigation bar */}

            {/* Art Exhibition Button - only shown if showArtExhibition is true */}
            {showArtExhibition && (
              <button
                className="w-full mt-4 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-md flex items-center justify-center gap-2"
                onClick={() => handleNavigation('/art-exhibition')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Visit Virtual Art Exhibition
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPageTemplate;