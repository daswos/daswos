import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const HomeDecorPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="home-decor"
      categoryName="Home Decor"
      categoryDescription="Find decorative items and accessories to beautify your living spaces in our verified marketplace."
      categoryColor="#ADFF6B"
    />
  );
};

export default HomeDecorPage;