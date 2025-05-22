import React from 'react';
import CategorySearchEngine from '@/components/category-search-engine';

const ToolsPage: React.FC = () => {
  return (
    <CategorySearchEngine
      category="tools"
      title="Tools"
      description="Shop hand tools, power tools, and equipment for DIY projects and professionals."
      color="#5C77FF"
      icon="T"
    />
  );
};

export default ToolsPage;