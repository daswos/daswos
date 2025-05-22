import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import AnimatedTrustText from '@/components/animated-trust-text';
import { Check, X, Loader2, Volume2, Sun, Moon, Search, Plus, Image } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import FeatureAwareSphereToggle from '@/components/feature-aware-sphere-toggle';
import FeatureAwareAiSearchToggle from '@/components/feature-aware-ai-search-toggle';
import FeatureAwareSuperSafeToggle from '@/components/feature-aware-super-safe-toggle';
import RobotIcon from '@/components/robot-icon';
import CategoryShoppingDialog from '@/components/category-shopping-dialog';
import SearchIntentPrompt from '@/components/search-intent-prompt';
import ShoppingResults from '@/components/shopping-results';
import InformationResults from '@/components/information-results';
import PhotoSelector from '@/components/photo-selector';
import ResizableImage from '@/components/resizable-image';
import SearchInterface from '@/components/search-interface';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showSearch, setShowSearch] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  // Photo selector state
  const [isPhotoSelectorOpen, setIsPhotoSelectorOpen] = useState(false);
  const [backgroundPhoto, setBackgroundPhoto] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(200);
  const [imageHeight, setImageHeight] = useState<number>(150);
  const [imageX, setImageX] = useState<number>(50);
  const [imageY, setImageY] = useState<number>(100);

  // Load saved background photo and dimensions from localStorage on component mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem('daswos-background-photo');
    const savedWidth = localStorage.getItem('daswos-background-photo-width');
    const savedHeight = localStorage.getItem('daswos-background-photo-height');
    const savedX = localStorage.getItem('daswos-background-photo-x');
    const savedY = localStorage.getItem('daswos-background-photo-y');

    // Only set background photo if it's not the blue background
    if (savedPhoto &&
        !savedPhoto.includes('stock-photo-1.svg') &&
        !savedPhoto.includes('blue-background.svg')) {
      setBackgroundPhoto(savedPhoto);
    } else {
      // If it's the blue background, remove it from localStorage
      localStorage.removeItem('daswos-background-photo');
    }

    if (savedWidth) {
      setImageWidth(parseInt(savedWidth, 10));
    }

    if (savedHeight) {
      setImageHeight(parseInt(savedHeight, 10));
    }

    if (savedX) {
      setImageX(parseInt(savedX, 10));
    }

    if (savedY) {
      setImageY(parseInt(savedY, 10));
    }
  }, []);

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

  // State for SuperSafe
  const [superSafeActive, setSuperSafeActive] = useState(true);
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

  // State for search results
  const [showResults, setShowResults] = useState(false);
  const [selectedResultType, setSelectedResultType] = useState<'shopping' | 'information' | null>(null);

  // Listen for AI mode toggle events and search interface reset
  useEffect(() => {
    // Load initial state from localStorage
    const storedValue = localStorage.getItem('daswos-ai-mode-enabled');
    if (storedValue) {
      setAiModeEnabled(storedValue === 'true');
    }

    const handleAiModeChange = (event: CustomEvent) => {
      setAiModeEnabled(event.detail.enabled);
    };

    const handleResetSearchInterface = (event: CustomEvent) => {
      // Reset all search-related state
      setIsAiConversationActive(false);
      setIsAskingIfShopping(false);
      setConversationHistory([]);
      setCurrentQuery('');
      setAiResponse(null);
      setShowResults(false);
      setSelectedResultType(null);
      setSearchPlaceholder('');
    };

    // Add event listeners
    window.addEventListener('aiModeChanged', handleAiModeChange as EventListener);
    window.addEventListener('resetSearchInterface', handleResetSearchInterface as EventListener);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('aiModeChanged', handleAiModeChange as EventListener);
      window.removeEventListener('resetSearchInterface', handleResetSearchInterface as EventListener);
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

  // Handle photo selection
  const handleSelectPhoto = (photoUrl: string) => {
    setBackgroundPhoto(photoUrl);
    localStorage.setItem('daswos-background-photo', photoUrl);

    // Reset dimensions and position to default when selecting a new photo
    setImageWidth(200);
    setImageHeight(150);
    setImageX(50);
    setImageY(100);
    localStorage.setItem('daswos-background-photo-width', '200');
    localStorage.setItem('daswos-background-photo-height', '150');
    localStorage.setItem('daswos-background-photo-x', '50');
    localStorage.setItem('daswos-background-photo-y', '100');

    toast({
      title: "Background updated",
      description: "Your home page background has been updated.",
    });
  };

  // Handle opening the photo selector
  const handleOpenPhotoSelector = () => {
    setIsPhotoSelectorOpen(true);
  };

  // Handle removing the background photo
  const handleRemoveBackground = () => {
    setBackgroundPhoto(null);
    localStorage.removeItem('daswos-background-photo');
    localStorage.removeItem('daswos-background-photo-width');
    localStorage.removeItem('daswos-background-photo-height');
    localStorage.removeItem('daswos-background-photo-x');
    localStorage.removeItem('daswos-background-photo-y');

    toast({
      title: "Background removed",
      description: "Your home page background has been removed.",
    });
  };

  // Handle image resize
  const handleImageResize = (width: number, height: number) => {
    setImageWidth(width);
    setImageHeight(height);
    localStorage.setItem('daswos-background-photo-width', width.toString());
    localStorage.setItem('daswos-background-photo-height', height.toString());
  };

  // Handle image move
  const handleImageMove = (x: number, y: number) => {
    setImageX(x);
    setImageY(y);
    localStorage.setItem('daswos-background-photo-x', x.toString());
    localStorage.setItem('daswos-background-photo-y', y.toString());
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
    // Determine which result type to show based on the response
    const newResultType = isShopping ? 'shopping' : 'information';
    setSelectedResultType(newResultType);
    setShowResults(true);

    // If AI mode is enabled, continue the conversation
    if (aiModeEnabled) {
      // Determine which engine to use based on the response
      setSearchType(newResultType);

      // Add user's response to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', text: isShopping ? 'Yes' : 'No' }
      ]);

      // Hide the yes/no buttons
      setIsAskingIfShopping(false);

      // Create a response based on the user's choice
      const responseText = isShopping
        ? `I'll help you shop for "${currentQuery}". Here are some products you might like.`
        : `I'll help you find information about "${currentQuery}". Here's what I found.`;

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
      // Hide the yes/no buttons but show results on the same page
      setIsAskingIfShopping(false);
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
      <div
        className="relative bg-[#E0E0E0] dark:bg-[#222222] pt-0 pb-8 flex-grow flex flex-col items-center justify-center"
      >
        {/* Background photo */}
        {backgroundPhoto && (
          <ResizableImage
            src={backgroundPhoto}
            alt="Background"
            initialWidth={imageWidth}
            initialHeight={imageHeight}
            initialX={imageX}
            initialY={imageY}
            minWidth={50}
            minHeight={50}
            maxWidth={400}
            maxHeight={300}
            preserveAspectRatio={false}
            onResize={handleImageResize}
            onMove={handleImageMove}
            className="border border-gray-200 dark:border-gray-700"
          />
        )}

        {/* Search Interface */}
        <div className="w-full flex justify-center items-start flex-grow" style={{ paddingTop: '5vh' }}>
          <SearchInterface
            onSearch={handleInitialSearch}
            aiModeEnabled={aiModeEnabled}
            onToggleAi={(enabled) => setAiModeEnabled(enabled)}
            activeSphere={activeSphere}
            onSphereChange={handleSphereChange}
            superSafeActive={superSafeActive}
            onToggleSuperSafe={(active) => setSuperSafeActive(active)}
            showResults={showResults}
            selectedResultType={selectedResultType}
            searchQuery={currentQuery}
          />
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Content area for AI conversation and search results */}
            <div className="w-full flex flex-col items-center justify-center">

              {/* AI Conversation Area */}
              <div className="w-full max-w-2xl mb-4 relative">
                {isAskingIfShopping ? (
                  <>
                    {/* Semi-transparent backdrop */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>
                    <div className="fixed top-[260px] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                      <SearchIntentPrompt
                      searchQuery={currentQuery}
                      onSelectShopping={() => handleShoppingResponse(true)}
                      onSelectInformation={() => handleShoppingResponse(false)}
                      onCancel={() => {
                        // Reset conversation state
                        setIsAiConversationActive(false);
                        setIsAskingIfShopping(false);
                        setConversationHistory([]);
                        setCurrentQuery('');
                        setAiResponse(null);
                        setShowResults(false);
                        setSelectedResultType(null);
                        // Focus the search input
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }}
                    />
                  </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 items-center w-full">

                    {/* Control buttons for AI conversation */}
                    {aiModeEnabled && isAiConversationActive && !isAskingIfShopping && (
                      <div className="flex justify-between items-center mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-xl">
                        <div className="flex items-center space-x-3">
                          {/* Mode toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              const newType = searchType === 'shopping' ? 'information' : 'shopping';
                              setSearchType(newType);
                              setSelectedResultType(newType);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-xs"
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
                              setShowResults(false);
                              setSelectedResultType(null);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            New search
                          </button>
                        </div>

                        {/* Speak button */}
                        {aiResponse && aiResponse.hasAudio && (
                          <button
                            type="button"
                            onClick={() => speakText(aiResponse.text)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-xs"
                            title="Speak the AI's response"
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Speak
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Results are now handled in the MovableSearchInterface */}

              {/* Removed feature toggles as they're now in the movable search interface */}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Selector Modal */}
      <PhotoSelector
        isOpen={isPhotoSelectorOpen}
        onClose={() => setIsPhotoSelectorOpen(false)}
        onSelectPhoto={handleSelectPhoto}
      />
    </div>
  );
};

export default Home;
