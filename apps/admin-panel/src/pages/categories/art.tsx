import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const ArtPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="art"
      categoryName="Art & Paintings"
      categoryDescription="Find and purchase authentic artwork from trusted sellers in our verified marketplace."
      categoryColor="#FF6B6B"
    />
  );
};

export default ArtPage;