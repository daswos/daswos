import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const AutomotivePage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="automotive"
      title="Automotive"
      description="Find car parts, accessories, and automotive tools from trusted sellers."
      color="#8E5CFF"
      icon="A"
    />
  );
};

export default AutomotivePage;