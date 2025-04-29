import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryShoppingDialogProps {
  query: string;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
}

const CategoryShoppingDialog: React.FC<CategoryShoppingDialogProps> = ({
  query,
  onYes,
  onNo,
  onCancel
}) => {
  console.log('Rendering CategoryShoppingDialog with query:', query);
  return (
    <div className="mt-4 p-6 bg-blue-700 text-white border border-blue-800 rounded-lg">
      <h3 className="text-lg font-medium mb-2 text-center">Are you shopping?</h3>
      <p className="text-center mb-4">You searched for: <strong>{query}</strong></p>
      <div className="flex space-x-4 justify-center">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600"
          onClick={onYes}
        >
          <Check className="h-4 w-4 mr-2" />
          Yes
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 bg-gray-700 hover:bg-gray-800 text-white border-gray-600 hover:border-gray-700"
          onClick={onNo}
        >
          <X className="h-4 w-4 mr-2" />
          No
        </Button>
      </div>
      <div className="mt-4 text-center">
        <button
          className="text-xs text-blue-300 hover:text-blue-200"
          onClick={onCancel}
        >
          Cancel and start a new search
        </button>
      </div>
    </div>
  );
};

export default CategoryShoppingDialog;
