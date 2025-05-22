import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search, Bot, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// AI mode storage key
const AI_MODE_STORAGE_KEY = 'daswos-ai-mode-enabled';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onAiSearch?: (query: string) => Promise<any>;
  isBulkBuy?: boolean;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  className = '',
  placeholder = 'What are you looking for?',
  onSearch,
  onAiSearch,
  isBulkBuy = false,
  isLoading = false
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [, setLocation] = useLocation();
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [isAiConversationActive, setIsAiConversationActive] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ text: string; hasAudio: boolean } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load AI mode state from localStorage and setup event listener
  useEffect(() => {
    const storedValue = localStorage.getItem(AI_MODE_STORAGE_KEY);
    if (storedValue) {
      setAiModeEnabled(storedValue === 'true');
    }

    // Listen for AI mode changes
    const handleAiModeChange = (event: any) => {
      const isEnabled = event.detail?.enabled;
      setAiModeEnabled(isEnabled);

      // Reset AI conversation when mode is toggled off
      if (!isEnabled) {
        setIsAiConversationActive(false);
        setAiResponse(null);
      }
    };

    window.addEventListener('aiModeChanged', handleAiModeChange);

    return () => {
      window.removeEventListener('aiModeChanged', handleAiModeChange);
    };
  }, []);

  // Focus the input when AI mode is enabled
  useEffect(() => {
    if (aiModeEnabled && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [aiModeEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (aiModeEnabled && onAiSearch) {
      // AI-enhanced search
      setIsAiConversationActive(true);

      try {
        const response = await onAiSearch(query);
        setAiResponse(response);
      } catch (error) {
        console.error('Error during AI search:', error);
        setAiResponse({
          text: 'Sorry, I encountered an error. Please try again.',
          hasAudio: false
        });
      }
    } else {
      // Regular search
      if (onSearch) {
        onSearch(query);
      } else {
        // Default behavior - navigate to search page
        setLocation(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  // Text-to-speech function for AI responses
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`max-w-2xl mx-auto w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2 w-full">
        <div className="relative flex w-full">
          <input
            type="text"
            placeholder={aiModeEnabled
              ? isAiConversationActive
                ? aiResponse?.text || "Waiting for AI response..."
                : `Ask Daswos about ${isBulkBuy ? 'bulk items' : 'anything'}...`
              : placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-[#222222] focus:outline-none ${
              aiModeEnabled ? 'border-blue-300 focus-visible:ring-blue-400' : ''
            }`}
            ref={searchInputRef}
          />
          <button
            type="submit"
            className="border border-l-0 px-4 search-button bg-white dark:bg-[#333333] border-gray-300 dark:border-gray-600"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : aiModeEnabled ? (
              <Bot className="h-5 w-5 text-blue-500" />
            ) : (
              <Search className="h-5 w-5 text-black dark:text-white" />
            )}
          </button>
        </div>

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
  );
};

export default SearchBar;
