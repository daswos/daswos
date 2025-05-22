import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ShieldCheck, Bot, ArrowLeft, ShoppingBag, Plus, Users, Image, Briefcase } from 'lucide-react';
import DasWosLogo from '@/components/daswos-logo';
import CategoryCollaborativeSearch from '@/components/category-collaborative-search';

// Define the category information
const CATEGORY_INFO = {
  id: 'art',
  name: 'Art & Paintings',
  description: 'Find and purchase authentic artwork from trusted sellers in our verified marketplace.',
  color: '#FF6B6B',
  itemCount: 156,
  jobCount: 42
};

const ArtPaintingsHub: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  
  // Get the sphere from URL params if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const sphereParam = urlParams.get('sphere') as 'safesphere' | 'opensphere' | null;
  
  // Use SafeSphere by default, or use the value from URL if it's valid
  const [activeSphere, setActiveSphere] = useState<'safesphere' | 'opensphere'>(
    sphereParam === 'opensphere' ? 'opensphere' : 'safesphere'
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search page with appropriate parameters
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}&sphere=${activeSphere}&category=${CATEGORY_INFO.id}`;
    navigate(searchUrl);
  };

  const handleSphereChange = (sphere: 'safesphere' | 'opensphere') => {
    setActiveSphere(sphere);
  };

  const toggleAiMode = () => {
    setAiModeEnabled(!aiModeEnabled);
    // Save to localStorage for persistence
    localStorage.setItem('daswos-ai-mode-enabled', (!aiModeEnabled).toString());
    
    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('aiModeChanged', { 
      detail: { enabled: !aiModeEnabled } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div>
      <Helmet>
        <title>{CATEGORY_INFO.name} | Daswos</title>
        <meta name="description" content={CATEGORY_INFO.description} />
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
        
        {/* Header section */}
        <div className="flex flex-col items-center mb-6 mt-8 w-full max-w-4xl">
          <div className="flex items-center justify-center mb-2">
            <DasWosLogo size={24} className="mr-2" />
            <h1 className="text-xl font-bold">{CATEGORY_INFO.name}</h1>
          </div>
          
          <p className="text-center text-sm text-gray-700 mb-6 max-w-lg">
            {CATEGORY_INFO.description}
          </p>
          
          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              <ShoppingBag className="h-4 w-4 mr-1" style={{ color: CATEGORY_INFO.color }} />
              <span className="text-sm font-medium">{CATEGORY_INFO.itemCount} items</span>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              <Briefcase className="h-4 w-4 mr-1" style={{ color: CATEGORY_INFO.color }} />
              <span className="text-sm font-medium">{CATEGORY_INFO.jobCount} jobs</span>
            </div>
          </div>
          
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
                  placeholder={aiModeEnabled ? "Ask Daswos..." : `Search in ${CATEGORY_INFO.name.toLowerCase()}...`}
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
            
            <div className="flex items-center justify-between mt-2">
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
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ai-mode-toggle"
                  className="sr-only"
                  checked={aiModeEnabled}
                  onChange={toggleAiMode}
                />
                <label
                  htmlFor="ai-mode-toggle"
                  className="flex items-center cursor-pointer"
                >
                  <Bot className="h-4 w-4 mr-1 text-blue-600" />
                  <span className="text-xs font-medium">Daswos AI</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Main content tabs */}
          <div className="w-full max-w-4xl">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
                <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
              </TabsList>
              
              {/* Browse tab - for buying items */}
              <TabsContent value="browse" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Browse {CATEGORY_INFO.name}</h2>
                      <Button 
                        onClick={() => navigate(`/search?category=${CATEGORY_INFO.id}`)}
                        style={{ backgroundColor: CATEGORY_INFO.color }}
                        className="text-white"
                      >
                        View All Items
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                      Explore our curated collection of authentic artwork from trusted sellers.
                    </p>
                    
                    {/* Featured categories */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {['Paintings', 'Prints', 'Photography', 'Digital Art', 'Sculptures', 'Mixed Media'].map(subcat => (
                        <Button 
                          key={subcat}
                          variant="outline"
                          className="h-auto py-2 justify-start"
                          onClick={() => navigate(`/search?category=${CATEGORY_INFO.id}&subcategory=${subcat.toLowerCase()}`)}
                        >
                          <span>{subcat}</span>
                        </Button>
                      ))}
                    </div>
                    
                    {/* Placeholder for featured items */}
                    <div className="text-center py-8 border rounded-lg bg-gray-50">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Featured Items Coming Soon</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        We're curating a selection of the finest art pieces for you.
                      </p>
                      <Button 
                        className="mt-4"
                        style={{ backgroundColor: CATEGORY_INFO.color }}
                        onClick={() => navigate(`/search?category=${CATEGORY_INFO.id}`)}
                      >
                        Browse All Art
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Sell tab - for listing items */}
              <TabsContent value="sell" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Sell Your Art</h2>
                      <Button 
                        onClick={() => navigate('/list-item?category=art')}
                        style={{ backgroundColor: CATEGORY_INFO.color }}
                        className="text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        List an Item
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                      Share your artistic creations with our community of art enthusiasts and collectors.
                    </p>
                    
                    {/* Selling benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Reach Art Collectors</h3>
                        <p className="text-sm text-gray-600">
                          Connect with serious art collectors looking for unique pieces to add to their collections.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Secure Transactions</h3>
                        <p className="text-sm text-gray-600">
                          Our platform ensures safe and secure transactions for both buyers and sellers.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Artist Verification</h3>
                        <p className="text-sm text-gray-600">
                          Get verified as a trusted artist to increase your visibility and credibility.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Listing Insights</h3>
                        <p className="text-sm text-gray-600">
                          Access detailed analytics about your listings and buyer engagement.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={() => navigate('/list-item?category=art')}
                        style={{ backgroundColor: CATEGORY_INFO.color }}
                        className="text-white"
                        size="lg"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Start Selling Your Art
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Collaborate tab - for collaborative search */}
              <TabsContent value="collaborate" className="mt-4">
                <CategoryCollaborativeSearch 
                  categoryId={CATEGORY_INFO.id}
                  categoryName={CATEGORY_INFO.name}
                  categoryColor={CATEGORY_INFO.color}
                />
              </TabsContent>
              
              {/* Jobs tab - for art-related jobs */}
              <TabsContent value="jobs" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Art & Design Jobs</h2>
                      <Button 
                        onClick={() => navigate('/browse-jobs?category=art-design')}
                        style={{ backgroundColor: CATEGORY_INFO.color }}
                        className="text-white"
                      >
                        View All Jobs
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                      Find opportunities in the art world or hire talented artists for your projects.
                    </p>
                    
                    {/* Job categories */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {['Painter', 'Illustrator', 'Art Director', 'Gallery Assistant', 'Art Teacher', 'Restoration'].map(jobType => (
                        <Button 
                          key={jobType}
                          variant="outline"
                          className="h-auto py-2 justify-start"
                          onClick={() => navigate(`/browse-jobs?category=art-design&jobType=${jobType.toLowerCase()}`)}
                        >
                          <span>{jobType}</span>
                        </Button>
                      ))}
                    </div>
                    
                    {/* Placeholder for featured jobs */}
                    <div className="text-center py-8 border rounded-lg bg-gray-50">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">{CATEGORY_INFO.jobCount} Art & Design Jobs Available</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Browse opportunities or post a job to find talented artists.
                      </p>
                      <div className="flex justify-center gap-4 mt-4">
                        <Button 
                          style={{ backgroundColor: CATEGORY_INFO.color }}
                          className="text-white"
                          onClick={() => navigate('/browse-jobs?category=art-design')}
                        >
                          Find Jobs
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/post-job?category=art-design')}
                        >
                          Post a Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtPaintingsHub;
