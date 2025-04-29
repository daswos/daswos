import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const SportsPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="sports"
      title="Sports"
      description="Shop sports equipment, clothing, and accessories for all activities."
      color="#FF8E5C"
      icon="S"
    />
  );
};

export default SportsPage;