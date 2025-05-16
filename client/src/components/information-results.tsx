import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InformationItem {
  id: string;
  title: string;
  content: string;
  source?: string;
  imageUrl?: string;
  category?: string;
}

interface InformationResultsProps {
  searchQuery: string;
  sphere: 'safesphere' | 'opensphere';
  className?: string;
}

const InformationResults: React.FC<InformationResultsProps> = ({
  searchQuery,
  sphere,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [infoItems, setInfoItems] = useState<InformationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch information based on search query
  const { data, isLoading: queryLoading, error } = useQuery<InformationItem[]>({
    queryKey: ['/api/information', searchQuery, sphere],
    queryFn: async () => {
      const response = await fetch(`/api/information?q=${encodeURIComponent(searchQuery)}&sphere=${sphere}`);
      if (!response.ok) {
        throw new Error('Failed to fetch information');
      }
      return response.json();
    },
    enabled: !!searchQuery,
  });

  useEffect(() => {
    if (data) {
      setInfoItems(data);
      setIsLoading(false);
    } else if (!queryLoading) {
      setIsLoading(false);
    }
  }, [data, queryLoading]);

  const handleNext = () => {
    if (currentIndex < infoItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (isLoading || queryLoading) {
    return (
      <div className={`w-full flex justify-center items-center py-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full text-center py-8 ${className}`}>
        <p className="text-red-500">Error loading information. Please try again.</p>
      </div>
    );
  }

  if (!infoItems || infoItems.length === 0) {
    return (
      <div className={`w-full text-center py-8 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">No information found for "{searchQuery}".</p>
      </div>
    );
  }

  const currentItem = infoItems[currentIndex];

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-sm py-4 rounded-lg shadow-sm">
        <h2 className="text-sm font-semibold mb-3 text-center uppercase tracking-wider">Results for "{searchQuery}"</h2>

        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-2 max-w-3xl mx-auto">
          {/* Navigation buttons */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-3 z-10">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full w-6 h-6 p-0 bg-white dark:bg-gray-700 shadow-sm"
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-3 z-10">
            <Button
              onClick={handleNext}
              disabled={currentIndex === infoItems.length - 1}
              className="rounded-full w-6 h-6 p-0 bg-white dark:bg-gray-700 shadow-sm"
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-2">
            <h3 className="text-base font-semibold mb-2 text-center">{currentItem.title}</h3>

            {currentItem.imageUrl && (
              <div className="mb-3 flex justify-center">
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="max-h-32 object-contain rounded-md"
                />
              </div>
            )}

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm">{currentItem.content}</p>
            </div>

            {currentItem.source && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Source: {currentItem.source}
              </div>
            )}
          </div>

          {/* Pagination indicator */}
          <div className="flex justify-center items-center mt-2">
            {infoItems.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 mx-0.5 rounded-full ${
                  index === currentIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationResults;
