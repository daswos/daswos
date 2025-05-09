import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, ShieldCheck, Bot, ShoppingBag, Filter, ArrowUpDown, ArrowLeft } from 'lucide-react';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define props for the enhanced category page template
interface EnhancedCategoryTemplateProps {
  categoryId: string;
  categoryName: string;
  categoryDescription?: string;
  categoryColor?: string;
  productCount?: number;
}

// Sample product type
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

const EnhancedCategoryTemplate: React.FC<EnhancedCategoryTemplateProps> = ({
  categoryId,
  categoryName,
  categoryDescription = 'Find exactly what you need in our trusted marketplace',
  categoryColor = '#6A7FDB',
  productCount = 0,
}) => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Get the sphere from URL params if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const sphereParam = urlParams.get('sphere') as 'safesphere' | 'opensphere' | null;

  // Use SafeSphere by default, or use the value from URL if it's valid
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    sphereParam === 'opensphere' ? 'opensphere' : 'safesphere'
  );

  // AI mode state from local storage
  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  // Sample products data
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Item 1',
      price: 129.99,
      image: '/placeholder.jpg',
      seller: 'Quality Seller',
      rating: 4.8,
      isNew: true,
      isFeatured: true
    },
    {
      id: '2',
      name: 'Standard Item 2',
      price: 59.99,
      image: '/placeholder.jpg',
      seller: 'Trusted Shop',
      rating: 4.5
    },
    {
      id: '3',
      name: 'Budget Item 3',
      price: 29.99,
      image: '/placeholder.jpg',
      seller: 'Value Store',
      rating: 4.2
    },
    {
      id: '4',
      name: 'Exclusive Item 4',
      price: 199.99,
      image: '/placeholder.jpg',
      seller: 'Premium Outlet',
      rating: 4.9,
      isFeatured: true
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to search page with appropriate parameters
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}&category=${categoryId}&type=shop`;
    navigate(searchUrl);
  };

  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);
  };

  return (
    <div>
      <Helmet>
        <title>{categoryName} | Daswos</title>
        <meta name="description" content={categoryDescription} />
      </Helmet>
      <div className="flex flex-col items-center py-6 px-4 overflow-hidden relative min-h-screen">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/enhanced-d-list')}
            className="flex items-center justify-center w-8 h-8 bg-[#e0e0e0] dark:bg-[#333333] border border-gray-400 dark:border-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded-md"
            aria-label="Back to categories"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col items-center mb-6 mt-8 w-full max-w-4xl">
          <div className="flex items-center justify-center mb-2">
            <DasWosLogo size={24} className="mr-2" />
            <h1 className="text-xl font-bold">{categoryName}</h1>
          </div>

          <p className="text-center text-sm text-gray-700 mb-6 max-w-lg">
            {categoryDescription}
          </p>

          {/* Search bar */}
          <div className="w-full max-w-lg mb-6">
            <form onSubmit={handleSearch} className="relative">
              <div className={`flex items-center border rounded-lg
                ${aiModeEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
              >
                <input
                  type="text"
                  className={`flex-1 p-2 rounded-l-lg outline-none
                    ${aiModeEnabled ? 'bg-blue-50 placeholder-blue-500' : 'bg-white'}`}
                  placeholder={aiModeEnabled ? "Ask Daswos..." : `Search in ${categoryName.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className={`p-2 rounded-r-lg
                    ${aiModeEnabled ? 'bg-blue-50 text-blue-500' : 'bg-white text-gray-500'}`}
                >
                  {aiModeEnabled ? <Bot className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>
              </div>
            </form>

            <div className="flex items-center justify-center mt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="safesphere-toggle"
                  className="sr-only"
                  checked={activeSphere === 'safesphere'}
                  onChange={() => handleSphereChange('safesphere')}
                />
                <label
                  htmlFor="safesphere-toggle"
                  className="flex items-center cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-xs font-medium">SafeSphere</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="w-full max-w-4xl mb-6">
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{categoryName} Products</h2>
                  <div className="flex space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-1" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>New Arrivals</DropdownMenuItem>
                        <DropdownMenuItem>Featured Items</DropdownMenuItem>
                        <DropdownMenuItem>On Sale</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowUpDown className="h-4 w-4 mr-1" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Most Popular</DropdownMenuItem>
                        <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                        <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sampleProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="h-40 bg-gray-200 relative">
                        {product.isNew && (
                          <Badge className="absolute top-2 left-2 bg-green-500">New</Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="absolute top-2 right-2 bg-purple-500">Featured</Badge>
                        )}
                      </div>
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <CardDescription>{product.seller}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">${product.price}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full" style={{ backgroundColor: categoryColor }}>
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <Button variant="outline">View All {categoryName} Products</Button>
                </div>

                {/* Job opportunities section */}
                <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-2">Looking for work in {categoryName}?</h3>
                  <p className="text-sm mb-4">Browse available positions in {categoryName.toLowerCase()} and related fields</p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Map product categories to job categories
                      const categoryToJobCategory: Record<string, string> = {
                        'Art & Paintings': 'art-design',
                        'Crafts & DIY': 'art-design',
                        'Handmade Items': 'art-design',
                        'Photography': 'art-design',
                        'Collectibles': 'art-design',
                        'Clothing': 'fashion-apparel',
                        'Shoes': 'fashion-apparel',
                        'Accessories': 'fashion-apparel',
                        'Jewelry': 'fashion-apparel',
                        'Watches': 'fashion-apparel',
                        'Computers': 'technology',
                        'Smartphones': 'technology',
                        'Audio Equipment': 'technology',
                        'Cameras': 'technology',
                        'Gaming': 'technology',
                        'Wearable Tech': 'technology',
                        'Furniture': 'home-interior',
                        'Home Decor': 'home-interior',
                        'Kitchen & Dining': 'home-interior',
                        'Garden & Outdoor': 'home-interior',
                        'Bath & Bedding': 'home-interior',
                        'Appliances': 'home-interior',
                        'Plumbing': 'trades-services',
                        'Electrical': 'trades-services'
                      };

                      // Get the job category for this product category
                      const jobCategory = categoryToJobCategory[categoryName] || '';

                      // Navigate to the jobs page with the category parameter
                      navigate(`/browse-jobs?category=${jobCategory}`);
                    }}
                  >
                    Browse Jobs
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCategoryTemplate;
