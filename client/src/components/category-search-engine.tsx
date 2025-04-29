import React from 'react';
import { useLocation } from 'wouter';
import { Search, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet';
import DasWosLogo from '@/components/daswos-logo';

interface CategorySearchEngineProps {
  title: string;
  description: string;
  category: string;
}

const CategorySearchEngine: React.FC<CategorySearchEngineProps> = ({
  title,
  description,
  category,
}) => {
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple search implementation
  };

  return (
    <div>
      <Helmet>
        <title>{title} | Daswos</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="bg-[#E0E0E0] dark:bg-[#222222] py-6 min-h-screen">
        <div className="container mx-auto px-4 mb-4 relative">
          {/* Back button removed - now using the one in the navigation bar */}
          <div className="flex flex-col items-center mt-8 mb-6">
            <div className="flex items-center mb-2">
              <DasWosLogo height={24} width="auto" />
              <span className="ml-2 text-xl font-bold">{title}</span>
            </div>
            <p className="text-center text-sm text-gray-700 mb-8 max-w-lg">
              {description}
            </p>
            <div className="w-full max-w-md mb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-full border border-gray-300"
                    placeholder={`Search for ${title.toLowerCase()}...`}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none"
                  >
                    <Search className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </form>
              <div className="flex justify-center mt-2">
                <div className="flex items-center text-sm text-green-600">
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  <span>SafeSphere</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySearchEngine;
