import React, { useState } from 'react';
import { Star, Upload, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  orderId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  orderId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('rating', rating.toString());
      formData.append('reviewText', reviewText);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Submit review
      const response = await apiRequest('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.success) {
        toast({
          title: "Review submitted",
          description: photoFile
            ? "Thank you for your review! 1 DasWos coin has been added to your account."
            : "Thank you for your review!",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Your Purchase</DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                />
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium">Your Review</label>
            <Textarea
              placeholder="Share your thoughts about this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Add a Photo (Optional)</label>
              <div className="flex items-center text-xs text-green-600">
                <DasWosCoinIcon className="mr-1" size={14} />
                <span>+1 DasWos Coin</span>
              </div>
            </div>

            {photoPreview ? (
              <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload a photo</span>
                </label>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500">
              <Info className="h-3 w-3 mr-1" />
              <span>Photo must be of the actual product you received</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
