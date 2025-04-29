import React from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Shopping: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            ← Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Shopping Options</h1>
        <p className="text-gray-600 mb-6">
          Explore our various shopping platforms designed for different needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Unified Search Platform</CardTitle>
            <CardDescription>Your one-stop search solution</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Our integrated platform lets you switch between Information Search for verified content and Shopping Engine for trusted products. All in one place with easy toggling between modes.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/search">Go to Unified Search</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle>BulkBuy Marketplace</CardTitle>
            <CardDescription>Wholesale shopping made easy</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Our dedicated BulkBuy marketplace specializes in wholesale and bulk purchases. Find volume discounts, multi-item packages, and connect directly with verified suppliers for large orders.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/bulk-buy">Visit BulkBuy Marketplace</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Shopping Features</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Verified seller accounts to ensure your safety</li>
          <li>Trust scores on every product and marketplace listing</li>
          <li>SafeSphere protection to filter only trusted content</li>
          <li>Multiple payment methods and secure checkout</li>
          <li>Special bulk discounts for registered users</li>
        </ul>
      </div>
    </div>
  );
};

export default Shopping;