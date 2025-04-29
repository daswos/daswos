import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const KitchenDiningPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="kitchen-dining"
      title="Kitchen & Dining"
      description="Explore kitchenware, appliances, and dining essentials for your home."
      color="#8FFF6B"
      icon="K"
    />
  );
};

export default KitchenDiningPage;