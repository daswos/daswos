import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const CamerasPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="cameras"
      title="Cameras"
      description="Explore digital cameras, lenses, and photography equipment for every skill level."
      color="#5CE8DB"
      icon="C"
    />
  );
};

export default CamerasPage;