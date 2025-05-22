import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import CarouselSearchResults from '@/components/carousel-search-results';
import { Product } from '@shared/schema';

interface ShoppingResultsProps {
  searchQuery: string;
  sphere: 'safesphere' | 'opensphere';
  className?: string;
}

const ShoppingResults: React.FC<ShoppingResultsProps> = ({
  searchQuery,
  sphere,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products based on search query
  const { data, isLoading: queryLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', searchQuery, sphere],
    queryFn: async () => {
      const response = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&sphere=${sphere}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: !!searchQuery,
  });

  useEffect(() => {
    if (data) {
      setProducts(data);
      setIsLoading(false);
    } else if (!queryLoading) {
      setIsLoading(false);
    }
  }, [data, queryLoading]);

  if (isLoading || queryLoading) {
    return (
      <div className={`w-full flex justify-center items-center py-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full text-center py-8 ${className}`}>
        <p className="text-red-500">Error loading products. Please try again.</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={`w-full text-center py-8 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">No products found for "{searchQuery}".</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-100 dark:bg-gray-800 py-5 px-5 rounded-lg shadow-sm">
        <h2 className="text-base font-semibold mb-4 text-center uppercase">RESULTS FOR "{searchQuery}"</h2>
        <div className="mx-auto max-w-5xl">
          <CarouselSearchResults products={products} />
        </div>
      </div>
    </div>
  );
};

export default ShoppingResults;
