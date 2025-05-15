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
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onCancel}></div>

      {/* Dialog box */}
      <div className="relative max-w-sm w-full mx-4 p-5 bg-blue-700 text-white border-2 border-blue-500 rounded-lg shadow-2xl animate-fadeIn">
        <h3 className="text-lg font-semibold mb-2 text-center">Are you shopping?</h3>
        <p className="text-sm text-center mb-4">You searched for: <strong>{query}</strong></p>
        <div className="flex space-x-4 justify-center">
          <Button
            size="default"
            variant="outline"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white border-2 border-green-400 hover:border-green-300 font-medium"
            onClick={onYes}
          >
            <Check className="h-4 w-4 mr-2" />
            Yes
          </Button>
          <Button
            size="default"
            variant="outline"
            className="flex-1 bg-gray-700 hover:bg-gray-800 text-white border-2 border-gray-500 hover:border-gray-400 font-medium"
            onClick={onNo}
          >
            <X className="h-4 w-4 mr-2" />
            No
          </Button>
        </div>
        <div className="mt-4 text-center">
          <button
            className="text-sm text-blue-200 hover:text-white underline"
            onClick={onCancel}
          >
            Cancel and start a new search
          </button>
        </div>
    </div>
  </div>
  );
};

export default CategoryShoppingDialog;
