import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const HandmadeItemsPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="handmade"
      categoryName="Handmade Items"
      categoryDescription="Discover unique handmade crafts and items from trusted artisan sellers in our verified marketplace."
      categoryColor="#FF6B6B"
    />
  );
};

export default HandmadeItemsPage;