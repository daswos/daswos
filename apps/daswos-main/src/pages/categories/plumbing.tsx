import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const PlumbingPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="plumbing"
      categoryName="Plumbing"
      categoryDescription="Find quality plumbing supplies, fixtures, and tools from trusted sellers in our verified marketplace."
      categoryColor="#5C77FF"
    />
  );
};

export default PlumbingPage;
