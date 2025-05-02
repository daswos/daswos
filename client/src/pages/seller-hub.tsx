import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  DollarSign,
  Users,
  LineChart,
  Award,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Store
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SellerHub: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Fetch seller verification status if user is logged in
  const { data: sellerData, isLoading: isLoadingSellerData } = useQuery({
    queryKey: ['/api/sellers/verification'],
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Determine if user is a verified seller
  const isVerifiedSeller = user?.isSeller || (sellerData && sellerData.verification_status === 'approved');

  // Handle navigation to seller verification page
  const handleStartVerification = () => {
    if (!user) {
      setLocation('/auth?redirect=/seller-verification');
    } else {
      setLocation('/seller-verification');
    }
  };

  // Handle navigation to my listings page
  const handleViewListings = () => {
    setLocation('/my-listings');
  };

  // Handle navigation to create listing page
  const handleCreateListing = () => {
    if (!user) {
      setLocation('/auth?redirect=/list-item');
    } else {
      setLocation('/list-item');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Seller Hub</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Everything you need to know about selling on DasWos
        </p>
      </div>

      {/* Status Card - Different for logged in/out users and verified/unverified sellers */}
      <Card className="mb-8 border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2 text-primary" />
            {isVerifiedSeller
              ? "Your SafeSphere Seller Dashboard"
              : user
                ? "Sell in OpenSphere or Become a SafeSphere Seller"
                : "Join Our DasWos Seller Network"}
          </CardTitle>
          <CardDescription>
            {isVerifiedSeller
              ? "Manage your SafeSphere listings with 70+ trust points"
              : user
                ? "You can sell in OpenSphere now, or get verified for SafeSphere"
                : "Create an account to start selling in OpenSphere immediately"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifiedSeller ? (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">Verified SafeSphere Seller</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your items are listed in SafeSphere with 70+ trust points. Buyers can see your verified status,
                    which increases visibility and trust in your products.
                  </p>
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="bg-amber-50 dark:bg-amber-900 p-4 rounded-md mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">OpenSphere Seller</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    You can sell in OpenSphere immediately with 0 trust points. Verification is optional but
                    recommended for SafeSphere listing and 70 trust points. Without verification, you'll need
                    to earn 70 trust points through positive reviews and sales to enter SafeSphere.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-4">
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Two-Tier Seller Platform</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>OpenSphere:</strong> Anyone with an account can sell immediately with 0 trust points.<br/>
                    <strong>SafeSphere:</strong> Verified sellers start with 70 trust points. Unverified sellers need to
                    earn 70 trust points through positive reviews and sales to enter SafeSphere.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-3">
          {isVerifiedSeller ? (
            <>
              <Button onClick={handleViewListings} variant="outline">
                View My Listings
              </Button>
              <Button onClick={handleCreateListing} className="bg-primary text-black dark:text-white hover:bg-primary/90">
                Create New Listing
              </Button>
            </>
          ) : user ? (
            <>
              <Button onClick={handleCreateListing} variant="outline">
                Sell in OpenSphere
              </Button>
              <Button onClick={handleStartVerification} className="bg-primary text-black dark:text-white hover:bg-primary/90">
                Get SafeSphere Verified
              </Button>
            </>
          ) : (
            <Button onClick={() => setLocation('/auth?redirect=/seller-hub')} className="bg-primary text-black dark:text-white hover:bg-primary/90">
              Sign Up to Sell
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Seller Resources Grid */}
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Seller Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

        {/* Verification Process */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Verification Process</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn about our seller verification requirements and process to become a trusted DasWos seller.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/verification-process">Learn More</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pricing & Fees */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Pricing & Fees</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Understand our competitive commission rates, subscription options, and fee structure.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Personal Seller Program */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Personal Seller Program</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Explore our program designed for individual sellers with special benefits and reduced fees.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/for-sellers">View Details</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Merchant Dashboard */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LineChart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Merchant Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Access powerful analytics, inventory management tools, and customer insights.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/for-sellers">Explore Features</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Success Stories */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Success Stories</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Read about how other sellers have thrived on the DasWos platform.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/for-sellers">Read Stories</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Seller Terms */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Seller Terms</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Review our seller policies, requirements, and platform guidelines.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/terms">View Terms</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Seller CTA */}
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Ready to Start Selling?</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          {user
            ? "Create your first listing in OpenSphere or get verified for SafeSphere today."
            : "Create an account to start selling in OpenSphere immediately, or get verified for SafeSphere."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <>
              <Button onClick={handleCreateListing} size="lg" className="bg-primary text-black dark:text-white hover:bg-primary/90">
                Create Listing
              </Button>
              <Button onClick={handleStartVerification} size="lg" variant="outline" className="dark:text-white dark:border-white">
                Get SafeSphere Verified
              </Button>
            </>
          ) : (
            <Button onClick={() => setLocation('/auth?redirect=/seller-hub')} size="lg" className="bg-primary text-black dark:text-white hover:bg-primary/90">
              Sign Up to Sell
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">How long does verification take?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The verification process typically takes 3-5 business days once all required documentation has been submitted.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">What documentation do I need?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You'll need business registration documents, ID verification, address proof, and documentation of product authenticity or supply chain.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">How are commission rates calculated?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Commission rates vary by product category and range from 5-15%. Volume discounts are available for high-volume sellers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Can individual sellers join?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, our Personal Seller Program is designed specifically for individual sellers and small businesses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">What's the difference between OpenSphere and SafeSphere?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              OpenSphere is open to all sellers with an account. SafeSphere is our trusted marketplace where sellers need
              either verification or 70+ trust points. Verified sellers automatically start with 70 trust points.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How do I earn trust points without verification?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You can earn trust points through positive buyer reviews, successful sales, quick shipping, and good customer service.
              Once you reach 70 trust points, your items will be eligible for SafeSphere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHub;