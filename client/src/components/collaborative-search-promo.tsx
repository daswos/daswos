import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

/**
 * Collaborative Search Promo Component
 * 
 * A promotional component that appears on the search page to introduce users
 * to the Collaborative Search feature, allowing them to find research partners.
 */
const CollaborativeSearchPromo = () => {
  const [, setLocation] = useLocation();

  const goToCollaborativeSearch = () => {
    setLocation('/collaborative-search');
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-purple-50">
      <div className="flex items-center space-x-2">
        <Users className="h-5 w-5 text-purple-600" />
        <div>
          <h3 className="font-medium text-purple-900">Collaborative Research</h3>
          <p className="text-sm text-purple-700">
            Find research partners and share insights on similar topics through our collaborative search feature
          </p>
        </div>
      </div>
      <Button 
        onClick={goToCollaborativeSearch} 
        className="bg-purple-600 hover:bg-purple-700 text-white flex flex-col py-2 px-4 min-h-[72px] items-center justify-center"
      >
        <Users className="h-4 w-4 mb-1" />
        <span className="text-xs font-medium">Collaborative</span>
        <span className="text-xs font-medium">Search</span>
      </Button>
    </div>
  );
};

export default CollaborativeSearchPromo;