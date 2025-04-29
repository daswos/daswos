import React from 'react';
import { Link } from 'wouter';
import {
  ShieldCheck,
  HelpCircle,
  Star,
  ShoppingBag,
  Flag,
  Scale
} from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ShopperHub: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopper Hub</h1>
        <p className="text-gray-600 mb-6">
          Essential resources and information for DasWos shoppers
        </p>
      </div>

      {/* Hero section */}
      <div className="bg-gray-900 text-white p-8 rounded-lg mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Shop with Confidence</h2>
          <p className="text-lg mb-8">
            DasWos provides a secure shopping platform with verified sellers and trusted product information.
            Learn about our shopper protection features and how we ensure your safety.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
              <Link href="/search">Start Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-gray-800">
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Shopper Resources Grid */}
      <h2 className="text-2xl font-bold mb-6">Shopper Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

        {/* How It Works */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">How It Works</h3>
            <p className="text-gray-600 mb-4">
              Learn about the DasWos shopping platform, search features, and how to find the best products.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Trust Score Explained */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust Score Explained</h3>
            <p className="text-gray-600 mb-4">
              Understand how our Trust Score works and why it helps you make better shopping decisions.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/trust-score">View Details</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* SafeSphere vs OpenSphere */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">SafeSphere vs OpenSphere</h3>
            <p className="text-gray-600 mb-4">
              Compare our protection modes and learn which one is right for your shopping needs.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/sphere-comparison">Compare Options</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Report a Scam */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Flag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Report a Scam</h3>
            <p className="text-gray-600 mb-4">
              Help keep our community safe by reporting suspicious sellers or products.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/report-scam">Report Now</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Buyer Protection */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Buyer Protection</h3>
            <p className="text-gray-600 mb-4">
              Learn about our Buyer Protection program and how it safeguards your purchases.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/buyer-protection">View Protection</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* DasWos AI */}
        <Card className="border shadow hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">DasWos AI</h3>
            <p className="text-gray-600 mb-4">
              Discover how our AI-powered shopping assistant can help you find the best products.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href="/ai-shopper">Explore AI Features</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* SafeSphere Promo */}
      <div className="bg-gray-100 p-8 rounded-lg text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">Enhanced Protection with SafeSphere</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Upgrade to SafeSphere for advanced shopper protections, verified-only listings, and premium support.
        </p>
        <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
          <Link href="/safesphere-subscription">Learn About SafeSphere</Link>
        </Button>
      </div>

      <Separator className="my-8" />

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">What is SafeSphere mode?</h3>
            <p className="text-gray-600">
              SafeSphere is our premium shopping mode that filters out unverified sellers and provides enhanced buyer protection for all purchases.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How do I report a problem with an order?</h3>
            <p className="text-gray-600">
              Navigate to your order details page and click "Report Problem." Our support team will address your issue within 24-48 hours.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">What is the Trust Score?</h3>
            <p className="text-gray-600">
              Trust Score is our proprietary rating system that evaluates sellers based on verification status, customer reviews, transaction history, and other security factors.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Is my payment information secure?</h3>
            <p className="text-gray-600">
              Yes, we use industry-standard encryption for all payment processing and never store complete credit card details on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopperHub;