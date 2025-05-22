import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const ElectricalPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="electrical"
      categoryName="Electrical"
      categoryDescription="Browse electrical supplies, components, and tools from trusted sellers in our verified marketplace."
      categoryColor="#6B5CFF"
    />
  );
};

export default ElectricalPage;
