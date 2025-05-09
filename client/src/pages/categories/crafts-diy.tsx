import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import CategoryPageWithShopping from '@/components/category-page-with-shopping';
import ArtCollaborativeSearch from '@/components/art-collaborative-search';

const CraftsDiyPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <CategoryPageWithShopping
      categoryId="crafts"
      categoryName="Crafts & DIY"
      categoryDescription="Discover crafting supplies and DIY materials from trusted sellers in our verified marketplace."
      categoryColor="#FF6B6B"
      itemCount={89}
      jobCount={28}
    >
      {/* Collaborative Search Section */}
      <div className="w-full max-w-4xl mt-6">
        <ArtCollaborativeSearch />
      </div>

      {/* Quick Links */}
      <div className="w-full max-w-4xl mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-auto py-3 flex flex-col items-center"
          onClick={() => navigate('/search?category=crafts')}
        >
          <span className="text-lg mb-1">🔍</span>
          <span>Browse All Crafts</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-3 flex flex-col items-center"
          onClick={() => navigate('/list-item?category=crafts')}
        >
          <span className="text-lg mb-1">+</span>
          <span>Sell Craft Items</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-3 flex flex-col items-center"
          onClick={() => navigate('/browse-jobs?category=art-design')}
        >
          <span className="text-lg mb-1">💼</span>
          <span>Craft Jobs</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-3 flex flex-col items-center"
          onClick={() => navigate('/collaborative-search?topic=crafts')}
        >
          <Users className="h-5 w-5 mb-1" />
          <span>All Research</span>
        </Button>
      </div>
    </CategoryPageWithShopping>
  );
};

export default CraftsDiyPage;