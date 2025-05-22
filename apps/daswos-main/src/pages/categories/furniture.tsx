import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const FurniturePage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="furniture"
      categoryName="Furniture"
      categoryDescription="Browse quality furniture for every room from trusted sellers and designers in our verified marketplace."
      categoryColor="#7CFF6B"
    />
  );
};

export default FurniturePage;