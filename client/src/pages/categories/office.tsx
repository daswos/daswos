import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const OfficePage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="office"
      title="Office"
      description="Find office supplies, furniture, and equipment for your workplace."
      color="#6B5CFF"
      icon="O"
    />
  );
};

export default OfficePage;