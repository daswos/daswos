import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const MusicPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="music"
      title="Music"
      description="Find instruments, equipment, and music accessories from trusted sellers."
      color="#FF6B5C"
      icon="M"
    />
  );
};

export default MusicPage;