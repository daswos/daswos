import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const AudioEquipmentPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="audio-equipment"
      title="Audio Equipment"
      description="Discover high-quality speakers, headphones, and audio gear for professionals and enthusiasts."
      color="#5CD7DB"
      icon="A"
    />
  );
};

export default AudioEquipmentPage;