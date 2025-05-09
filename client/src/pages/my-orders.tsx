import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { ShoppingBag, Package, Check, AlertCircle, Star, MessageSquare } from 'lucide-react';
import { formatDasWosCoins, formatDate } from '@/lib/utils';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ReviewForm from '@/components/review/review-form';
import ReviewDisplay from '@/components/review/review-display';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<string | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);

  // Fetch user orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/user/orders'],
    queryFn: async () => {
      return apiRequest('/api/user/orders', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ['/api/reviews/user'],
    queryFn: async () => {
      return apiRequest('/api/reviews/user', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Handle opening the review form
  const handleOpenReviewForm = (orderId: string) => {
    setSelectedOrderForReview(orderId);
    setReviewFormOpen(true);
  };

  // Handle successful review submission
  const handleReviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/reviews/user'] });
  };

  // Toggle expanded review
  const toggleExpandReview = (orderId: string) => {
    setExpandedReviews(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Check if an order has a review
  const hasReview = (orderId: string) => {
    if (!reviews?.data) return false;
    return reviews.data.some((review: any) => review.orderId === orderId);
  };

  // Get review for an order
  const getReviewForOrder = (orderId: string) => {
    if (!reviews?.data) return null;
    return reviews.data.find((review: any) => review.orderId === orderId);
  };

  // Mock data for development (remove in production)
  const mockOrders = [
    {
      id: '1',
      name: 'Wireless Earbuds',
      description: 'Noise cancelling with long battery life',
      price: 5000,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      purchasedAt: new Date().toISOString(),
      status: 'completed',
      source: 'ai_shopper'
    },
    {
      id: '2',
      name: 'Smart Watch',
      description: 'Fitness tracking and notifications',
      price: 8000,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      purchasedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      source: 'manual'
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      description: 'Waterproof portable speaker',
      price: 4500,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      purchasedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      source: 'ai_shopper'
    }
  ];

  // Use mock data if real data is not available yet
  // Log the API response for debugging
  console.log('Orders API response:', orders);

  // Ensure displayOrders is always an array
  let displayOrders;
  if (Array.isArray(orders)) {
    displayOrders = orders;
  } else if (orders?.data && Array.isArray(orders.data)) {
    displayOrders = orders.data;
  } else if (orders?.orders && Array.isArray(orders.orders)) {
    displayOrders = orders.orders;
  } else if (typeof orders === 'object' && orders !== null) {
    // If orders is an object but not in expected format, try to extract any array property
    const possibleArrays = Object.values(orders).filter(val => Array.isArray(val));
    if (possibleArrays.length > 0) {
      displayOrders = possibleArrays[0];
    } else {
      displayOrders = mockOrders;
    }
  } else {
    displayOrders = mockOrders;
  }

  console.log('Display orders:', displayOrders);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <ShoppingBag className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          View all your orders, including both manual purchases and items bought automatically.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Order History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              All items you've purchased on DasWos.
            </p>
          </div>

          {isLoading ? (
            <div className="p-4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                You haven't made any purchases yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayOrders.map((item: any) => (
                <div key={item.id} className="p-4 flex items-start">
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mr-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <div className="flex items-center">
                        {item.source === 'ai_shopper' ? (
                          <div className="flex items-center">
                            <DasWosCoinIcon className="mr-1" size={14} />
                            <span className="text-sm">{formatDasWosCoins(item.price)}</span>
                          </div>
                        ) : (
                          <span className="text-sm">${(item.price / 100).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-300">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          Purchased {formatDate(item.purchasedAt)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-[10px] px-1 py-0 h-5 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>

                        {!hasReview(item.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-5 text-[10px] px-2"
                            onClick={() => handleOpenReviewForm(item.id)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[10px] px-2 text-blue-600"
                            onClick={() => toggleExpandReview(item.id)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {expandedReviews.includes(item.id) ? 'Hide Review' : 'Show Review'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Display */}
                  {expandedReviews.includes(item.id) && hasReview(item.id) && (
                    <div className="mt-4 ml-20">
                      <ReviewDisplay review={getReviewForOrder(item.id)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Form Dialog */}
      {selectedOrderForReview && (
        <ReviewForm
          orderId={selectedOrderForReview}
          productName={displayOrders.find((item: any) => item.id === selectedOrderForReview)?.name || ''}
          isOpen={reviewFormOpen}
          onClose={() => setReviewFormOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default MyOrders;
