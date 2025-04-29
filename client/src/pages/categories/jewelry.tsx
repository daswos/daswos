import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const JewelryPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="jewelry"
      categoryName="Jewelry"
      categoryDescription="Find beautiful jewelry pieces from trusted artisans and sellers in our verified marketplace."
      categoryColor="#F86CA7"
    />
  );
};

export default JewelryPage;