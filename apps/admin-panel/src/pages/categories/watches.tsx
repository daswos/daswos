import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const WatchesPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="watches"
      title="Watches"
      description="Browse luxury and everyday watches for every style and occasion."
      color="#FF5C8F"
      icon="W"
    />
  );
};

export default WatchesPage;