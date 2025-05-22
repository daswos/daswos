import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@shared/schema';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ProductTileProps {
  product: Product;
}

const ProductTile: React.FC<ProductTileProps> = ({ product }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    id,
    title,
    price,
    imageUrl,
    sellerName,
    sellerVerified,
    trustScore,
    description
  } = product;

  const borderColor = sellerVerified ? 'border-success-500' : 'border-warning-500';

  const handleAddToCart = (e: React.MouseEvent) => {
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
        productId: id,
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
        description: `${title} has been added to your cart.`,
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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation(`/product/${id}`);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative w-full h-72 cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Front of card */}
        <div className={`absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 ${borderColor} p-3 flex flex-col`}>
          <div className="flex flex-col mb-2">
            <div className="w-full h-32 flex-shrink-0 mb-2">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">{title}</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="truncate">{sellerName}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <div className="font-bold text-gray-900 dark:text-white">{formatPrice(price)}</div>
            <div className="flex items-center">
              <div className="mr-3 text-sm">
                <span className="font-medium" style={{ color: getTrustScoreColor(trustScore) }}>
                  {trustScore}
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className={`absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 ${borderColor} p-3 flex flex-col rotateY-180`}>
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 flex-shrink-0 mr-2">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">{description}</p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Seller: {sellerName}</span>
              <span className="text-sm font-medium" style={{ color: getTrustScoreColor(trustScore) }}>
                Trust: {trustScore}/100
              </span>
            </div>

            <button
              onClick={handleViewDetails}
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to get color based on trust score
function getTrustScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // Green for high trust
  if (score >= 70) return '#2563EB'; // Blue for good trust
  if (score >= 50) return '#F59E0B'; // Yellow for medium trust
  return '#EF4444'; // Red for low trust
}

export default ProductTile;
