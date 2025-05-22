import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const SmartphonesPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="smartphones"
      title="Smartphones"
      description="Find the latest smartphones and accessories from trusted sellers."
      color="#5C8ED9"
      icon="S"
    />
  );
};

export default SmartphonesPage;