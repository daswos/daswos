import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Search, ShieldCheck, Bot, ArrowLeft, Check, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DasWosLogo from '@/components/daswos-logo';
import ArtCollaborativeSearch from '@/components/art-collaborative-search';
import CategoryShoppingDialog from '@/components/category-shopping-dialog';

const ArtPaintingsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>('safesphere');
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [isAskingIfShopping, setIsAskingIfShopping] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load AI mode from localStorage
  useEffect(() => {
    const storedValue = localStorage.getItem('daswos-ai-mode-enabled');
    if (storedValue) {
      setAiModeEnabled(storedValue === 'true');
    }
  }, []);

  // Handle initial search - always ask if shopping regardless of AI mode
  const handleInitialSearch = (query: string) => {
    if (!query?.trim()) return;

    // Save the query for later use
    setCurrentQuery(query);

    // Display the "Are you shopping?" question
    setIsAskingIfShopping(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    handleInitialSearch(searchQuery);
  };

  // Handle the yes/no response to "Are you shopping?" question
  const handleShoppingResponse = (isShopping: boolean) => {
    if (isShopping) {
      // User is shopping, redirect to shopping engine
      const searchUrl = `/shopping-engine?q=${encodeURIComponent(currentQuery)}&sphere=${activeSphere}&category=art`;
      navigate(searchUrl);
    } else {
      // User is not shopping, redirect to search engine
      const searchUrl = `/search-engine?q=${encodeURIComponent(currentQuery)}&sphere=${activeSphere}&category=art`;
      navigate(searchUrl);
    }

    // Reset the shopping question state
    setIsAskingIfShopping(false);
  };

  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);
  };

  const toggleAiMode = () => {
    setAiModeEnabled(!aiModeEnabled);
    // Save to localStorage for persistence
    localStorage.setItem('daswos-ai-mode-enabled', (!aiModeEnabled).toString());

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('aiModeChanged', {
      detail: { enabled: !aiModeEnabled }
    });
    window.dispatchEvent(event);
  };

  return (
    <div>
      <Helmet>
        <title>Art & Paintings | Daswos</title>
        <meta name="description" content="Find and purchase authentic artwork from trusted sellers in our verified marketplace." />
      </Helmet>

      <div className="flex flex-col items-center py-6 px-4 overflow-hidden relative min-h-screen">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/enhanced-d-list')}
            className="flex items-center justify-center w-8 h-8 bg-[#e0e0e0] dark:bg-[#333333] border border-gray-400 dark:border-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded-md"
            aria-label="Back to categories"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Header section */}
        <div className="flex flex-col items-center mb-6 mt-8 w-full max-w-4xl">
          <div className="flex items-center justify-center mb-2">
            <DasWosLogo size={24} className="mr-2" />
            <h1 className="text-xl font-bold">Art & Paintings</h1>
          </div>

          <p className="text-center text-sm text-gray-700 mb-6 max-w-lg">
            Find and purchase authentic artwork from trusted sellers in our verified marketplace.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              <span className="text-sm font-medium">156 items</span>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              <span className="text-sm font-medium">42 jobs</span>
            </div>
          </div>

          {/* Search */}
          <div className="w-full max-w-lg mb-6">
            {isAskingIfShopping ? (
              <CategoryShoppingDialog
                query={currentQuery}
                onYes={() => handleShoppingResponse(true)}
                onNo={() => handleShoppingResponse(false)}
                onCancel={() => {
                  setIsAskingIfShopping(false);
                  setSearchQuery('');
                }}
              />
            ) : (
              <form onSubmit={handleSubmit} className="relative">
                <div className={`flex items-center border rounded-lg
                  ${aiModeEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                >
                  <input
                    type="text"
                    className={`flex-1 p-2 rounded-l-lg outline-none
                      ${aiModeEnabled ? 'bg-blue-50 placeholder-blue-500' : 'bg-white'}`}
                    placeholder={aiModeEnabled ? "Ask Daswos..." : "Search for art & paintings..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
            )}

            <div className="flex items-center justify-between mt-2">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ai-mode-toggle"
                  className="sr-only"
                  checked={aiModeEnabled}
                  onChange={toggleAiMode}
                />
                <label
                  htmlFor="ai-mode-toggle"
                  className="flex items-center cursor-pointer"
                >
                  <Bot className="h-4 w-4 mr-1 text-blue-600" />
                  <span className="text-xs font-medium">Daswos AI</span>
                </label>
              </div>
            </div>
          </div>

          {/* Collaborative Search Section */}
          <div className="w-full max-w-4xl mt-6">
            <ArtCollaborativeSearch />
          </div>

          {/* Quick Links */}
          <div className="w-full max-w-4xl mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col items-center"
              onClick={() => navigate('/search?category=art')}
            >
              <Search className="h-5 w-5 mb-1" />
              <span>Browse All Art</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col items-center"
              onClick={() => navigate('/list-item?category=art')}
            >
              <span className="text-lg mb-1">+</span>
              <span>Sell Your Art</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col items-center"
              onClick={() => navigate('/browse-jobs?category=art-design')}
            >
              <span className="text-lg mb-1">💼</span>
              <span>Art Jobs</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col items-center"
              onClick={() => navigate('/collaborative-search?topic=art')}
            >
              <Users className="h-5 w-5 mb-1" />
              <span>All Research</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtPaintingsPage;