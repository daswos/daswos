import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const ToysGamesPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="toys-games"
      title="Toys & Games"
      description="Explore toys, games, and entertainment for all ages from trusted sellers."
      color="#FFAD5C"
      icon="T"
    />
  );
};

export default ToysGamesPage;