import React from 'react';
import CategoryPageTemplate from '@/components/category-page-template';

const ComputersPage: React.FC = () => {
  return (
    <CategoryPageTemplate
      categoryId="computers"
      categoryName="Computers"
      categoryDescription="Browse laptops, desktops, and computer accessories from trusted sellers in our verified marketplace."
      categoryColor="#5CD1D9"
    />
  );
};

export default ComputersPage;