import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = '', className = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 text-black bg-white focus:outline-none"
        />
        <button 
          type="submit"
          className="bg-white border border-gray-300 border-l-0 px-4"
        >
          <Search className="h-5 w-5 text-black" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
