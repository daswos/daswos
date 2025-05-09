import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const HealthBeautyPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="health-beauty"
      title="Health & Beauty"
      description="Discover personal care, beauty products, and wellness items from trusted sellers."
      color="#CDFF5C"
      icon="H"
    />
  );
};

export default HealthBeautyPage;