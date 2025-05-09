import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Award, Share2, Calendar, AlertTriangle,
  ShoppingBag, UserCheck, Users, ShoppingCart, Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafeSphereContext } from '@/contexts/safe-sphere-context';
import { TransparencyButton } from '@/components/transparency-button';
import { TrustScore } from '@/components/trust-score';
import { TrustBadge } from '@/components/trust-badge';
import { formatPrice } from '@/lib/utils';
import SplitBulkBuyModal from '@/components/split-bulk-buy-modal';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import ProductReviews from '@/components/product-reviews';

const ProductDetail = () => {
  const [, params] = useRoute<{ id: string }>('/product/:id');
  const [, navigate] = useLocation();
  const { isSafeSphere } = useSafeSphereContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = params?.id;
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productQuery = useQuery({
    queryKey: ['/api/products', id],
    enabled: !!id
  });

  const handleBack = () => {
    navigate('/search?type=shopping');
  };

  const handleBulkBuyAgentClick = () => {
    navigate('/bulk-buy-agent');
  };

  // Add to cart function
  const handleAddToCart = async () => {
    if (isAddingToCart || !product) return;

    setIsAddingToCart(true);

    try {
      console.log("Adding item to cart:", product.id);

      const response = await fetch('/api/user/cart/add', {
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
      });

      console.log("Cart response status:", response.status);

      const responseText = await response.text();
      console.log("Cart response body:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add item to cart');
      }

      // Invalidate the cart query to refresh the cart count in the header
      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });

      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
        duration: 3000
      });
    } catch (error: any) {
      console.error("Cart error details:", error);
      toast({
        title: "Error",
        description: error.message || "Could not add item to cart",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // If loading
  if (productQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back button removed - now using the one in the navigation bar */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex space-x-2 mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-80 w-full md:w-1/3" />
              <div className="w-full md:w-2/3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If error or not found
  if (productQuery.error || !productQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back button removed - now using the one in the navigation bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Product Not Found</CardTitle>
            <CardDescription>
              The product you are looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-10">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <p className="text-center mb-6">
              This product might have been removed or the URL is incorrect.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleBack}>
                Return to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = productQuery.data as Product | undefined;

  // If product is undefined, we shouldn't destructure it
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back button removed - now using the one in the navigation bar */}
        <Card className="border-l-4 border-warning-500">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-xl font-semibold mb-4">Product not found</p>
              <p className="mb-4">The product you're looking for might have been removed or is temporarily unavailable.</p>
              <Button onClick={handleBack}>Return to Search</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    isBulkBuy,
    bulkMinimumQuantity,
    bulkDiscountRate,
    createdAt
  } = product;

  // Format creation date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown Date';

  const borderColor = sellerVerified ? 'border-success-500' : 'border-warning-500';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button removed - now using the one in the navigation bar */}

      <Card className={`border-l-4 ${borderColor}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.isArray(tags) && tags.map((tag, index) => (
                  <Badge key={index} variant="tag">{tag}</Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="w-full md:w-1/3">
              <img
                src={imageUrl}
                alt={title}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '400px' }}
              />

              {/* Trust indicators */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trust Score:</span>
                  <TrustScore score={trustScore} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification:</span>
                  <TrustBadge verified={sellerVerified} sellerType={sellerType as 'merchant' | 'personal'} />
                </div>
                {isSafeSphere && trustScore >= 80 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 self-start mt-2">
                    SafeSphere Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="w-full md:w-2/3">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{description}</p>
              </div>

              {/* Price Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                  {originalPrice && discount && (
                    <>
                      <span className="line-through text-sm text-gray-500 ml-3">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-sm text-red-500 ml-2">{discount}% off</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">{shipping}</div>
              </div>

              {/* Seller Information */}
              <div className={`p-4 rounded-md mb-6 ${sellerVerified ? 'bg-success-50' : 'bg-warning-50'}`}>
                <div className="flex items-center text-sm">
                  <div className={`flex items-center ${sellerVerified ? 'text-success-700' : 'text-warning-700'}`}>
                    {sellerVerified ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span className="font-medium">
                          {sellerName} {verifiedSince ? `- Verified Since ${verifiedSince}` : `- Verified ${sellerType === 'personal' ? 'Personal Seller' : 'Seller'}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{sellerName} - Unverified Seller</span>
                      </>
                    )}
                  </div>

                  {/* Seller transparency button */}
                  <div className="ml-auto">
                    <TransparencyButton
                      info={{
                        name: sellerName || '',
                        type: sellerType || 'merchant',
                        verifiedSince: verifiedSince === null ? undefined : verifiedSince,
                        trustScore: trustScore || 0,
                        warning: warning === null ? undefined : warning,
                        businessType: sellerType === 'personal' ? 'Individual Seller' : 'Business',
                        location: 'Not provided', // This would come from an expanded product or seller schema
                        yearEstablished: verifiedSince?.split(' ')[0] || 'Unknown',
                        contactInfo: `Contact information for ${sellerName}`,
                        registrationNumber: sellerVerified ? 'TRS-4829-VFED' : 'Unverified',
                        verificationDetails: sellerVerified
                          ? 'Verified through DasWos Trust Verification Program'
                          : 'Not verified with DasWos Trust Verification Program',
                        sellerId: product.id // Add the seller ID for reviews
                      }}
                      sourceType="seller"
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Warning if present */}
              {warning && (
                <div className="mb-6 bg-warning-50 p-4 rounded-md text-sm text-warning-700 flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              )}

              {/* BulkBuy Information */}
              {isBulkBuy && (
                <div className="mb-6 bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                  <div className="flex items-start">
                    <ShoppingBag className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
                    <div className="flex-grow">
                      <span className="font-medium">BulkBuy Deal</span>
                      {bulkMinimumQuantity && (
                        <span className="ml-3">
                          Minimum purchase: {bulkMinimumQuantity} items
                        </span>
                      )}
                      {bulkDiscountRate && (
                        <span className="ml-3">
                          Bulk discount: {bulkDiscountRate}% off
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                {isBulkBuy ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleBulkBuyAgentClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Get an Agent
                    </Button>

                    <SplitBulkBuyModal
                      product={product}
                      buttonClassName="bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                    />
                  </div>
                ) : (
                  <Button variant="outline">
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Extra Product Info */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-medium mb-4">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-500">Listed</h4>
                <p>{formattedDate}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Condition</h4>
                <p>New</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Categories</h4>
                <p>{Array.isArray(tags) ? tags.join(', ') : 'No categories available'}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Shipping</h4>
                <p>{shipping}</p>
              </div>
            </div>
          </div>

          {/* Product Reviews */}
          <ProductReviews productId={product.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;