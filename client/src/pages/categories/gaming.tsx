import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const GamingPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="gaming"
      title="Gaming"
      description="Find video games, consoles, and gaming accessories from trusted sellers."
      color="#5CDBCF"
      icon="G"
    />
  );
};

export default GamingPage;