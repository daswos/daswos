import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const BooksPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="books"
      title="Books"
      description="Find books across all genres from trusted sellers and independent bookshops."
      color="#FFD15C"
      icon="B"
    />
  );
};

export default BooksPage;