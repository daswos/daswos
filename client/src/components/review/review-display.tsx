import React from 'react';
import { Star, Flag, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';

interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  reviewText: string;
  photoUrl?: string;
  createdAt: string;
  hasPhoto: boolean;
  productId?: {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
  orderId?: {
    orderNumber: string;
    totalAmount: number;
  };
}

interface ReviewDisplayProps {
  review: Review;
  isSeller?: boolean;
  onReportPhoto?: (reviewId: string) => void;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  isSeller = false,
  onReportPhoto
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-sm">{review.username}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">{review.reviewText}</p>
      </div>

      {review.photoUrl && (
        <div className="mt-3">
          <div className="relative">
            <img
              src={review.photoUrl}
              alt="Review photo"
              className="rounded-md max-h-48 object-contain bg-gray-100 dark:bg-gray-800"
            />
            {review.hasPhoto && (
              <Badge className="absolute top-2 left-2 bg-green-100 text-green-800 border-green-200">
                <DasWosCoinIcon className="mr-1" size={12} />
                Verified Photo
              </Badge>
            )}
            {isSeller && (
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onReportPhoto && onReportPhoto(review.id)}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Report Photo
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay;
