import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const CollectiblesPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="collectibles"
      categoryName="Collectibles"
      categoryDescription="Explore rare collectibles, memorabilia, and vintage items from enthusiasts and traders in our verified marketplace."
      categoryColor="#AD5CFF"
    />
  );
};

export default CollectiblesPage;