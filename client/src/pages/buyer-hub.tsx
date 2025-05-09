import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from 'react-helmet';
import { Button } from "@/components/ui/button";

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

const BuyerHub = () => {
  const [, navigate] = useLocation();
  // State to track selected category groups
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

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

  return (
    <>
      <Helmet>
        <title>das.list | Daswos</title>
        <meta name="description" content="Browse categories and find exactly what you need" />
      </Helmet>
      <div className="daslist-container">
        <div className="flex flex-col items-center my-4">
          <h1 className="text-3xl font-bold mb-4">das.list</h1>
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
              Showing {
                mainCategories.filter(category =>
                  selectedGroups.some(group => {
                    const groupObj = categoryGroups.find(g => g.id === group);
                    return groupObj && category.group === groupObj.name;
                  })
                ).length
              } of {mainCategories.length} categories
            </span>
          </div>
        )}

        <div className="daslist-grid">
          {mainCategories
            .filter(category => selectedGroups.length === 0 || selectedGroups.some(group => {
              const groupObj = categoryGroups.find(g => g.id === group);
              return groupObj && category.group === groupObj.name;
            }))
            .map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex flex-col items-center justify-center">
                    <div
                      className="w-10 h-10 rounded-full mb-1 flex items-center justify-center"
                      style={{ backgroundColor: category.color || '#6A7FDB' }}
                    >
                      <span className="text-white font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xs font-medium text-center">{category.name}</h3>
                    <div className="flex flex-col items-center">
                      {/* Show item count */}
                      <span className="text-xs text-gray-500">{category.itemCount} items</span>

                      {/* Show job count */}
                      {category.jobCount && category.jobCount > 0 && (
                        <span
                          className="text-xs text-blue-500 mt-1 cursor-pointer font-medium hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
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
                          {category.jobCount} jobs
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </>
  );
};

export default BuyerHub;

// Also export as DList for new route name
export const DList = BuyerHub;