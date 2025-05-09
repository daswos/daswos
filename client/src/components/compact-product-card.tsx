import React from 'react';
import { TrustScore } from '@/components/trust-score';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface CompactProductCardProps {
  product: Product;
}

const CompactProductCard: React.FC<CompactProductCardProps> = ({ product }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    id,
    title,
    price,
    imageUrl,
    sellerName,
    sellerVerified,
    trustScore
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

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-4 ${borderColor} mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
      onClick={() => setLocation(`/product/${id}`)}
    >
      <div className="flex items-center p-3">
        {/* Product Image - Small thumbnail */}
        <div className="w-16 h-16 flex-shrink-0 mr-3">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        
        {/* Product Info - Middle section */}
        <div className="flex-grow min-w-0">
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">{title}</h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="truncate">{sellerName}</span>
            <span className="mx-1">•</span>
            <TrustScore score={trustScore} size="sm" />
          </div>
          <div className="font-bold text-gray-900 dark:text-white">{formatPrice(price)}</div>
        </div>
        
        {/* Action Button - Right side */}
        <div className="ml-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompactProductCard;
