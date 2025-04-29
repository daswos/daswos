import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Bot, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BulkBuySearchProps {
  onSearch: (query: string) => void;
  onAiSearch?: (query: string) => Promise<any>;
  className?: string;
}

// AI mode storage key - should match the one in shopping-button.tsx
const AI_MODE_STORAGE_KEY = 'daswos-ai-mode-enabled';

const BulkBuySearch: React.FC<BulkBuySearchProps> = ({ onSearch, onAiSearch, className = '' }) => {
  const [query, setQuery] = useState('');
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

    // Listen for AI mode changes from the floating shopping button
    const handleAiModeChange = (event: any) => {
      const isEnabled = event.detail?.enabled;
      console.log('BulkBuySearch: Received aiModeChanged event:', isEnabled);
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
      console.log('Performing AI-enhanced BulkBuy search for:', query);
      setIsAiConversationActive(true);
      
      try {
        const response = await onAiSearch(query);
        setAiResponse(response);
      } catch (error) {
        console.error('Error during AI BulkBuy search:', error);
        setAiResponse({
          text: 'Sorry, I encountered an error. Please try again.',
          hasAudio: false
        });
      }
    } else {
      // Regular search
      onSearch(query);
    }
  };

  // Text-to-speech function for AI responses
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="flex items-center bg-blue-50 text-blue-700 rounded-lg px-4 py-2 text-sm mb-2">
        <Package className="h-4 w-4 mr-2" />
        <span>Searching only BulkBuy products</span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={aiModeEnabled 
              ? isAiConversationActive 
                ? aiResponse?.text || "Waiting for AI response..."
                : "Ask Daswos about bulk items..."
              : "Search for bulk items..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 ${aiModeEnabled ? 'border-blue-300 focus-visible:ring-blue-400 !bg-blue-50' : '!bg-white'} ${isAiConversationActive ? '!bg-blue-50' : ''}`}
            aria-label="Search for bulk items only"
            ref={searchInputRef}
          />
          <Button type="submit" variant={aiModeEnabled ? "secondary" : "default"}>
            {aiModeEnabled ? (
              <>
                <Bot className="w-4 h-4 mr-2" />
                {isAiConversationActive ? "Respond" : "Ask Daswos"}
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
        
        {/* Optional speech button - Only show if AI mode is active and there's a response */}
        {aiModeEnabled && aiResponse && aiResponse.hasAudio && (
          <div className="flex justify-end">
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

export default BulkBuySearch;