import React from 'react';
import EnhancedCategoryTemplate from '@/components/enhanced-category-template';

const EnhancedArtPage: React.FC = () => {
  return (
    <EnhancedCategoryTemplate
      categoryId="art"
      categoryName="Art & Paintings"
      categoryDescription="Find and purchase authentic artwork from trusted sellers in our verified marketplace."
      categoryColor="#FF6B6B"
      productCount={156}
    />
  );
};

export default EnhancedArtPage;
