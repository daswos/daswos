import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const AppliancesPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="appliances"
      title="Appliances"
      description="Find home appliances large and small from trusted sellers and brands."
      color="#91FF6B"
      icon="A"
    />
  );
};

export default AppliancesPage;