import React from 'react';
import { Link } from 'wouter';
import { 
  CheckCircle, 
  DollarSign, 
  Users, 
  LineChart, 
  Award, 
  FileText 
} from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SellerHub: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            ← Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Seller Hub</h1>
        <p className="text-gray-600 mb-6">
          Everything you need to know about selling on DasWos
        </p>
      </div>

      {/* Hero section */}
      <div className="bg-gray-900 text-white p-8 rounded-lg mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Trusted Seller Network</h2>
          <p className="text-lg mb-8">
            DasWos provides a secure platform for verified sellers to connect with quality customers.
            Start your selling journey today and benefit from our trust-based ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
              <Link href="/for-sellers">Start Selling</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-gray-800">
              <Link href="/verification-process">Learn About Verification</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Seller Resources Grid */}
      <h2 className="text-2xl font-bold mb-6">Seller Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Verification Process */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verification Process</h3>
            <p className="text-gray-600 mb-4">
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
            <h3 className="text-xl font-semibold mb-2">Pricing & Fees</h3>
            <p className="text-gray-600 mb-4">
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
            <h3 className="text-xl font-semibold mb-2">Personal Seller Program</h3>
            <p className="text-gray-600 mb-4">
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
            <h3 className="text-xl font-semibold mb-2">Merchant Dashboard</h3>
            <p className="text-gray-600 mb-4">
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
            <h3 className="text-xl font-semibold mb-2">Success Stories</h3>
            <p className="text-gray-600 mb-4">
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
            <h3 className="text-xl font-semibold mb-2">Seller Terms</h3>
            <p className="text-gray-600 mb-4">
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
      <div className="bg-gray-100 p-8 rounded-lg text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">Ready to Join?</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Start your verification process today and begin selling on DasWos's trusted platform.
        </p>
        <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
          <Link href="/for-sellers">Start Selling</Link>
        </Button>
      </div>

      <Separator className="my-8" />

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">How long does verification take?</h3>
            <p className="text-gray-600">
              The verification process typically takes 3-5 business days once all required documentation has been submitted.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">What documentation do I need?</h3>
            <p className="text-gray-600">
              You'll need business registration documents, ID verification, address proof, and documentation of product authenticity or supply chain.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How are commission rates calculated?</h3>
            <p className="text-gray-600">
              Commission rates vary by product category and range from 5-15%. Volume discounts are available for high-volume sellers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Can individual sellers join?</h3>
            <p className="text-gray-600">
              Yes, our Personal Seller Program is designed specifically for individual sellers and small businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHub;