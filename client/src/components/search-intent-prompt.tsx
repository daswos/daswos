import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchIntentPromptProps {
  searchQuery: string;
  onSelectShopping: () => void;
  onSelectInformation: () => void;
  onCancel: () => void;
  className?: string;
}

const SearchIntentPrompt: React.FC<SearchIntentPromptProps> = ({
  searchQuery,
  onSelectShopping,
  onSelectInformation,
  onCancel,
  className = ''
}) => {
  return (
    <div className={`bg-blue-600 text-white p-4 rounded-md shadow-xl w-full max-w-md mx-auto ${className}`}>
      <div className="text-center mb-3">
        <h2 className="text-xl font-semibold mb-1">Are you shopping?</h2>
        <p className="text-sm">You searched for: <span className="font-medium">{searchQuery}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 max-w-sm mx-auto">
        <Button
          onClick={onSelectShopping}
          className="bg-green-500 hover:bg-green-600 text-white py-2 h-auto text-base flex items-center justify-center"
        >
          <Check className="mr-1 h-4 w-4" />
          Yes
        </Button>

        <Button
          onClick={onSelectInformation}
          className="bg-gray-700 hover:bg-gray-800 text-white py-2 h-auto text-base flex items-center justify-center"
        >
          <X className="mr-1 h-4 w-4" />
          No
        </Button>
      </div>

      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-white underline hover:text-blue-100 text-xs"
        >
          Cancel and start a new search
        </button>
      </div>
    </div>
  );
};

export default SearchIntentPrompt;
