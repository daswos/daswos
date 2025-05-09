import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const ShoesPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="shoes"
      title="Shoes"
      description="Find footwear for all occasions from trusted sellers and brands."
      color="#D95C6F"
      icon="S"
    />
  );
};

export default ShoesPage;