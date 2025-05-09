import React from 'react';
import { Link } from 'wouter';
import { Shield, AlertTriangle, BarChart4, Package, Bot, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const InfoSection: React.FC = () => {
  return (
    <section className="py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6 font-outfit">Explore DasWos</h2>

        <Tabs defaultValue="bulkbuy" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="bulkbuy">BulkBuy</TabsTrigger>
            <TabsTrigger value="dlist">das.list</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>

          {/* BulkBuy Tab */}
          <TabsContent value="bulkbuy" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </TabsContent>

          {/* D.List Tab */}
          <TabsContent value="dlist" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle>SafeSphere Protection</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p>Available in both Search Engine and Shopping Engine modes, SafeSphere filters content to only display verified, trusted sources. Toggle SafeSphere protection on or off to control your search experience.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/safesphere-info">Learn more</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <CardTitle>OpenSphere Mode</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p>When SafeSphere protection is disabled, you'll see all available content including unverified sources. Each result shows clear trust indicators to help you make informed decisions about the reliability of information and products.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/opensphere-info">Learn more</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
                    <BarChart4 className="w-5 h-5 text-neutral-700" />
                  </div>
                  <CardTitle>Trust Score</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p>Every source has a Trust Score from 0-100. This score is calculated based on verification status, reviews, content accuracy, historical reliability, and more.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/trust-score-info">Learn more</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default InfoSection;
