import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { ShoppingBag, Package, Check, AlertCircle, Flag, MessageSquare } from 'lucide-react';
import { formatDasWosCoins, formatDate } from '@/lib/utils';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ReviewDisplay from '@/components/review/review-display';
import ReportReviewModal from '@/components/review/report-review-modal';

const SoldItemsReviews: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReviewForReport, setSelectedReviewForReport] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);

  // Fetch user sold items
  const { data: soldItems, isLoading } = useQuery({
    queryKey: ['/api/user/sold-items'],
    queryFn: async () => {
      return apiRequest('/api/user/sold-items', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Fetch reviews for seller's items
  const { data: reviews } = useQuery({
    queryKey: ['/api/reviews/seller'],
    queryFn: async () => {
      return apiRequest('/api/reviews/seller', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Handle opening the report modal
  const handleOpenReportModal = (reviewId: string) => {
    setSelectedReviewForReport(reviewId);
    setReportModalOpen(true);
  };

  // Handle successful report submission
  const handleReportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/reviews/seller'] });
  };

  // Toggle expanded review
  const toggleExpandReview = (itemId: string) => {
    setExpandedReviews(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Check if an item has reviews
  const hasReviews = (itemId: string) => {
    if (!reviews?.data) return false;
    return reviews.data.some((review: any) => review.itemId === itemId);
  };

  // Get reviews for an item
  const getReviewsForItem = (itemId: string) => {
    if (!reviews?.data) return [];
    return reviews.data.filter((review: any) => review.itemId === itemId);
  };

  // Mock data for development (remove in production)
  const mockSoldItems = [
    {
      id: '1',
      name: 'Vintage Camera',
      description: 'Fully functional vintage film camera',
      price: 12000,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Electronics',
      soldAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      buyerId: 'user123',
      buyerName: 'John Doe'
    },
    {
      id: '3',
      name: 'Antique Desk',
      description: 'Solid wood antique writing desk',
      price: 25000,
      imageUrl: 'https://via.placeholder.com/100',
      category: 'Furniture',
      soldAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      buyerId: 'user456',
      buyerName: 'Jane Smith'
    }
  ];

  // Mock reviews data
  const mockReviews = [
    {
      id: 'rev1',
      itemId: '1',
      userId: 'user123',
      username: 'John Doe',
      rating: 5,
      reviewText: 'Excellent vintage camera! Works perfectly and arrived in great condition.',
      photoUrl: 'https://via.placeholder.com/300',
      createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      hasPhoto: true
    }
  ];

  // Use mock data if real data is not available yet
  let displaySoldItems;
  if (Array.isArray(soldItems)) {
    displaySoldItems = soldItems;
  } else if (soldItems?.data && Array.isArray(soldItems.data)) {
    displaySoldItems = soldItems.data;
  } else if (soldItems?.items && Array.isArray(soldItems.items)) {
    displaySoldItems = soldItems.items;
  } else {
    displaySoldItems = mockSoldItems;
  }

  // Use mock reviews if real data is not available
  if (!reviews?.data) {
    reviews = { data: mockReviews };
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <ShoppingBag className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">Sold Items Reviews</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          View and manage buyer reviews for your sold items. Report misleading photos to earn DasWos coins.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              Sold Items
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Items you've successfully sold on DasWos.
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
          ) : displaySoldItems.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No sold items found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                You haven't sold any items yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displaySoldItems.map((item: any) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start">
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
                          <span className="text-sm">${(item.price / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-300">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            Sold {formatDate(item.soldAt)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="text-[10px] px-1 py-0 h-5 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Sold
                          </Badge>
                          
                          {hasReviews(item.id) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 text-[10px] px-2 text-blue-600"
                              onClick={() => toggleExpandReview(item.id)}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {expandedReviews.includes(item.id) ? 'Hide Reviews' : 'Show Reviews'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reviews Display */}
                  {expandedReviews.includes(item.id) && hasReviews(item.id) && (
                    <div className="mt-4 ml-20">
                      <h4 className="text-sm font-medium mb-2">Buyer Reviews</h4>
                      {getReviewsForItem(item.id).map((review: any) => (
                        <ReviewDisplay 
                          key={review.id} 
                          review={review} 
                          isSeller={true}
                          onReportPhoto={() => handleOpenReportModal(review.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center text-yellow-800 font-medium mb-2">
            <DasWosCoinIcon className="mr-2 text-yellow-600" size={20} />
            <h3 className="text-lg">Earn DasWos Coins by Reporting Misleading Photos</h3>
          </div>
          <p className="text-yellow-700 mb-2">
            If a buyer uploads a photo that doesn't accurately represent the item you sold, you can report it and earn 2 DasWos coins if the report is verified.
          </p>
          <div className="flex items-center text-sm text-yellow-700">
            <Flag className="h-4 w-4 mr-1" />
            <span>Use the "Report Photo" button on reviews with photos to report misleading content.</span>
          </div>
        </div>
      </div>

      {/* Report Review Modal */}
      {selectedReviewForReport && (
        <ReportReviewModal
          reviewId={selectedReviewForReport}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
};

export default SoldItemsReviews;
