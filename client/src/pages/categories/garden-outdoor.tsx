import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const GardenOutdoorPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="garden-outdoor"
      title="Garden & Outdoor"
      description="Find garden tools, outdoor furniture, and landscaping supplies for your outdoor spaces."
      color="#6BFF72"
      icon="G"
    />
  );
};

export default GardenOutdoorPage;