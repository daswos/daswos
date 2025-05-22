import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Star, MessageSquare, ChevronDown, ChevronUp, Package, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewDisplay from '@/components/review/review-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SellerReviewsProps {
  sellerId: string | number;
}

const SellerReviews: React.FC<SellerReviewsProps> = ({ sellerId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<string>('list');
  const reviewsPerPage = 5;

  // Fetch reviews for the seller
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: [`/api/reviews/seller/${sellerId}`],
    queryFn: async () => {
      return apiRequest(`/api/reviews/seller/${sellerId}`, {
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
      reviewText: 'Excellent seller! Fast shipping and item was exactly as described.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      hasPhoto: false
    },
    {
      id: 'rev2',
      userId: 'user456',
      username: 'Jane Smith',
      rating: 4,
      reviewText: 'Good experience overall. The item arrived in good condition but packaging could be better.',
      photoUrl: 'https://via.placeholder.com/300',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      hasPhoto: true
    },
    {
      id: 'rev3',
      userId: 'user789',
      username: 'Alex Johnson',
      rating: 5,
      reviewText: 'Perfect transaction! The seller was very responsive and the item arrived earlier than expected.',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
      hasPhoto: false
    }
  ];

  // Filter, sort and paginate reviews
  const getFilteredAndSortedReviews = () => {
    const reviews = reviewsData?.data?.length > 0 ? reviewsData.data : mockReviews;

    return reviews
      .filter((review: any) => {
        // Filter by rating
        if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
          return false;
        }

        // Filter by search term
        if (searchTerm && !review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())) {
          // Also check product name if available
          const productName = review.productId?.name || '';
          if (!productName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a: any, b: any) => {
        // Sort by date
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        if (sortOrder === 'newest') {
          return dateB - dateA;
        } else if (sortOrder === 'oldest') {
          return dateA - dateB;
        } else if (sortOrder === 'highest') {
          return b.rating - a.rating;
        } else if (sortOrder === 'lowest') {
          return a.rating - b.rating;
        }

        return 0;
      });
  };

  const filteredReviews = getFilteredAndSortedReviews();

  // Paginate reviews
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const displayReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  // Group reviews by product
  const getReviewsByProduct = () => {
    const reviews = reviewsData?.data?.length > 0 ? reviewsData.data : mockReviews;
    const groupedReviews: Record<string, any> = {};

    reviews.forEach((review: any) => {
      // Handle both string IDs and object references
      let productId;
      let productName;
      let productImage;

      if (typeof review.productId === 'string') {
        productId = review.productId;
        productName = 'Unknown Product';
        productImage = undefined;
      } else if (review.productId?._id) {
        productId = review.productId._id;
        productName = review.productId.name || 'Unknown Product';
        productImage = review.productId.imageUrl;
      } else {
        productId = 'unknown';
        productName = 'Unknown Product';
        productImage = undefined;
      }

      if (!groupedReviews[productId]) {
        groupedReviews[productId] = {
          productName,
          productImage,
          reviews: []
        };
      }

      groupedReviews[productId].reviews.push(review);
    });

    return groupedReviews;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium flex items-center text-gray-800">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          Buyer Reviews
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
        <div className="mt-4">
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
          ) : reviewsData?.data?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              This seller has no reviews yet.
            </div>
          ) : (
            <div>
              {/* Rating Summary */}
              <div className="mb-6 p-4 bg-white rounded-md border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold mr-3">{averageRating}</div>
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
                <div className="space-y-2">
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

              {/* View Mode Toggle */}
              <div className="mb-4 p-4 bg-white rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Filter Reviews</h4>
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      className={`px-3 py-1 text-xs ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                      onClick={() => setViewMode('list')}
                    >
                      List View
                    </button>
                    <button
                      className={`px-3 py-1 text-xs ${viewMode === 'product' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                      onClick={() => setViewMode('product')}
                    >
                      By Product
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  {/* Rating Filter */}
                  <Select
                    value={ratingFilter}
                    onValueChange={(value) => setRatingFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  <Select
                    value={sortOrder}
                    onValueChange={(value) => setSortOrder(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters */}
                {(searchTerm || ratingFilter !== 'all' || sortOrder !== 'newest') && (
                  <div className="mt-2 text-right">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No reviews match your filters. Try adjusting your search criteria.
                </div>
              ) : viewMode === 'list' ? (
                <div>
                  <div className="space-y-4 mb-4">
                    {displayReviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-md border border-gray-200 p-4">
                        {/* Product Info */}
                        {review.productId && (
                          <div className="flex items-start mb-3 pb-3 border-b border-gray-100">
                            {review.productId.imageUrl ? (
                              <img
                                src={review.productId.imageUrl}
                                alt={review.productId.name || 'Product'}
                                className="h-12 w-12 object-cover rounded-md mr-3"
                              />
                            ) : (
                              <Package className="h-12 w-12 p-2 bg-gray-100 rounded-md mr-3 text-gray-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium">
                                {review.productId.name || 'Unknown Product'}
                              </div>
                              {review.orderId && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Order #{review.orderId.orderNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <ReviewDisplay review={review} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Product View
                <div>
                  {(() => {
                    const filteredProducts = Object.entries(getReviewsByProduct())
                      .filter(([_, productData]: [string, any]) => {
                        return productData.reviews.some((review: any) => {
                          if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
                            return false;
                          }

                          if (searchTerm && !review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())) {
                            const productName = productData.productName || '';
                            if (!productName.toLowerCase().includes(searchTerm.toLowerCase())) {
                              return false;
                            }
                          }

                          return true;
                        });
                      });

                    if (filteredProducts.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          No reviews match your filters. Try adjusting your search criteria.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6 mb-4">
                        {filteredProducts.map(([productId, productData]: [string, any]) => {
                          const filteredReviews = productData.reviews.filter((review: any) => {
                            if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
                              return false;
                            }

                            if (searchTerm && !review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())) {
                              return false;
                            }

                            return true;
                          });

                          const avgRating = filteredReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / filteredReviews.length;

                          return (
                            <div key={productId} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                              {/* Product Header */}
                              <div className="flex items-start p-4 bg-gray-50 border-b border-gray-200">
                                {productData.productImage ? (
                                  <img
                                    src={productData.productImage}
                                    alt={productData.productName}
                                    className="h-16 w-16 object-cover rounded-md mr-3"
                                  />
                                ) : (
                                  <Package className="h-16 w-16 p-3 bg-gray-100 rounded-md mr-3 text-gray-500" />
                                )}
                                <div>
                                  <div className="font-medium">{productData.productName}</div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
                                  </div>

                                  {/* Average Rating for this product */}
                                  <div className="flex items-center mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Product Reviews */}
                              <div className="divide-y divide-gray-100">
                                {filteredReviews.map((review: any) => (
                                  <div key={review.id} className="p-4">
                                    <ReviewDisplay review={review} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Pagination - only show in list view */}
              {viewMode === 'list' && totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>

                    <div className="flex items-center px-3 text-sm">
                      Page {currentPage} of {totalPages}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
