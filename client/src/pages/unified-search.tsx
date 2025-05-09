import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Search, ShoppingBag, Loader2, Bot, Volume2, Check, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import InfoContentCard from '@/components/info-content-card';
import ProductTile from '@/components/product-tile';
import '@/styles/product-tile.css';
import CollaborativeSearchPromo from '@/components/collaborative-search-promo';
import { useSafeSphereContext } from '@/contexts/safe-sphere-context';

const UnifiedSearch = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { isSafeSphere } = useSafeSphereContext();

  // Default to information search
  const [searchType, setSearchType] = useState<'shopping' | 'information'>('information');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // State for collapsible AI chat box - collapsed by default
  const [isAiChatBoxOpen, setIsAiChatBoxOpen] = useState(false);

  // AI mode state
  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  // AI response state
  const [aiResponse, setAiResponse] = useState<{
    text: string;
    imageUrl?: string;
    hasAudio?: boolean;
    relatedItems?: any[];
  } | null>(null);

  // AI loading state
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI conversation history
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'ai' | 'user';
    text: string;
  }>>([]);

  // Original search query to preserve during AI conversation
  const [originalQuery, setOriginalQuery] = useState('');

  // Flag to track if we're in AI conversation mode
  const [isAiConversationActive, setIsAiConversationActive] = useState(false);

  // Dynamic AI question placeholder for the search input
  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  // Reference to the search input field for focusing
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User response for the response form (separate from search field)
  const [userResponse, setUserResponse] = useState('');

  // Reference to the response input field
  const responseInputRef = useRef<HTMLInputElement>(null);

  // Search specific states
  const [isBulkBuy, setIsBulkBuy] = useState(false);

  // Extract search parameters from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    // Make sure the type has a valid value, defaulting to 'information'
    const typeParam = params.get('type');
    const type = (typeParam === 'shopping' || typeParam === 'information')
      ? typeParam as 'shopping' | 'information'
      : 'information';
    const category = params.get('category');
    const bulkBuy = params.get('bulk') === 'true';
    const askShopping = params.get('aiAskShopping') === 'true';

    setSearchQuery(query);
    setSubmittedQuery(query);
    setSearchType(type);
    // Need to handle the case where category could be null
    setSelectedCategory(category || null);
    setIsBulkBuy(bulkBuy);

    // Handle the "Are you shopping?" question flow
    if (askShopping && query) {
      // Enable AI mode for this search
      setAiModeEnabled(true);

      // Set the conversation as active
      setIsAiConversationActive(true);

      // Save original query for later
      setOriginalQuery(query);

      // Add the initial user query to conversation history
      setConversationHistory([
        { role: 'user', text: query }
      ]);

      // Immediately add the AI question to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: 'Are you shopping?' }
      ]);

      // Set placeholder to prompt user to respond to the question
      setSearchPlaceholder("Type 'yes' or 'no'");

      // Clear search query to show placeholder
      setSearchQuery('');

      // Update AI response (will be displayed in UI)
      setAiResponse({
        text: 'Are you shopping?',
        hasAudio: true
      });
    }
  }, []);

  // Check for AI mode from localStorage on initial load
  useEffect(() => {
    const storedValue = localStorage.getItem('daswos-ai-mode-enabled');
    if (storedValue) {
      setAiModeEnabled(storedValue === 'true');
      console.log('UnifiedSearch: AI mode from localStorage:', storedValue === 'true');
    }
  }, []);

  // Listen for AI mode toggle events
  useEffect(() => {
    const handleAiModeChange = (event: CustomEvent) => {
      console.log('UnifiedSearch: Received aiModeChanged event:', event.detail.enabled);
      setAiModeEnabled(event.detail.enabled);
    };

    // Add event listener
    window.addEventListener('aiModeChanged', handleAiModeChange as EventListener);
    console.log('UnifiedSearch: Added aiModeChanged event listener');

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('aiModeChanged', handleAiModeChange as EventListener);
      console.log('UnifiedSearch: Removed aiModeChanged event listener');
    };
  }, []);

  // Update URL when search parameters change
  useEffect(() => {
    if (submittedQuery) {
      const params = new URLSearchParams();
      params.set('q', submittedQuery);
      params.set('type', searchType);

      if (selectedCategory) {
        params.set('category', selectedCategory);
      }

      if (searchType === 'shopping' && isBulkBuy) {
        params.set('bulk', 'true');
      }

      const newPath = `/search?${params.toString()}`;
      window.history.replaceState(null, '', newPath);
    }
  }, [submittedQuery, searchType, selectedCategory, isBulkBuy]);

  // Regular products search query
  const productsQuery = useQuery({
    queryKey: ['/api/products', submittedQuery, isSafeSphere ? 'safesphere' : 'opensphere', isBulkBuy],
    queryFn: async () => {
      let url = `/api/products?q=${encodeURIComponent(submittedQuery)}&sphere=${isSafeSphere ? 'safesphere' : 'opensphere'}`;

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
    enabled: searchType === 'shopping' && !!submittedQuery
  });

  // Information content search query
  const informationQuery = useQuery({
    queryKey: ['/api/information', submittedQuery, selectedCategory],
    enabled: searchType === 'information' && !!submittedQuery
  });

  const handleRegularSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (aiModeEnabled) {
      // When AI mode is active, perform AI-enhanced search
      console.log('Performing AI-enhanced search for:', searchQuery);

      // Check if we're already in an AI conversation
      if (isAiConversationActive) {
        // The user is answering an AI question

        // Record the user's answer in conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', text: searchQuery }
        ]);

        // Fetch AI response for the user's answer
        fetchAiResponse(searchQuery, false);

        // Clear the search input to prepare for the next AI question
        // (The AI question will be set in the fetchAiResponse function)
        setSearchQuery('');
      } else {
        // This is the first search that initiates an AI conversation

        // Save the original query for the search results
        setOriginalQuery(searchQuery);

        // Set the submitted query for search results
        setSubmittedQuery(searchQuery);

        // Start conversation history with the user's initial query
        setConversationHistory([
          { role: 'user', text: searchQuery }
        ]);

        // Mark that we're now in an AI conversation
        setIsAiConversationActive(true);

        // Fetch the first AI response
        fetchAiResponse(searchQuery, true);
      }
    } else {
      // Regular search behavior
      setSubmittedQuery(searchQuery);

      // Clear any existing AI response and conversation history when in regular mode
      setAiResponse(null);
      setConversationHistory([]);
      setIsAiConversationActive(false);
    }
  };

  const handleTypeChange = (value: string) => {
    const newSearchType = value as 'shopping' | 'information';
    setSearchType(newSearchType);

    // Re-submit the search with the new type
    if (searchQuery) {
      setSubmittedQuery(searchQuery);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    // If a category is selected, re-submit the search
    if (searchQuery) {
      setSubmittedQuery(searchQuery);
    }
  };

  // Get search results based on current search type and mode
  const searchResults = searchType === 'shopping'
    ? (productsQuery.data as any[] || [])
    : (informationQuery.data as any[] || []);

  const isLoading = searchType === 'shopping'
    ? productsQuery.isLoading
    : informationQuery.isLoading;

  // Information categories
  const informationCategories = [
    'Technology',
    'Business',
    'Health',
    'Science',
    'Entertainment',
    'Sports'
  ];

  // Speech synthesis function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
      alert('Speech synthesis is not supported in your browser');
    }
  };

  // Handle quick response (Yes/No)
  const handleQuickResponse = (responseType: 'yes' | 'no') => {
    const responseText = responseType === 'yes' ? 'Yes' : 'No';

    // Add user's response to conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', text: responseText }
    ]);

    // Set the user's response in the search input
    setSearchQuery(responseText);

    // Call AI search API with the response
    fetchAiResponse(responseText, false);
  };

  // Handle submitting text response from secondary input field
  // This is now a secondary method, as users should primarily respond in the search bar
  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userResponse.trim()) return;

    // Add user's response to conversation history
    setConversationHistory(prev => [...prev, { role: 'user', text: userResponse }]);

    // Also update the main search field
    setSearchQuery(userResponse);

    // Clear the secondary input field
    setUserResponse('');

    // Call AI search API with the response
    fetchAiResponse(userResponse, false);
  };

  // Helper function to fetch AI response and update search bar with AI's question
  const fetchAiResponse = async (query: string, isInitialSearch: boolean = false) => {
    setIsAiLoading(true);

    try {
      // Check if this is a response to the "Are you shopping?" question
      if (conversationHistory.length === 2 &&
          conversationHistory[1]?.text === 'Are you shopping?' &&
          (query.toLowerCase() === 'yes' || query.toLowerCase() === 'no')) {

        const isShoppingResponse = query.toLowerCase() === 'yes';

        // Set the search type based on the user's response
        // If "yes", use shopping engine; if "no", use information engine
        const newSearchType = isShoppingResponse ? 'shopping' : 'information';
        setSearchType(newSearchType);

        // Update the submitted query to perform the actual search
        setSubmittedQuery(originalQuery);

        // Add a response based on the user's choice
        const responseText = isShoppingResponse
          ? `I'll help you shop for "${originalQuery}". Here are some products that might interest you:`
          : `I'll help you find information about "${originalQuery}". Here's what I found:`;

        const aiResponseData = {
          text: responseText,
          hasAudio: true
        };

        setAiResponse(aiResponseData);

        // Add AI's response to conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'ai', text: responseText }
        ]);

        // Set a new placeholder for any follow-up questions
        const placeholderText = isShoppingResponse
          ? "Ask more about these products..."
          : "Ask for more specific information...";

        setSearchPlaceholder(placeholderText);
        if (searchInputRef.current) {
          searchInputRef.current.placeholder = placeholderText;
        }

        // End loading state
        setIsAiLoading(false);
        return;
      }

      // Regular AI response flow
      const response = await fetch(`/api/ai-search?query=${encodeURIComponent(query)}&type=${searchType}`);

      if (!response.ok) {
        throw new Error(`AI search failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI search response:', data);

      const aiResponseData = {
        text: data.text,
        imageUrl: data.imageUrl,
        hasAudio: true,
        relatedItems: data.relatedItems
      };

      setAiResponse(aiResponseData);

      // For initial search, set results query
      if (isInitialSearch) {
        setSubmittedQuery(query);
      }

      // Add AI's response to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: data.text }
      ]);

      // For the search bar, create a placeholder-style question instead of full text
      // This makes it easier for the user to replace by just typing
      let placeholderQuestion = '';

      // Try to extract a question from the AI response
      const questionMatches = data.text.match(/\b(what|which|where|when|how|who|why).*?\?/i);
      if (questionMatches && questionMatches[0]) {
        // Turn the question into a placeholder style prompt
        const question = questionMatches[0];
        placeholderQuestion = question.replace(/\?/g, '').trim();
        // Convert to placeholder format
        placeholderQuestion = placeholderQuestion.charAt(0).toUpperCase() + placeholderQuestion.slice(1);
      } else {
        // If no question found, create a generic placeholder
        placeholderQuestion = "Type your response here...";
      }

      // Update the placeholder state for React to use
      setSearchPlaceholder(placeholderQuestion);

      // Clear the search field so the placeholder shows and user can type directly
      setSearchQuery('');

      // Also update placeholder directly for immediate effect
      // (React state update might take a cycle to reflect in the DOM)
      if (searchInputRef.current) {
        searchInputRef.current.placeholder = placeholderQuestion;
      }

      // Focus the search input so user can respond immediately
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);

      // Set error message
      const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      setAiResponse({
        text: errorMessage,
        hasAudio: false
      });

      // Add error message to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: errorMessage }
      ]);

      // End AI conversation when there's an error
      setIsAiConversationActive(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">


      <div className="flex flex-col items-center mb-8">
        <Tabs value={searchType} defaultValue="information" onValueChange={handleTypeChange} className="w-full max-w-xl">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="information" className="flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Search Engine
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shopping Engine
            </TabsTrigger>
          </TabsList>

          <div className="w-full">
            <form onSubmit={handleRegularSearch} className="flex flex-col space-y-2 mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={
                    aiModeEnabled
                      ? isAiConversationActive
                        ? searchPlaceholder || "Type your response here..."
                        : "Ask the AI to find what you're looking for..."
                      : (searchType === 'shopping'
                          ? "Search for products..."
                          : "Search for information...")
                  }
                  value={isAiLoading ? '' : searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${aiModeEnabled ? 'border-blue-300 focus-visible:ring-blue-400 !bg-blue-50' : '!bg-white'} ${isAiConversationActive ? '!bg-blue-50' : ''}`}
                  ref={searchInputRef}
                  disabled={isAiLoading}
                />
                {isAiLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-blue-500">Analyzing...</span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                variant={aiModeEnabled ? "secondary" : "default"}
                className="w-full"
              >
                {aiModeEnabled ? (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    {isAiConversationActive ? "Respond" : "Ask Daswos"}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>

              {/* Optional speech button - Only show if AI mode is active and there's a response */}
              {aiModeEnabled && aiResponse && aiResponse.hasAudio && (
                <div className="flex justify-end mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(aiResponse.text)}
                    className="text-blue-600 hover:bg-blue-100 h-7 px-2"
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    <span className="text-xs">Speak</span>
                  </Button>
                </div>
              )}
            </form>
          </div>
        </Tabs>
      </div>

      {/* AI conversation history is maintained in the background but not displayed to the user */}

        {/* Quick response buttons for "Are you shopping?" */}
        {aiModeEnabled &&
         conversationHistory.length === 2 &&
         conversationHistory[1]?.text === 'Are you shopping?' && (
          <div className="flex justify-center gap-4 mt-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
              onClick={() => handleQuickResponse('yes')}
            >
              <Check className="h-4 w-4" />
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-500 text-gray-700 hover:bg-gray-50"
              onClick={() => handleQuickResponse('no')}
            >
              <X className="h-4 w-4" />
              No
            </Button>
          </div>
        )}

      {/* Information Categories - Only shown for information search */}
      {searchType === 'information' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(null)}
            >
              All
            </Button>
            {informationCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Information Search Controls - Collaborative Search promo */}
      {searchType === 'information' && (
        <div className="mb-4">
          {/* Collaborative Search Promo */}
          <CollaborativeSearchPromo />
        </div>
      )}

      {/* Shopping Controls - SafeSphere indicator removed as requested */}

      {/* Search Results */}
      <div>
        {/* Information Search Results */}
        {searchType === 'information' && (
          <div>
            {isLoading ? (
              <div className="mt-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2">Searching information...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">
                  {selectedCategory ? `${selectedCategory} Results` : `Results for "${submittedQuery}"`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((info: any) => (
                    <InfoContentCard key={info.id} content={info} />
                  ))}
                </div>
              </>
            ) : submittedQuery ? (
              <div className="text-center mt-8">
                <p className="text-lg">No information found matching "{submittedQuery}"</p>
                <p className="text-muted-foreground mt-2">Try a different search term or browse categories</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Regular Shopping Results */}
        {searchType === 'shopping' && (
          <div>
            {isLoading ? (
              <div className="mt-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2">Searching products...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">Results for "{submittedQuery}"</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
                  {searchResults.map((product: any) => (
                    <ProductTile
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </>
            ) : submittedQuery ? (
              <div className="text-center mt-8">
                <p className="text-lg">No products found matching "{submittedQuery}"</p>
                <p className="text-muted-foreground mt-2">Try a different search term or browse categories</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSearch;