import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const CraftsPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="crafts"
      title="Crafts"
      description="Explore handmade crafts and artisanal items from skilled creators."
      color="#FF5CAD"
      icon="C"
    />
  );
};

export default CraftsPage;