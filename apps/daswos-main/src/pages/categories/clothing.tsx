import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const ClothingPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="clothing"
      categoryName="Clothing"
      categoryDescription="Shop clothes for men, women, and children from trusted sellers in our verified marketplace."
      categoryColor="#D95C8E"
    />
  );
};

export default ClothingPage;