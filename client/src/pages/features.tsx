import React from 'react';
import { Link } from 'wouter';
import { Bot, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Features: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Features</h1>
        <p className="text-gray-600 mb-6">
          Discover the powerful features that make DasWos unique
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Daswos AI Assistant</CardTitle>
            <CardDescription>Personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Our AI-powered assistant learns your preferences to recommend trusted sources and products you'll value. It can even automatically find the best matches based on your needs.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/ai-shopper">Try AI Assistant</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Family Accounts</CardTitle>
            <CardDescription>Manage accounts for your family</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Create and manage family member accounts with customized safety settings. Perfect for parents who want to provide a trusted online experience for their children.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profile">Manage Family</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Additional Features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-2">
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            </div>
            <span>Collaborative Search: Research with others</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-2">
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            </div>
            <span>Split Buy: Shop together and save</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-2">
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            </div>
            <span>Advanced search filters for precise results</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-2">
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            </div>
            <span>DasWos Coins rewards program</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-2">
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            </div>
            <span>Multi-device synchronization</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 p-1 rounded-full mr-2">
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            </div>
            <span>Product and seller reviews</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Features;