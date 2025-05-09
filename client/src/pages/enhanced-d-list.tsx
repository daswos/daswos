import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from 'react-helmet';
import { Button } from "@/components/ui/button";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import '@/styles/enhanced-daslist.css';

// Define our category data structure
type Category = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  group: string;
  itemCount?: number; // Number of product listings in this category
  jobCount?: number; // Number of job listings related to this category
};

const EnhancedDList = () => {
  const [, navigate] = useLocation();
  // State to track selected category groups
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Define category groups with their colors
  const categoryGroups = [
    { name: "Arts & Crafts", color: "#FF6B6B", id: "arts" },
    { name: "Fashion & Accessories", color: "#F86CA7", id: "fashion" },
    { name: "Electronics & Tech", color: "#4ECDC4", id: "tech" },
    { name: "Home & Garden", color: "#77DD77", id: "home" },
    { name: "Services", color: "#6A7FDB", id: "services" }
  ];

  // Toggle a category group selection
  const toggleCategoryGroup = (groupId: string) => {
    setSelectedGroups(prev => {
      // If already selected, remove it
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      }
      // Otherwise add it
      return [...prev, groupId];
    });
  };

  // List of main categories to display with item counts and job counts
  const mainCategories: Category[] = [
    // Arts & Crafts
    { id: "art", name: "Art & Paintings", color: "#FF6B6B", group: "Arts & Crafts", itemCount: 156, jobCount: 42 },
    { id: "crafts", name: "Crafts & DIY", color: "#FF6B6B", group: "Arts & Crafts", itemCount: 89, jobCount: 28 },
    { id: "handmade", name: "Handmade Items", color: "#FF6B6B", group: "Arts & Crafts", itemCount: 204, jobCount: 35 },
    { id: "photography", name: "Photography", color: "#FF6B6B", group: "Arts & Crafts", itemCount: 78, jobCount: 24 },
    { id: "collectibles", name: "Collectibles", color: "#FF6B6B", group: "Arts & Crafts", itemCount: 312, jobCount: 18 },

    // Fashion & Accessories
    { id: "clothing", name: "Clothing", color: "#F86CA7", group: "Fashion & Accessories", itemCount: 567, jobCount: 89 },
    { id: "shoes", name: "Shoes", color: "#F86CA7", group: "Fashion & Accessories", itemCount: 245, jobCount: 32 },
    { id: "accessories", name: "Accessories", color: "#F86CA7", group: "Fashion & Accessories", itemCount: 189, jobCount: 45 },
    { id: "jewelry", name: "Jewelry", color: "#F86CA7", group: "Fashion & Accessories", itemCount: 321, jobCount: 38 },
    { id: "watches", name: "Watches", color: "#F86CA7", group: "Fashion & Accessories", itemCount: 112, jobCount: 21 },

    // Electronics & Tech
    { id: "computers", name: "Computers", color: "#4ECDC4", group: "Electronics & Tech", itemCount: 278, jobCount: 156 },
    { id: "phones", name: "Smartphones", color: "#4ECDC4", group: "Electronics & Tech", itemCount: 345, jobCount: 87 },
    { id: "audio", name: "Audio Equipment", color: "#4ECDC4", group: "Electronics & Tech", itemCount: 167, jobCount: 64 },
    { id: "cameras", name: "Cameras", color: "#4ECDC4", group: "Electronics & Tech", itemCount: 98, jobCount: 43 },
    { id: "gaming", name: "Gaming", color: "#4ECDC4", group: "Electronics & Tech", itemCount: 412, jobCount: 78 },
    { id: "wearables", name: "Wearable Tech", color: "#4ECDC4", group: "Electronics & Tech", itemCount: 87, jobCount: 52 },

    // Home & Garden
    { id: "furniture", name: "Furniture", color: "#77DD77", group: "Home & Garden", itemCount: 423, jobCount: 112 },
    { id: "decor", name: "Home Decor", color: "#77DD77", group: "Home & Garden", itemCount: 356, jobCount: 94 },
    { id: "kitchen", name: "Kitchen & Dining", color: "#77DD77", group: "Home & Garden", itemCount: 289, jobCount: 67 },
    { id: "garden", name: "Garden & Outdoor", color: "#77DD77", group: "Home & Garden", itemCount: 178, jobCount: 58 },
    { id: "bath", name: "Bath & Bedding", color: "#77DD77", group: "Home & Garden", itemCount: 145, jobCount: 43 },
    { id: "appliances", name: "Appliances", color: "#77DD77", group: "Home & Garden", itemCount: 234, jobCount: 76 },

    // Services
    { id: "plumbing", name: "Plumbing", color: "#6A7FDB", group: "Services", itemCount: 67, jobCount: 94 },
    { id: "electrical", name: "Electrical", color: "#6A7FDB", group: "Services", itemCount: 89, jobCount: 78 }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to search page with appropriate parameters
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}&type=shop`;
    navigate(searchUrl);
  };

  // Filter categories based on selected groups and search query
  const filteredCategories = mainCategories
    .filter(category =>
      selectedGroups.length === 0 ||
      selectedGroups.some(group => {
        const groupObj = categoryGroups.find(g => g.id === group);
        return groupObj && category.group === groupObj.name;
      })
    )
    .filter(category =>
      !searchQuery ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <>
      <Helmet>
        <title>das.list | Daswos</title>
        <meta name="description" content="Browse categories to shop for products in our marketplace" />
      </Helmet>

      <div className="daslist-container pb-20">
        <div className="flex justify-center items-center my-4">
          <h1 className="text-3xl font-bold">das.list</h1>
        </div>

        {/* Search bar */}
        <div className="mx-auto max-w-lg px-4 mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <input
                type="text"
                className="flex-1 p-2 rounded-l-lg outline-none bg-white"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="p-2 rounded-r-lg bg-white text-gray-500"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Action buttons */}
        <div className="mx-auto max-w-lg px-4 mb-4">
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              onClick={() => navigate('/browse-jobs')}
            >
              Browse Jobs
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3.5 w-3.5 mr-1" />
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
                <Button variant="outline" size="sm" className="h-8">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
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

        {/* Category filter buttons */}
        <div className="category-key mb-4">
          <div className="flex flex-wrap justify-center gap-3 px-4">
            {categoryGroups.map((group) => {
              const isSelected = selectedGroups.includes(group.id);
              return (
                <Button
                  key={group.id}
                  onClick={() => toggleCategoryGroup(group.id)}
                  className={`flex items-center h-8 px-3 py-1 rounded-md transition-colors ${
                    isSelected ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800' : 'opacity-80'
                  }`}
                  style={{
                    backgroundColor: isSelected ? group.color : 'rgba(255,255,255,0.8)',
                    color: isSelected ? 'white' : 'black',
                    borderColor: group.color,
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                  }}
                  variant="outline"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <span className="text-xs font-medium whitespace-nowrap">{group.name}</span>
                </Button>
              );
            })}

            {selectedGroups.length > 0 && (
              <Button
                onClick={() => setSelectedGroups([])}
                className="h-8 px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                variant="ghost"
              >
                <span className="text-xs font-medium">Show All</span>
              </Button>
            )}
          </div>
        </div>

        {/* Display count of filtered categories */}
        {selectedGroups.length > 0 && (
          <div className="text-center mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Showing {filteredCategories.length} of {mainCategories.length} categories
            </span>
          </div>
        )}

        <div className="daslist-grid px-4">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-full mb-1 flex items-center justify-center"
                    style={{ backgroundColor: category.color || '#6A7FDB' }}
                    onClick={() => navigate(`/categories/${category.id}`)}
                  >
                    <span className="text-white font-bold">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <h3
                    className="text-xs font-medium text-center cursor-pointer"
                    onClick={() => navigate(`/categories/${category.id}`)}
                  >
                    {category.name}
                  </h3>

                  {/* Show item count */}
                  <div className="mt-1 text-xs text-gray-500">
                    <span
                      className="cursor-pointer"
                      onClick={() => navigate(`/categories/${category.id}`)}
                    >
                      {category.itemCount} items
                    </span>
                  </div>

                  {/* Show job count */}
                  {category.jobCount && category.jobCount > 0 && (
                    <div className="mt-1 text-xs">
                      <span
                        className="cursor-pointer text-blue-500 font-medium flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();

                          // Map product categories to job categories
                          const categoryToJobCategory: Record<string, string> = {
                            'art': 'art-design',
                            'crafts': 'art-design',
                            'handmade': 'art-design',
                            'photography': 'art-design',
                            'collectibles': 'art-design',
                            'clothing': 'fashion-apparel',
                            'shoes': 'fashion-apparel',
                            'accessories': 'fashion-apparel',
                            'jewelry': 'fashion-apparel',
                            'watches': 'fashion-apparel',
                            'computers': 'technology',
                            'phones': 'technology',
                            'audio': 'technology',
                            'cameras': 'technology',
                            'gaming': 'technology',
                            'wearables': 'technology',
                            'furniture': 'home-interior',
                            'decor': 'home-interior',
                            'kitchen': 'home-interior',
                            'garden': 'home-interior',
                            'bath': 'home-interior',
                            'appliances': 'home-interior',
                            'plumbing': 'trades-services',
                            'electrical': 'trades-services'
                          };

                          // Get the job category for this product category
                          const jobCategory = categoryToJobCategory[category.id] || '';

                          // Navigate to the jobs page with the category parameter
                          navigate(`/browse-jobs?category=${jobCategory}`);
                        }}
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                        {category.jobCount} jobs
                      </span>
                    </div>
                  )}


                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EnhancedDList;
