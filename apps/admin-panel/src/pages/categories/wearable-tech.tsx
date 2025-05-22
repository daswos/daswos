import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const WearableTechPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="wearable-tech"
      title="Wearable Tech"
      description="Discover smartwatches, fitness trackers, and other wearable technology devices."
      color="#5CD9C5"
      icon="W"
    />
  );
};

export default WearableTechPage;