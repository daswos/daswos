import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Info, Shield, Award, Calendar, Globe, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SellerReviews from '@/components/seller-reviews';

interface TransparencyInfo {
  // Common fields
  name: string;
  type: string;
  verifiedSince?: string;
  trustScore: number;

  // Information source specific fields
  sourceUrl?: string;
  sourceVerified?: boolean;
  warning?: string;

  // Seller specific fields
  contactInfo?: string;
  businessType?: string;
  registrationNumber?: string;
  verificationDetails?: string;
  location?: string;
  yearEstablished?: string;
  sellerId?: string | number;
}

interface TransparencyButtonProps {
  info: TransparencyInfo;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  sourceType: 'information' | 'seller';
}

export const TransparencyButton: React.FC<TransparencyButtonProps> = ({
  info,
  variant = 'outline',
  size = 'sm',
  sourceType
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    if (score >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const renderSourceInfo = () => (
    <>
      {/* Source Profile Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          Source Profile
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Source Name</p>
            <p className="font-medium">{info.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Source Type</p>
            <p className="font-medium capitalize">{info.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Verified Since</p>
            <p className="font-medium">{info.verifiedSince || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Trust Score</p>
            <p className="font-medium">{info.trustScore}/100</p>
          </div>
        </div>

        {info.sourceUrl && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Source URL</p>
            <a
              href={info.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              {info.sourceUrl}
            </a>
          </div>
        )}
      </div>

      {/* Verification Details Section */}
      {info.verifiedSince && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium mb-3 flex items-center text-blue-800">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Verification Status
          </h3>
          <p className="text-sm text-blue-700">
            This source has been verified as reliable and trustworthy by the DasWos Trust Verification Program.
            Sources are evaluated based on accuracy, reliability, and adherence to editorial standards.
          </p>
          <div className="mt-2 flex items-center text-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">Verified since: {info.verifiedSince}</span>
          </div>
        </div>
      )}

      {/* Warning Information Section */}
      {info.warning && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-medium mb-3 flex items-center text-yellow-800">
            <Info className="h-5 w-5 mr-2 text-yellow-600" />
            Important Notice
          </h3>
          <p className="text-sm text-yellow-700">{info.warning}</p>
        </div>
      )}

      {/* Trust Score Explanation Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Source Quality Assessment
        </h3>
        <p className="text-sm text-gray-700 mb-2">
          The trust score is calculated based on multiple factors including:
        </p>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>Editorial standards and fact-checking processes</li>
          <li>Source reputation and credibility</li>
          <li>Content accuracy and consistency</li>
          <li>Transparency in methodology</li>
          <li>Expert reviews and assessments</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <p className="text-sm font-medium mr-2">Current Score:</p>
            <Badge className={`${getTrustScoreColor(info.trustScore)} font-bold`}>
              {info.trustScore}/100
            </Badge>
          </div>
        </div>
      </div>
    </>
  );

  const renderSellerInfo = () => (
    <>
      {/* Seller Profile Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800">
          <Building className="h-5 w-5 mr-2 text-primary" />
          Seller Profile
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Seller Name</p>
            <p className="font-medium">{info.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Type</p>
            <p className="font-medium">{info.businessType || info.type || 'Not specified'}</p>
          </div>
          {info.registrationNumber && (
            <div>
              <p className="text-sm text-gray-500">Registration Number</p>
              <p className="font-medium">{info.registrationNumber}</p>
            </div>
          )}
          {info.location && (
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{info.location}</p>
            </div>
          )}
          {info.yearEstablished && (
            <div>
              <p className="text-sm text-gray-500">Year Established</p>
              <p className="font-medium">{info.yearEstablished}</p>
            </div>
          )}
          {info.contactInfo && (
            <div>
              <p className="text-sm text-gray-500">Contact Information</p>
              <p className="font-medium">{info.contactInfo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Reviews Section */}
      {info.sellerId && <SellerReviews sellerId={info.sellerId} />}

      {/* Verification Details Section */}
      {info.verificationDetails && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium mb-3 flex items-center text-blue-800">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Verification Status
          </h3>
          <p className="text-sm text-blue-700">{info.verificationDetails}</p>
          {info.verifiedSince && (
            <div className="mt-2 flex items-center text-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">Verified since: {info.verifiedSince}</span>
            </div>
          )}
        </div>
      )}

      {/* Warning Information Section */}
      {info.warning && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-medium mb-3 flex items-center text-yellow-800">
            <Info className="h-5 w-5 mr-2 text-yellow-600" />
            Important Notice
          </h3>
          <p className="text-sm text-yellow-700">{info.warning}</p>
        </div>
      )}

      {/* Trust Score Explanation Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Trust Score Explanation
        </h3>
        <p className="text-sm text-gray-700 mb-2">
          The trust score is calculated based on multiple factors including:
        </p>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>Verification status and history</li>
          <li>Customer reviews and feedback</li>
          <li>Transaction history</li>
          <li>Compliance with DasWos policies</li>
          <li>Response time to customer inquiries</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <p className="text-sm font-medium mr-2">Current Score:</p>
            <Badge className={`${getTrustScoreColor(info.trustScore)} font-bold`}>
              {info.trustScore}/100
            </Badge>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Button
        variant="default"
        size={size}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white"
      >
        <Shield className="h-4 w-4" />
        Transparency
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {sourceType === 'information' ? 'Source Transparency' : 'Seller Transparency'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {sourceType === 'information'
                ? 'Detailed information about this content source.'
                : 'Detailed information about this seller.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={getTrustScoreColor(info.trustScore)}>
                <Award className="h-3 w-3 mr-1" />
                Trust Score: {info.trustScore}/100
              </Badge>

              {info.verifiedSince && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {sourceType === 'information' ? renderSourceInfo() : renderSellerInfo()}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransparencyButton;