import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';

interface BulkBuySearchProps {
  onSearch: (query: string) => void;
  onAiSearch?: (query: string) => Promise<any>;
  className?: string;
}

const BulkBuySearch: React.FC<BulkBuySearchProps> = ({
  onSearch,
  onAiSearch,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleAiSearch = async () => {
    if (!searchQuery.trim() || !onAiSearch) return;

    setIsAiSearching(true);
    try {
      await onAiSearch(searchQuery);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search for bulk buy opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10"
          />
        </div>
        <Button type="submit" className="shrink-0">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {onAiSearch && (
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={handleAiSearch}
            disabled={isAiSearching}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Search
          </Button>
        )}
      </form>
    </div>
  );
};

export default BulkBuySearch;
