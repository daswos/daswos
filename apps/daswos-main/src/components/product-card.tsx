import React from 'react';
import { TrustScore } from '@/components/trust-score';
import { TrustBadge } from '@/components/trust-badge';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShoppingBag, UserCheck, ArrowRight, Users, ShoppingCart, Info as InfoIcon } from 'lucide-react';
import { formatPrice, getTrustScoreColor } from '@/lib/utils';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import SplitBulkBuyModal from '@/components/split-bulk-buy-modal';
import { TransparencyButton } from '@/components/transparency-button';
import { useToast } from '@/hooks/use-toast';
import { addItemToLocalCart } from '@/lib/cart-storage';

interface ProductCardProps {
  product: Product;
  viewMode?: 'standard' | 'bulkbuy';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'standard' }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    title,
    description,
    price,
    imageUrl,
    sellerName,
    sellerVerified,
    sellerType,
    trustScore,
    tags,
    shipping,
    originalPrice,
    discount,
    verifiedSince,
    warning,
    bulkMinimumQuantity,
    bulkDiscountRate
  } = product;

  // Use the externally provided viewMode instead of the product's isBulkBuy
  const isBulkBuy = viewMode === 'bulkbuy';

  const borderColor = sellerVerified ? 'border-success-500' : 'border-warning-500';

  const handleBulkBuyAgentClick = () => {
    // Navigate to the bulk buy agent service page
    setLocation('/bulk-buy-agent');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm mb-4 p-4 border-l-4 ${borderColor} animate-fade-in`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/4 lg:w-1/5">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
        <div className="md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-xl font-semibold text-gray-900 hover:underline cursor-pointer"
              onClick={() => setLocation(`/product/${product.id}`)}
            >
              {title}
            </h3>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                {/* Trust Score */}
                <TrustScore score={trustScore} className="mr-3" />

                {/* Verification Badge */}
                <TrustBadge verified={sellerVerified} sellerType={sellerType as 'merchant' | 'personal'} />
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-3">{description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge key={index} variant="tag">{tag}</Badge>
            ))}
          </div>

          {/* Price Section */}
          <div className="mt-4">
            <div className="flex flex-wrap items-baseline mb-2">
              <span className="text-2xl font-bold text-gray-900 mr-2">{formatPrice(price)}</span>
              {originalPrice && (
                <>
                  <span className="line-through text-sm text-gray-500 mr-2">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-sm text-red-500">{discount}% off</span>
                </>
              )}
            </div>
            <span className="text-sm text-gray-500 block mb-3">{shipping}</span>
          </div>

          {/* Seller Info & Action Buttons - Improved layout */}
          <div className="mt-1 space-y-3">
            {/* Seller Info */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`inline-flex items-center ${sellerVerified ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'} px-2 py-1 rounded`}>
                {sellerVerified ? (
                  <>
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-sm truncate">
                      {sellerName} {verifiedSince ? `- Verified Since ${verifiedSince}` : `- Verified ${sellerType === 'personal' ? 'Personal Seller' : 'Seller'}`}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm truncate">{sellerName} - Unverified Seller</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <span className="text-xs text-muted-foreground">Trust Score:</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: getTrustScoreColor(trustScore) }}
                >
                  {trustScore}/100
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <ArrowRight className="h-3.5 w-3.5 mr-1" />
                View Details
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  // First add to local storage for immediate feedback
                  const localCartItem = addItemToLocalCart(product, 1, 'manual');

                  // Invalidate the cart query to refresh the cart data in the header
                  import('@/lib/queryClient').then(module => {
                    const { queryClient } = module;
                    queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
                  });

                  // Show success toast immediately
                  toast({
                    title: "Added to cart",
                    description: `${title} has been added to your cart.`,
                    duration: 3000
                  });

                  // Then try to add to server cart
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
                        console.warn('Server cart add failed, but item was added to local storage:', err);
                      });
                    }
                    return response.json();
                  })
                  .then(data => {
                    console.log('Item successfully added to server cart:', data);
                  })
                  .catch(error => {
                    console.error('Error adding item to server cart (still in local storage):', error);
                  });
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>

          {warning && (
            <div className="mt-2 bg-warning-50 p-2 rounded text-sm text-warning-700 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {/* If product has bulkBuy property but we're in standard view mode, show a notification */}
          {!isBulkBuy && product.isBulkBuy && (
            <div className="mt-2 bg-blue-50 p-2 rounded text-sm text-blue-700 flex items-start">
              <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
              <span>This is also a bulk buy item. Switch to Bulk Buy mode to see special offers.</span>
            </div>
          )}

          {/* BulkBuy Information and Options - Only in BulkBuy Mode */}
          {isBulkBuy && bulkMinimumQuantity && bulkDiscountRate && (
            <div className="mt-2 bg-blue-50 p-2 rounded text-sm text-blue-700">
              <div className="flex items-start">
                <ShoppingBag className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
                <div className="flex-grow">
                  <span className="font-medium">BulkBuy Deal</span>
                  <div className="mt-1">
                    {bulkMinimumQuantity && (
                      <span className="block mb-1">
                        Minimum purchase: {bulkMinimumQuantity} items
                      </span>
                    )}
                    {bulkDiscountRate && (
                      <span className="block mb-2">
                        Bulk discount: {bulkDiscountRate}% off
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* BulkBuy Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  onClick={handleBulkBuyAgentClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Get an Agent
                </Button>

                <SplitBulkBuyModal
                  product={product}
                  buttonClassName="bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                />
              </div>
            </div>
          )}

          {/* Transparency Button - Show in all views */}
          <div className="flex justify-center mt-3">
            <TransparencyButton
              info={{
                name: sellerName || "",
                type: sellerType || "merchant",
                verifiedSince: verifiedSince ? verifiedSince : undefined,
                trustScore: trustScore || 0,
                warning: warning ? warning : undefined,
                contactInfo: `Contact information for ${sellerName}`,
                businessType: sellerType === 'merchant' ? 'Verified Business' : 'Personal Seller',
                registrationNumber: sellerVerified ? 'TRS-4829-VFED' : 'Unverified',
                verificationDetails: sellerVerified
                  ? 'Verified through DasWos Trust Verification Program'
                  : 'Not verified with DasWos Trust Verification Program',
                location: 'On file',
                yearEstablished: verifiedSince || 'Unknown',
                sellerId: product.id // Add the seller ID for reviews
              }}
              sourceType="seller"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
