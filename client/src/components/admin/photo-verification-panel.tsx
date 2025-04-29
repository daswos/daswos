import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Image, 
  User, 
  Calendar, 
  Flag, 
  MessageSquare,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReportedReview {
  id: string;
  userId: {
    _id: string;
    username: string;
  };
  sellerId: string;
  productId: {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
  rating: number;
  reviewText: string;
  photoUrl: string;
  hasPhoto: boolean;
  reported: boolean;
  reportReason: string;
  reportDetails: string;
  reportedAt: string;
  reportedBy: string;
  reportVerified?: boolean;
  createdAt: string;
}

const PhotoVerificationPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<ReportedReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch reported reviews
  const { data: reportedReviews, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/reported-reviews'],
    queryFn: async () => {
      return apiRequest('/api/admin/reported-reviews', {
        method: 'GET',
        credentials: 'include'
      });
    },
    staleTime: 60000, // 1 minute
  });

  const handleVerifyPhoto = async () => {
    if (!selectedReview) return;
    
    setIsProcessing(true);
    
    try {
      const response = await apiRequest(`/api/admin/reviews/verify/${selectedReview.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.success) {
        toast({
          title: 'Photo verified',
          description: 'The photo has been verified successfully.',
          variant: 'default'
        });
        
        // Refetch reported reviews
        queryClient.invalidateQueries({ queryKey: ['/api/admin/reported-reviews'] });
        setIsVerifyDialogOpen(false);
      } else {
        throw new Error(response.message || 'Failed to verify photo');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while verifying the photo',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPhoto = async () => {
    if (!selectedReview) return;
    
    setIsProcessing(true);
    
    try {
      const response = await apiRequest(`/api/admin/reviews/reject/${selectedReview.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rejectionReason
        })
      });
      
      if (response.success) {
        toast({
          title: 'Photo rejected',
          description: 'The photo has been rejected successfully.',
          variant: 'default'
        });
        
        // Refetch reported reviews
        queryClient.invalidateQueries({ queryKey: ['/api/admin/reported-reviews'] });
        setIsRejectDialogOpen(false);
        setRejectionReason('');
      } else {
        throw new Error(response.message || 'Failed to reject photo');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while rejecting the photo',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openVerifyDialog = (review: ReportedReview) => {
    setSelectedReview(review);
    setIsVerifyDialogOpen(true);
  };

  const openRejectDialog = (review: ReportedReview) => {
    setSelectedReview(review);
    setIsRejectDialogOpen(true);
  };

  // Mock data for development
  const mockReportedReviews = [
    {
      id: 'rev1',
      userId: {
        _id: 'user123',
        username: 'JohnDoe'
      },
      sellerId: 'seller456',
      productId: {
        _id: 'prod789',
        name: 'Vintage Camera',
        description: 'A beautiful vintage camera in excellent condition',
        imageUrl: 'https://via.placeholder.com/150'
      },
      rating: 4,
      reviewText: 'Great product, works perfectly!',
      photoUrl: 'https://via.placeholder.com/300',
      hasPhoto: true,
      reported: true,
      reportReason: 'not_item',
      reportDetails: 'This is not the camera I sold. The one I sold was black, not silver.',
      reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reportedBy: 'seller456',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rev2',
      userId: {
        _id: 'user789',
        username: 'JaneSmith'
      },
      sellerId: 'seller123',
      productId: {
        _id: 'prod456',
        name: 'Leather Wallet',
        description: 'Handcrafted leather wallet',
        imageUrl: 'https://via.placeholder.com/150'
      },
      rating: 3,
      reviewText: 'The wallet is okay, but not as described.',
      photoUrl: 'https://via.placeholder.com/300',
      hasPhoto: true,
      reported: true,
      reportReason: 'modified_item',
      reportDetails: 'The wallet in the photo has clearly been damaged after delivery. It was in perfect condition when shipped.',
      reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reportedBy: 'seller123',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Use mock data if real data is not available
  const displayReviews = reportedReviews?.data?.length > 0 ? reportedReviews.data : mockReportedReviews;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reported Review Photos</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading reported photos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 border rounded-lg">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">Error loading reported photos</p>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
        </div>
      ) : displayReviews.length === 0 ? (
        <div className="text-center border rounded-lg py-8">
          <Image className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reported photos to verify</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.productId.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" /> {review.userId.username}
                      <Calendar className="h-4 w-4 ml-2" /> {formatDate(review.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <Flag className="h-3 w-3 mr-1" />
                    Reported
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Review</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm">{review.reviewText}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Reported Photo</h3>
                    <div className="relative">
                      <img
                        src={review.photoUrl}
                        alt="Reported review photo"
                        className="w-full h-48 object-contain bg-gray-100 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Report Details</h3>
                  <div className="bg-red-50 p-3 rounded-md">
                    <div className="flex items-center mb-1">
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {review.reportReason === 'not_item' && 'Not the item sold'}
                        {review.reportReason === 'modified_item' && 'Modified after delivery'}
                        {review.reportReason === 'inappropriate' && 'Inappropriate content'}
                        {review.reportReason === 'other' && 'Other reason'}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">
                        Reported {formatDate(review.reportedAt)}
                      </span>
                    </div>
                    <p className="text-sm">{review.reportDetails}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => openRejectDialog(review)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => openVerifyDialog(review)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verify
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Verify Photo Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Photo</DialogTitle>
            <DialogDescription>
              Confirm that this photo is accurate and should be verified
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="py-4">
              <div className="mb-4">
                <img
                  src={selectedReview.photoUrl}
                  alt="Review photo"
                  className="w-full h-48 object-contain bg-gray-100 rounded-md"
                />
              </div>
              <div className="text-sm">
                <p className="font-medium">Product: {selectedReview.productId.name}</p>
                <p className="text-muted-foreground">Reviewer: {selectedReview.userId.username}</p>
                <p className="text-muted-foreground">Report reason: {selectedReview.reportReason}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyPhoto} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Photo Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Photo</DialogTitle>
            <DialogDescription>
              Confirm that this photo should be rejected
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="py-4">
              <div className="mb-4">
                <img
                  src={selectedReview.photoUrl}
                  alt="Review photo"
                  className="w-full h-48 object-contain bg-gray-100 rounded-md"
                />
              </div>
              <div className="text-sm mb-4">
                <p className="font-medium">Product: {selectedReview.productId.name}</p>
                <p className="text-muted-foreground">Reviewer: {selectedReview.userId.username}</p>
                <p className="text-muted-foreground">Report reason: {selectedReview.reportReason}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  Rejection Reason
                </label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Provide a reason for rejecting this photo"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectPhoto} 
              disabled={isProcessing || !rejectionReason.trim()}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoVerificationPanel;
