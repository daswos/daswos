import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Helmet } from 'react-helmet';

// Job category type
type JobCategory = {
  id: string;
  name: string;
  color: string;
  count: number;
};

// Job listing type
type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  category: string;
};

const BrowseJobsPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Get category from URL if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  // Initialize selected categories with the category from URL if it exists
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );

  // Sample job categories
  const jobCategories: JobCategory[] = [
    { id: 'art-design', name: 'Art & Design', color: '#FF6B6B', count: 42 },
    { id: 'technology', name: 'Technology', color: '#5CD9D9', count: 156 },
    { id: 'fashion-apparel', name: 'Fashion & Apparel', color: '#FF5CAD', count: 89 },
    { id: 'trades-services', name: 'Trades & Services', color: '#FFD15C', count: 94 },
    { id: 'home-interior', name: 'Home & Interior', color: '#77DD77', count: 112 },
    { id: 'education', name: 'Education', color: '#B5FF6B', count: 67 },
    { id: 'healthcare', name: 'Healthcare', color: '#FFB56B', count: 94 },
    { id: 'hospitality', name: 'Hospitality', color: '#C56BFF', count: 78 },
    { id: 'office-admin', name: 'Office & Admin', color: '#FF6B8E', count: 103 },
  ];

  // Sample job listings
  const jobListings: JobListing[] = [
    {
      id: 1,
      title: 'Graphic Designer',
      company: 'Creative Studios',
      location: 'New York, NY',
      salary: '$60,000 - $70,000',
      category: 'art-design',
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      salary: '$90,000 - $110,000',
      category: 'technology',
    },
    {
      id: 3,
      title: 'Fashion Merchandiser',
      company: 'Style Trends',
      location: 'Los Angeles, CA',
      salary: '$55,000 - $65,000',
      category: 'fashion-apparel',
    },
    {
      id: 4,
      title: 'Interior Designer',
      company: 'Home Spaces',
      location: 'Chicago, IL',
      salary: '$65,000 - $80,000',
      category: 'home-interior',
    },
    {
      id: 5,
      title: 'Electrician',
      company: 'Power Services',
      location: 'Dallas, TX',
      salary: '$70,000 - $85,000',
      category: 'trades-services',
    },
    {
      id: 6,
      title: 'Math Teacher',
      company: 'Education First',
      location: 'Boston, MA',
      salary: '$50,000 - $60,000',
      category: 'education',
    },
    {
      id: 7,
      title: 'Registered Nurse',
      company: 'City Hospital',
      location: 'Seattle, WA',
      salary: '$75,000 - $90,000',
      category: 'healthcare',
    },
    {
      id: 8,
      title: 'Restaurant Manager',
      company: 'Fine Dining Group',
      location: 'Miami, FL',
      salary: '$55,000 - $70,000',
      category: 'hospitality',
    },
    {
      id: 9,
      title: 'Administrative Assistant',
      company: 'Corporate Services',
      location: 'Denver, CO',
      salary: '$45,000 - $55,000',
      category: 'office-admin',
    },
    {
      id: 10,
      title: 'UX/UI Designer',
      company: 'Digital Experiences',
      location: 'Austin, TX',
      salary: '$80,000 - $95,000',
      category: 'art-design',
    },
    {
      id: 11,
      title: 'Backend Developer',
      company: 'Software Solutions',
      location: 'Portland, OR',
      salary: '$95,000 - $115,000',
      category: 'technology',
    },
    {
      id: 12,
      title: 'Fashion Designer',
      company: 'Couture House',
      location: 'New York, NY',
      salary: '$70,000 - $90,000',
      category: 'fashion-apparel',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleShowAll = () => {
    setSelectedCategories([]);
  };

  const handleApply = (jobId: number) => {
    // Implement apply functionality
    console.log(`Applied to job ${jobId}`);
  };

  // Filter job listings based on selected categories and search query
  const filteredJobs = jobListings.filter(job => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(job.category);
    const matchesSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4">
      <Helmet>
        <title>Browse Jobs | Daswos</title>
        <meta name="description" content="Find job opportunities across various industries and categories" />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center mr-2">
              <span className="font-bold">J</span>
            </div>
            <h1 className="text-xl font-bold">Browse Jobs</h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1 mr-2">
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 pl-10 text-white"
                placeholder="Search job titles, companies, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button type="submit" className="bg-gray-800 hover:bg-gray-700">
              Search
            </Button>
          </form>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {jobCategories.map(category => (
            <Badge
              key={category.id}
              className={`py-2 px-3 cursor-pointer ${
                selectedCategories.includes(category.id)
                  ? 'bg-opacity-100'
                  : 'bg-opacity-20 hover:bg-opacity-30'
              }`}
              style={{
                backgroundColor: selectedCategories.includes(category.id)
                  ? category.color
                  : `${category.color}33`,
                color: selectedCategories.includes(category.id) ? 'white' : 'white'
              }}
              onClick={() => toggleCategory(category.id)}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="ml-2 text-blue-400 border-blue-400 hover:bg-blue-900 hover:bg-opacity-20"
            onClick={handleShowAll}
          >
            Show All
          </Button>
        </div>

        {/* Status indicator */}
        <div className="mb-4">
          {selectedCategories.length === 0 ? (
            <Badge className="bg-blue-600">
              Showing all jobs
            </Badge>
          ) : (
            <Badge className="bg-blue-600">
              Showing jobs in {jobCategories.find(cat => cat.id === selectedCategories[0])?.name || 'selected category'}
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          {selectedCategories.length === 0 ? (
            <p className="text-gray-300">
              Find job opportunities across various industries and categories. Browse positions based on your
              skills and interests, from technology to healthcare, creative fields to business roles.
            </p>
          ) : (
            <p className="text-gray-300">
              Find job opportunities in the {jobCategories.find(cat => cat.id === selectedCategories[0])?.name || 'selected'} field.
              Browse positions that match your skills and interests in this industry.
            </p>
          )}
        </div>

        {/* Job listings */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Latest Jobs <span className="text-sm font-normal text-gray-400">({filteredJobs.length} jobs)</span></h2>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="text-gray-300 border-gray-700">
                Sort
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-400">{job.company} • {job.location}</p>
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleApply(job.id)}
                    >
                      Apply
                    </Button>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-300">{job.salary}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseJobsPage;
