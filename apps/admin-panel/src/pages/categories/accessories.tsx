import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const AccessoriesPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="accessories"
      title="Accessories"
      description="Browse fashion accessories, jewelry, bags, and more from trusted sellers."
      color="#D95CAD"
      icon="A"
    />
  );
};

export default AccessoriesPage;