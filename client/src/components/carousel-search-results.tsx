import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/carousel.css';

interface CarouselSearchResultsProps {
  products: Product[];
  title?: string;
  className?: string;
}

const CarouselSearchResults: React.FC<CarouselSearchResultsProps> = ({
  products,
  title,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Calculate visible products based on screen size
  const [visibleCount, setVisibleCount] = useState(3);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    // Update visible products when currentIndex or visibleCount changes
    const endIndex = Math.min(currentIndex + visibleCount, products.length);
    setVisibleProducts(products.slice(currentIndex, endIndex));
  }, [currentIndex, visibleCount, products]);

  const handleNext = () => {
    if (currentIndex + visibleCount < products.length) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Add to cart API call with credentials
    fetch('/api/user/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        source: 'manual'
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Failed to add item to cart');
        });
      }
      return response.json();
    })
    .then(data => {
      // Invalidate the cart query to refresh the cart data in the header
      import('@/lib/queryClient').then(module => {
        const { queryClient } = module;
        queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
      });

      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
        duration: 3000
      });
    })
    .catch(error => {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    });
  };

  const handleViewDetails = (productId: string) => {
    setLocation(`/product/${productId}`);
  };

  // Helper function to get color based on trust score
  const getTrustScoreColor = (score: number): string => {
    if (score >= 90) return '#10B981'; // Green for high trust
    if (score >= 70) return '#2563EB'; // Blue for good trust
    if (score >= 50) return '#F59E0B'; // Yellow for medium trust
    return '#EF4444'; // Red for low trust
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      )}

      <div className="carousel-container relative w-full">
        {/* Navigation buttons */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="carousel-nav-button prev"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex + visibleCount >= products.length}
          className="carousel-nav-button next"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Product carousel */}
        <div className="overflow-hidden mx-10">
          <div className="carousel-track flex justify-center gap-4">
            <AnimatePresence initial={false} custom={direction}>
              {visibleProducts.map((product, index) => {
                const borderColor = product.sellerVerified ? 'border-success-500' : 'border-warning-500';

                return (
                  <motion.div
                    key={`${product.id}-${index}`}
                    custom={direction}
                    initial={{
                      opacity: 0,
                      x: direction > 0 ? 200 : -200
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: direction < 0 ? 200 : -200
                    }}
                    transition={{ duration: 0.3 }}
                    className="carousel-item w-full sm:w-[calc(33.333%-8px)] lg:w-[calc(33.333%-8px)] flex-shrink-0"
                  >
                    <div className="flex flex-col h-full">
                      {/* Product container with image */}
                      <div
                        className="bg-white dark:bg-gray-800 cursor-pointer overflow-hidden"
                        onClick={() => handleViewDetails(product.id)}
                      >
                        <div className="relative h-[180px] w-full overflow-hidden flex items-center justify-center">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="h-auto w-auto max-h-[160px] max-w-[90%] object-contain"
                          />
                        </div>
                      </div>

                      {/* Product info in separate container */}
                      <div className="text-center py-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{product.title}</h3>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatPrice(product.price)}</div>
                      </div>

                      {/* Add to basket button - more rounded */}
                      <Button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-black hover:bg-gray-800 text-white rounded-md py-2 text-xs w-full font-medium"
                        size="sm"
                      >
                        ADD TO BASKET
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselSearchResults;
