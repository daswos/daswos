import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const PhotographyPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="photography"
      categoryName="Photography"
      categoryDescription="Browse and purchase professional photography from trusted photographers in our verified marketplace."
      categoryColor="#FF6B6B"
    />
  );
};

export default PhotographyPage;