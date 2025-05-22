import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

interface ReportReviewModalProps {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  reviewId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<string>('not_item');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await apiRequest('/api/reviews/report', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          reason,
          additionalInfo,
        }),
      });

      if (response.success) {
        toast({
          title: "Report submitted",
          description: "Thank you for your report. 2 DasWos coins have been added to your account.",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your report. Please try again.",
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
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Report Review Photo
          </DialogTitle>
          <DialogDescription>
            Report a misleading or inappropriate photo in this review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
            <div className="flex items-center text-yellow-800 font-medium mb-1">
              <DasWosCoinIcon className="mr-1 text-yellow-600" size={16} />
              <span>Earn 2 DasWos Coins</span>
            </div>
            <p className="text-yellow-700">
              If this report is verified, you'll receive 2 DasWos coins as a thank you for maintaining the integrity of our platform.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Reason for report</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_item" id="not_item" />
                <Label htmlFor="not_item" className="text-sm">Not the item I sold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="modified_item" id="modified_item" />
                <Label htmlFor="modified_item" className="text-sm">Modified/damaged after delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" />
                <Label htmlFor="inappropriate" className="text-sm">Inappropriate content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="text-sm">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm font-medium">Additional Information</Label>
            <Textarea
              placeholder="Please provide details about why this photo is misleading..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportReviewModal;
