import React from 'react';
import { Link } from 'wouter';
import { ShoppingBag, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SellerCTA: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/seller-verification">Learn About Verification</Link>
            </Button>
            <Button size="lg" className="bg-black text-white hover:bg-gray-800" asChild>
              <Link href="/seller-apply">Apply Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;
