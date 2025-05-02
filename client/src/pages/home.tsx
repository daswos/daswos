import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import AnimatedTrustText from '@/components/animated-trust-text';
import { Search, ShieldCheck, ShoppingCart, Bot, Check, X, Loader2, Volume2, Info, UserIcon, Store as StoreIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FeatureAwareSphereToggle from '@/components/feature-aware-sphere-toggle';
import AutoShopToggle from '@/components/autoshop-toggle';
import FeatureAwareAiSearchToggle from '@/components/feature-aware-ai-search-toggle';
import FeatureAwareSuperSafeToggle from '@/components/feature-aware-super-safe-toggle';
import RobotIcon from '@/components/robot-icon';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showSearch, setShowSearch] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Get the sphere from URL params if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const sphereParam = urlParams.get('sphere') as 'safesphere' | 'opensphere' | null;

  // Use SafeSphere by default, or use the value from URL if it's valid
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    sphereParam === 'opensphere' ? 'opensphere' : 'safesphere'
  );

  // AI mode state from local storage
  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  // State for showing/hiding the AutoShop dropdown - default to true when AI is enabled
  const [showAutoShop, setShowAutoShop] = useState(aiModeEnabled);
  // State for the AI conversation flow
  const [isAskingIfShopping, setIsAskingIfShopping] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isAiConversationActive, setIsAiConversationActive] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ text: string; hasAudio?: boolean } | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [searchType, setSearchType] = useState<'shopping' | 'information'>('information');
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Automatically show AutoShop when AI mode is enabled
  useEffect(() => {
    if (aiModeEnabled) {
      setShowAutoShop(true);
    }
  }, [aiModeEnabled]);

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);

    // Update URL with the selected sphere without navigating
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('sphere', sphere);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get available voices and try to use a natural sounding one
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Samantha')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle initial search - always ask if shopping regardless of AI mode
  const handleInitialSearch = (query: string) => {
    if (!query?.trim()) return;

    // Save the query for later use
    setCurrentQuery(query);

    // Display the "Are you shopping?" question
    setIsAskingIfShopping(true);

    if (aiModeEnabled) {
      // Start the AI conversation only if AI mode is enabled
      setIsAiConversationActive(true);

      // Add user's query to conversation history
      setConversationHistory([{ role: 'user', text: query }]);

      // Add AI's question to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: 'Are you shopping?' }
      ]);

      // Set AI response for potential text-to-speech
      setAiResponse({
        text: 'Are you shopping?',
        hasAudio: true
      });
    }
  };

  // Handle yes/no response to "Are you shopping?" question
  const handleShoppingResponse = (isShopping: boolean) => {
    // If AI mode is enabled, continue the conversation
    if (aiModeEnabled) {
      // Determine which engine to use based on the response
      const newSearchType = isShopping ? 'shopping' : 'information';
      setSearchType(newSearchType);

      // Add user's response to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', text: isShopping ? 'Yes' : 'No' }
      ]);

      // Hide the yes/no buttons
      setIsAskingIfShopping(false);

      // Create a response based on the user's choice
      const responseText = isShopping
        ? `I'll help you shop for "${currentQuery}". What are you looking for specifically?`
        : `I'll help you find information about "${currentQuery}". What would you like to know?`;

      // Add AI's response to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: responseText }
      ]);

      // Set AI response for potential text-to-speech only
      setAiResponse({
        text: responseText,
        hasAudio: true
      });

      // Set direct placeholder questions based on mode
      const placeholderQuestion = isShopping
        ? "What features or specifications are you looking for?"
        : "What would you like to know about this topic?";

      // Update the placeholder
      setSearchPlaceholder(placeholderQuestion);

      // Clear the search field so the placeholder shows
      setCurrentQuery('');

      // Focus the search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      // If AI mode is not enabled, redirect to the appropriate engine page
      if (isShopping) {
        // Redirect to shopping engine
        setLocation(`/shopping-engine?q=${encodeURIComponent(currentQuery)}&sphere=${activeSphere}`);
      } else {
        // Redirect to search engine
        setLocation(`/search-engine?q=${encodeURIComponent(currentQuery)}&sphere=${activeSphere}`);
      }

      // Reset state
      setIsAskingIfShopping(false);
      setCurrentQuery('');
    }
  };

  // Handle AI conversation continuation
  const handleAiConversation = (userQuery: string) => {
    if (!userQuery?.trim()) return;

    // Add user's query to conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', text: userQuery }
    ]);

    // Set loading state
    setIsAiLoading(true);

    // Simulate AI response (in a real app, this would call your API)
    setTimeout(() => {
      // Generate direct follow-up questions based on the search type and query
      let aiResponseText = '';
      let placeholderQuestion = '';

      if (searchType === 'shopping') {
        // Shopping mode follow-up questions
        aiResponseText = `I found some great options for ${userQuery}. Would you like to see products with specific features?`;

        // Rotate between different shopping-related questions
        const shoppingQuestions = [
          `What price range are you looking for?`,
          `Any specific brands you prefer?`,
          `What features are most important to you?`,
          `Do you need it to have any specific specifications?`
        ];
        placeholderQuestion = shoppingQuestions[Math.floor(Math.random() * shoppingQuestions.length)];
      } else {
        // Information mode follow-up questions
        aiResponseText = `Here's some information about ${userQuery}. Is there anything specific you'd like to know?`;

        // Rotate between different information-related questions
        const infoQuestions = [
          `What specific aspect interests you most?`,
          `Would you like to know about the history or background?`,
          `Any specific details you're looking for?`,
          `Do you have any follow-up questions?`
        ];
        placeholderQuestion = infoQuestions[Math.floor(Math.random() * infoQuestions.length)];
      }

      // Add AI's response to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: aiResponseText }
      ]);

      // Set AI response for text-to-speech only
      setAiResponse({
        text: aiResponseText,
        hasAudio: true
      });

      // Update the placeholder
      setSearchPlaceholder(placeholderQuestion);

      // Clear the search field so the placeholder shows
      setCurrentQuery('');

      // End loading state
      setIsAiLoading(false);

      // Focus the search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 1000); // Slightly faster response time
  };

  // Handle search type change (shopping/information toggle)
  useEffect(() => {
    // Only update if we're in an active conversation (not during initial setup)
    if (isAiConversationActive && !isAskingIfShopping) {
      // Generate a new response based on the current context and search type
      const lastUserQuery = conversationHistory.filter(item => item.role === 'user').pop()?.text || currentQuery;

      if (lastUserQuery) {
        // Create a transition message based on the new search type
        const transitionText = searchType === 'shopping'
          ? `I'll switch to shopping mode. Let me find some products related to ${lastUserQuery}.`
          : `I'll switch to information mode. Here's what I know about ${lastUserQuery}.`;

        // Update the AI response for text-to-speech only
        setAiResponse({
          text: transitionText,
          hasAudio: true
        });

        // Add the transition to conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'ai', text: transitionText }
        ]);

        // Update the placeholder with mode-specific questions
        if (searchType === 'shopping') {
          const shoppingPlaceholders = [
            `What's your budget for ${lastUserQuery}?`,
            `Any specific brands or features you want?`,
            `What specifications are important to you?`
          ];
          setSearchPlaceholder(shoppingPlaceholders[Math.floor(Math.random() * shoppingPlaceholders.length)]);
        } else {
          const infoPlaceholders = [
            `What would you like to know about ${lastUserQuery}?`,
            `Any specific details you're interested in?`,
            `What aspect of ${lastUserQuery} interests you most?`
          ];
          setSearchPlaceholder(infoPlaceholders[Math.floor(Math.random() * infoPlaceholders.length)]);
        }
      }
    }
  }, [searchType]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Design with proper dark mode support */}
      <div className="bg-[#E0E0E0] dark:bg-[#222222] pt-16 pb-8 flex-grow flex items-center">
        <div className="container mx-auto px-4 text-center w-full">
          {/* Logo with Theme Toggle */}
          <div className="flex flex-col items-center logo-container">
            <div className="relative inline-block">
              <div className="px-16 py-2">  {/* Reduced vertical padding */}
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
            <div className="mt-0 mb-3">  {/* Removed top margin */}
              <AnimatedTrustText
                sentences={[
                  "The first search engine that puts trust first.",
                  "Helping you find what you need with confidence."
                ]}
                duration={5000} // 5 seconds per sentence
              />
            </div>

            {/* Info Button - Moved from header */}
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

                    <DropdownMenuItem onClick={() => handleNavigation('/features')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <Bot className="mr-2 h-3 w-3" />
                      <span>Features</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNavigation('/trust-score')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <ShieldCheck className="mr-2 h-3 w-3" />
                      <span>Trust & Safety</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNavigation('/shopper-hub')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <UserIcon className="mr-2 h-3 w-3" />
                      <span>For Shoppers</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNavigation('/seller-hub')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <StoreIcon className="mr-2 h-3 w-3" />
                      <span>Seller Hub</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNavigation('/about-us')} className="py-1 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded-none flex items-center">
                      <Info className="mr-2 h-3 w-3" />
                      <span>About Us</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-4">
            {isAskingIfShopping ? (
              <div className="text-center">
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">Are you shopping?</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    You searched for: <span className="font-medium">{currentQuery}</span>
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => handleShoppingResponse(true)}
                      variant="outline"
                      className="flex items-center gap-2 border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900"
                    >
                      <Check className="h-4 w-4" />
                      Yes
                    </Button>
                    <Button
                      onClick={() => handleShoppingResponse(false)}
                      variant="outline"
                      className="flex items-center gap-2 border-gray-500 text-gray-700 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-900"
                    >
                      <X className="h-4 w-4" />
                      No
                    </Button>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <button
                      type="button"
                      onClick={() => {
                        // Reset conversation state
                        setIsAiConversationActive(false);
                        setIsAskingIfShopping(false);
                        setConversationHistory([]);
                        setCurrentQuery('');
                        setAiResponse(null);
                        // Focus the search input
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Cancel and start a new search
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                const query = searchInput?.value;
                if (query?.trim()) {
                  if (aiModeEnabled && isAiConversationActive) {
                    // Continue the AI conversation if already active
                    handleAiConversation(query);
                  } else {
                    // Always ask if shopping first, regardless of AI mode
                    handleInitialSearch(query);
                  }
                }
              }} className="flex flex-col space-y-2">
                <div className="relative flex">
                  <input
                    type="text"
                    placeholder={aiModeEnabled
                      ? (isAiConversationActive
                          ? searchPlaceholder || "Type your response here..."
                          : "Ask Daswos...")
                      : "What are you looking for?"}
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-black dark:text-white ${
                      aiModeEnabled
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-[#222222]'
                    } focus:outline-none`}
                    ref={searchInputRef}
                    disabled={isAiLoading}
                  />
                  <button
                    type="submit"
                    className={`border border-l-0 px-4 search-button ${
                      aiModeEnabled
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-[#333333] border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : aiModeEnabled ? (
                      <RobotIcon className="text-blue-600 dark:text-blue-400" size={22} />
                    ) : (
                      <Search className="h-5 w-5 text-black dark:text-white" />
                    )}
                  </button>
                </div>

                {/* Small control buttons below search bar */}
                {aiModeEnabled && isAiConversationActive && !isAskingIfShopping && (
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <div className="flex items-center space-x-3">
                      {/* Mode toggle */}
                      <button
                        type="button"
                        onClick={() => setSearchType(searchType === 'shopping' ? 'information' : 'shopping')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                        title={`Switch to ${searchType === 'shopping' ? 'information' : 'shopping'} mode`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${searchType === 'shopping' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {searchType === 'shopping' ? 'Shopping' : 'Information'} mode
                      </button>

                      {/* New search button */}
                      <button
                        type="button"
                        onClick={() => {
                          // Reset conversation state
                          setIsAiConversationActive(false);
                          setConversationHistory([]);
                          setCurrentQuery('');
                          setAiResponse(null);
                          setSearchPlaceholder('');
                          // Focus the search input
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                      >
                        <X className="h-3 w-3 mr-1" />
                        New search
                      </button>
                    </div>

                    {/* Speak button - only visible when hovering */}
                    {aiResponse && aiResponse.hasAudio && (
                      <button
                        type="button"
                        onClick={() => speakText(aiResponse.text)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center opacity-70 hover:opacity-100"
                        title="Speak the AI's response"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Speak
                      </button>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* SafeSphere toggle, Daswos AI toggle, SuperSafe toggle, and conditional AutoShop button */}
          <div className="flex flex-col items-center justify-center mb-6">
            {/* Main buttons row - always on one line */}
            <div className="flex flex-row items-center justify-center gap-3 mb-2">
              <FeatureAwareSphereToggle
                activeSphere={activeSphere}
                onChange={handleSphereChange}
              />
              <div className="flex flex-col items-center">
                <FeatureAwareAiSearchToggle
                  isEnabled={aiModeEnabled}
                  onToggle={(enabled) => setAiModeEnabled(enabled)}
                  showDropdown={showAutoShop}
                  onDropdownToggle={() => setShowAutoShop(!showAutoShop)}
                />
                {/* AutoShop appears directly under Daswos AI when dropdown is open */}
                {aiModeEnabled && showAutoShop && (
                  <div className="mt-2">
                    <AutoShopToggle />
                  </div>
                )}
              </div>
              <FeatureAwareSuperSafeToggle />
            </div>
          </div>

          {/* Navigation tabs removed to avoid duplication with the bottom navigation bar */}


        </div>
      </div>
    </div>
  );
};

export default Home;
