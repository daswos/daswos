import React from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ForSellers: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            ← Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">For Sellers</h1>
        <p className="text-gray-600 mb-6">
          Join our growing community of trusted sellers
        </p>
      </div>

      {/* Seller CTA Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 font-outfit">Become a Verified Seller</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join DasWos's SafeSphere and gain access to customers who prioritize security and legitimacy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Trusted Status</h3>
              <p className="text-gray-600 text-sm text-center">
                Get a verified badge that increases customer trust and boosts conversion rates.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Premium Customers</h3>
              <p className="text-gray-600 text-sm text-center">
                Access to customers who prioritize verified sellers and are willing to pay for quality.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Better Visibility</h3>
              <p className="text-gray-600 text-sm text-center">
                Verified sellers get priority placement in search results and product recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/verification-process">Learn About Verification</Link>
          </Button>
          <Button size="lg" className="bg-black text-white hover:bg-gray-800" onClick={() => setLocation('/seller-verification')}>
            Apply Now
          </Button>
        </div>
      </div>

      {/* Additional seller information */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Why Choose DasWos as a Seller?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-3">Benefits</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="text-green-500 mr-2">✓</div>
                <span>Low commission rates compared to competitors</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-500 mr-2">✓</div>
                <span>Direct communication with customers</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-500 mr-2">✓</div>
                <span>Powerful analytics dashboard</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-500 mr-2">✓</div>
                <span>Multiple payment processing options</span>
              </li>
              <li className="flex items-start">
                <div className="text-green-500 mr-2">✓</div>
                <span>Marketing tools and promotion opportunities</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-3">Requirements</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="text-primary mr-2">•</div>
                <span>Valid business registration or personal identification</span>
              </li>
              <li className="flex items-start">
                <div className="text-primary mr-2">•</div>
                <span>Physical address for verification</span>
              </li>
              <li className="flex items-start">
                <div className="text-primary mr-2">•</div>
                <span>Product authenticity documentation</span>
              </li>
              <li className="flex items-start">
                <div className="text-primary mr-2">•</div>
                <span>Compliance with platform terms and policies</span>
              </li>
              <li className="flex items-start">
                <div className="text-primary mr-2">•</div>
                <span>Response time standards (24-48 hours)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForSellers;