import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Star, MessageSquare, ChevronDown, ChevronUp, ThumbsUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ReviewDisplay from '@/components/review/review-display';
import { useAuth } from '@/hooks/use-auth';

interface ProductReviewsProps {
  productId: string | number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch reviews for the product
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: [`/api/reviews/product/${productId}`],
    queryFn: async () => {
      return apiRequest(`/api/reviews/product/${productId}`, {
        method: 'GET',
        credentials: 'include'
      });
    },
    staleTime: 60000, // 1 minute
  });

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviewsData?.data || reviewsData.data.length === 0) return 0;
    
    const totalRating = reviewsData.data.reduce((sum: number, review: any) => sum + review.rating, 0);
    return (totalRating / reviewsData.data.length).toFixed(1);
  };

  // Get rating distribution
  const getRatingDistribution = () => {
    if (!reviewsData?.data || reviewsData.data.length === 0) 
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviewsData.data.forEach((review: any) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    
    return distribution;
  };

  // Calculate percentage for each rating
  const calculatePercentage = (count: number) => {
    if (!reviewsData?.data || reviewsData.data.length === 0) return 0;
    return Math.round((count / reviewsData.data.length) * 100);
  };

  const distribution = getRatingDistribution();
  const averageRating = calculateAverageRating();
  const reviewCount = reviewsData?.data?.length || 0;

  // Mock data for development
  const mockReviews = [
    {
      id: 'rev1',
      userId: 'user123',
      username: 'John Doe',
      rating: 5,
      reviewText: 'Excellent product! Exactly as described and arrived quickly. The quality is outstanding and it works perfectly for my needs.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      hasPhoto: false
    },
    {
      id: 'rev2',
      userId: 'user456',
      username: 'Jane Smith',
      rating: 4,
      reviewText: 'Good product overall. The item arrived in good condition but the packaging could have been better. Works as expected though.',
      photoUrl: 'https://via.placeholder.com/300',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      hasPhoto: true
    },
    {
      id: 'rev3',
      userId: 'user789',
      username: 'Alex Johnson',
      rating: 5,
      reviewText: 'Perfect! The seller was very responsive and the item arrived earlier than expected. Would definitely buy from them again.',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      hasPhoto: false
    }
  ];

  // Use mock data if real data is not available
  const displayReviews = reviewsData?.data?.length > 0 ? reviewsData.data : mockReviews;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div 
        className="flex justify-between items-center cursor-pointer mb-4" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-medium flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          Customer Reviews
        </h3>
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="font-medium">{averageRating}</span>
            <span className="text-gray-500 text-sm ml-1">({reviewCount})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Failed to load reviews. Please try again later.
            </div>
          ) : displayReviews.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">No reviews yet</p>
              <p className="text-sm text-gray-400 mb-4">Be the first to review this product</p>
              {user && (
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              )}
            </div>
          ) : (
            <div>
              {/* Rating Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                  {/* Average Rating */}
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="text-4xl font-bold mr-3">{averageRating}</div>
                    <div>
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(parseFloat(averageRating))
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{reviewCount} reviews</div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <div className="w-8 text-sm text-gray-600">{rating} ★</div>
                        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${calculatePercentage(distribution[rating as keyof typeof distribution])}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-sm text-gray-600 text-right">
                          {distribution[rating as keyof typeof distribution]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {displayReviews.map((review: any) => (
                  <ReviewDisplay key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
