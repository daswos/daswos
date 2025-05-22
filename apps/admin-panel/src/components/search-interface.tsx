import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Sun, Moon, Image, X } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AnimatedTrustText from '@/components/animated-trust-text';
import StatusLabel from '@/components/status-label';
import ShoppingResults from '@/components/shopping-results';
import InformationResults from '@/components/information-results';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  aiModeEnabled?: boolean;
  onToggleAi?: (enabled: boolean) => void;
  activeSphere?: 'safesphere' | 'opensphere';
  onSphereChange?: (sphere: 'safesphere' | 'opensphere') => void;
  superSafeActive?: boolean;
  onToggleSuperSafe?: (active: boolean) => void;
  className?: string;
  showResults?: boolean;
  selectedResultType?: 'shopping' | 'information' | null;
  searchQuery?: string;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  aiModeEnabled = false,
  onToggleAi,
  activeSphere = 'safesphere',
  onSphereChange,
  superSafeActive = false,
  onToggleSuperSafe,
  className = '',
  showResults = false,
  selectedResultType = null,
  searchQuery = ''
}) => {
  // Reference to the container
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentQuery, setCurrentQuery] = useState('');


  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Function to reset search and go to home page
  const resetSearchAndGoHome = () => {
    // Clear the search input
    setCurrentQuery('');
    // Dispatch a custom event to reset the search state in the parent component
    const resetEvent = new CustomEvent('resetSearchInterface', {
      detail: { reset: true }
    });
    window.dispatchEvent(resetEvent);
  };

  // No drag functionality - interface is fixed in position

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      onSearch(currentQuery.trim());
      setCurrentQuery(''); // Clear the input after search
    }
  };



  return (
    <div
      ref={containerRef}
      className={`search-interface ${className}`}
      style={{
        position: 'relative',
        width: '932px', // Fixed width for the search bar
        margin: '0 auto',
        backgroundColor: 'transparent',
        padding: showResults ? '10px 0 0 0' : '15px 0 0 0',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        marginTop: showResults ? '-50px' : '0', // Move up when showing results
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: showResults ? 'auto' : '30vh', // Center vertically when no results
        transform: 'translateX(-40px)' // Shift left to balance the spacing
      }}
    >
      {/* No drag handle needed */}

      {/* Logo and buttons - only shown when no results */}
      {!showResults && (
        <div className="flex flex-col items-center justify-center mb-3">
          <div className="relative inline-block">
            <div className="py-1 flex justify-center">
              <div
                onClick={resetSearchAndGoHome}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                title="Return to home page"
              >
                <DasWosLogo height={40} width="auto" />
              </div>
            </div>

            {/* Animated Trust Heading */}
            <div className="mt-1 mb-2 w-full text-center text-xs">
              <AnimatedTrustText
                sentences={[
                  "Helping you find what you need with confidence."
                ]}
                duration={5000}
              />
            </div>

            {/* Buttons container */}
            <div className="absolute right-[-60px] top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="bg-transparent flex items-center justify-center w-8 h-8 text-xs rounded-full hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search form */}
      <form onSubmit={handleSubmit} className={`flex flex-col space-y-2 px-4 pb-2 ${showResults ? 'mt-0' : ''} w-full`}>
        {showResults && (
          <div className="flex items-center mb-1.5">
            <div
              onClick={resetSearchAndGoHome}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Return to home page"
            >
              <DasWosLogo height={30} width="auto" className="mr-3" />
            </div>
            <div className="flex-1"></div>
            {/* Theme Toggle Button when results are shown */}
            <button
              onClick={toggleTheme}
              className="bg-transparent flex items-center justify-center w-8 h-8 text-xs rounded-full hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        )}
        <div className="relative flex shadow-md rounded-md overflow-hidden w-full max-w-[932px] mx-auto">
          <input
            type="text"
            placeholder={aiModeEnabled ? "Ask Daswos..." : "What are you looking for?"}
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-black dark:text-white text-sm ${
              aiModeEnabled
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-[#222222]'
            } focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-l-md h-[38px]`}
            ref={searchInputRef}
          />
          <button
            type="submit"
            className={`border border-l-0 px-4 search-button rounded-r-md ${
              aiModeEnabled
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800'
                : 'bg-white dark:bg-[#222222] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors h-[38px]`}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Feature buttons */}
        <div className="flex justify-center mt-1.5 space-x-2 w-full max-w-[932px] mx-auto">
          {/* SafeSphere button */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1 ${activeSphere === 'safesphere' ? 'w-[160px]' : 'w-[120px]'} cursor-pointer transition-all duration-200`}
            onClick={() => onSphereChange && onSphereChange(activeSphere === 'safesphere' ? 'opensphere' : 'safesphere')}
          >
            {/* Square checkbox */}
            <div className="w-4 h-4 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
              {activeSphere === 'safesphere' && (
                <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              )}
            </div>

            {/* Shield icon */}
            <svg className="h-3.5 w-3.5 mr-1.5 text-gray-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>

            {/* Text */}
            <span className="text-gray-900 dark:text-gray-100 font-medium text-xs flex-shrink-0 whitespace-nowrap w-[70px]">SafeSphere</span>

            {/* Status label - only shown when active */}
            {activeSphere === 'safesphere' && (
              <span className="ml-auto text-green-500 text-[8px] font-medium w-[55px] text-right pr-1">Protected</span>
            )}
          </div>

          {/* DasWos AI button with dropdown */}
          <div className="relative">
            {/* Main button */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1 ${aiModeEnabled ? 'w-[160px]' : 'w-[120px]'} cursor-pointer transition-all duration-200`}
              onClick={() => onToggleAi && onToggleAi(!aiModeEnabled)}
            >
              {/* Square checkbox */}
              <div className="w-4 h-4 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
                {aiModeEnabled && (
                  <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                )}
              </div>

              {/* TV/Computer icon */}
              <svg className="h-3.5 w-3.5 mr-1.5 text-gray-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
              </svg>

              {/* Text */}
              <span className="text-gray-900 dark:text-gray-100 font-medium text-xs flex-shrink-0 whitespace-nowrap w-[70px]">Daswos AI</span>

              {/* Status label - only shown when active */}
              {aiModeEnabled && (
                <span className="ml-auto text-blue-500 text-[8px] font-medium w-[50px] text-right pr-1">Enabled</span>
              )}
            </div>


            </div>

          {/* SuperSafe button */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1 ${superSafeActive ? 'w-[160px]' : 'w-[120px]'} cursor-pointer transition-all duration-200`}
            onClick={() => onToggleSuperSafe && onToggleSuperSafe(!superSafeActive)}
          >
            {/* Square checkbox */}
            <div className="w-4 h-4 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
              {superSafeActive && (
                <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              )}
            </div>

            {/* Circle check icon */}
            <svg className="h-3.5 w-3.5 mr-1.5 text-gray-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>

            {/* Text */}
            <span className="text-gray-900 dark:text-gray-100 font-medium text-xs flex-shrink-0 whitespace-nowrap w-[70px]">SuperSafe</span>

            {/* Status label - only shown when active */}
            {superSafeActive && (
              <span className="ml-auto text-green-500 text-[8px] font-medium w-[35px] text-right pr-1">Active</span>
            )}
          </div>
        </div>


      </form>

      {/* Search Results */}
      {showResults && selectedResultType && (
        <div className="mt-4 w-full max-w-[932px] mx-auto">
          {selectedResultType === 'shopping' ? (
            <ShoppingResults
              searchQuery={searchQuery}
              sphere={activeSphere}
              className="mt-2"
            />
          ) : (
            <InformationResults
              searchQuery={searchQuery}
              sphere={activeSphere}
              className="mt-2"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
