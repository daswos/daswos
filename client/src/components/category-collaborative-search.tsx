import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Plus, Clock, Star, Filter, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface CategoryCollaborativeSearchProps {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
}

// Sample data for demonstration purposes
const SAMPLE_SEARCHES = [
  {
    id: '1',
    title: 'Renaissance Art Techniques',
    description: 'Exploring the methods and materials used by Renaissance artists',
    topic: 'art-history',
    tags: ['renaissance', 'painting-techniques', 'art-history'],
    collaborators: 8,
    createdAt: '2023-10-15T14:30:00Z'
  },
  {
    id: '2',
    title: 'Contemporary Abstract Expressionism',
    description: 'Analyzing trends in modern abstract expressionist paintings',
    topic: 'contemporary-art',
    tags: ['abstract', 'expressionism', 'modern-art'],
    collaborators: 5,
    createdAt: '2023-11-02T09:15:00Z'
  },
  {
    id: '3',
    title: 'Digital Art vs Traditional Painting',
    description: 'Comparing techniques, market value, and artistic expression',
    topic: 'digital-art',
    tags: ['digital', 'traditional', 'comparison'],
    collaborators: 12,
    createdAt: '2023-09-28T16:45:00Z'
  }
];

const CategoryCollaborativeSearch: React.FC<CategoryCollaborativeSearchProps> = ({
  categoryId,
  categoryName,
  categoryColor
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Topics specific to Arts & Paintings
  const topics = [
    { id: 'art-history', name: 'Art History' },
    { id: 'contemporary-art', name: 'Contemporary Art' },
    { id: 'digital-art', name: 'Digital Art' },
    { id: 'painting-techniques', name: 'Painting Techniques' },
    { id: 'art-market', name: 'Art Market & Collecting' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would filter the results
    console.log('Searching for:', searchQuery);
  };

  const handleCreateNew = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to create a collaborative search',
        variant: 'default'
      });
      return;
    }
    
    // Navigate to create new collaborative search page
    navigate(`/collaborative-search/create?category=${categoryId}`);
  };

  const handleTopicFilter = (topicId: string) => {
    setSelectedTopic(selectedTopic === topicId ? null : topicId);
  };

  const handleJoinSearch = (searchId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join a collaborative search',
        variant: 'default'
      });
      return;
    }
    
    // Navigate to the specific collaborative search
    navigate(`/collaborative-search/${searchId}`);
  };

  // Filter searches based on search query and selected topic
  const filteredSearches = SAMPLE_SEARCHES.filter(search => {
    const matchesSearch = !searchQuery || 
      search.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      search.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopic = !selectedTopic || search.topic === selectedTopic;
    
    return matchesSearch && matchesTopic;
  });

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: `${categoryColor}15` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: categoryColor }} />
            <CardTitle className="text-lg">{categoryName} Collaborative Research</CardTitle>
          </div>
          <Button 
            onClick={handleCreateNew}
            style={{ backgroundColor: categoryColor }}
            className="text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New
          </Button>
        </div>
        <CardDescription>
          Connect with other art enthusiasts to research, discuss, and discover together
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Search and filter bar */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search collaborative research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </form>
        </div>
        
        {/* Topic filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.map(topic => (
            <Button
              key={topic.id}
              variant={selectedTopic === topic.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleTopicFilter(topic.id)}
              style={selectedTopic === topic.id ? { backgroundColor: categoryColor } : {}}
            >
              {topic.name}
            </Button>
          ))}
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="discover" className="mt-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-searches">My Research</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="mt-4">
            {filteredSearches.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No collaborative research found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchQuery || selectedTopic 
                    ? "Try a different search term or topic filter"
                    : "Be the first to create a collaborative research on this topic!"}
                </p>
                <Button 
                  className="mt-4"
                  style={{ backgroundColor: categoryColor }}
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Research
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSearches.map(search => (
                  <Card key={search.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{search.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{search.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {search.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{search.collaborators} collaborators</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm"
                          style={{ backgroundColor: categoryColor }}
                          className="text-white"
                          onClick={() => handleJoinSearch(search.id)}
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-searches" className="mt-4">
            {!user ? (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Sign in to view your research</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Sign in to create and manage your collaborative research projects
                </p>
                <Button 
                  className="mt-4"
                  style={{ backgroundColor: categoryColor }}
                  onClick={() => navigate('/auth/login')}
                >
                  Sign In
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Start your first research project</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Create a collaborative research project to connect with other art enthusiasts
                </p>
                <Button 
                  className="mt-4"
                  style={{ backgroundColor: categoryColor }}
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Research
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 flex justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredSearches.length}</span> active research projects
        </div>
        <Link href="/collaborative-search">
          <Button variant="link" className="text-sm p-0 h-auto" style={{ color: categoryColor }}>
            View all collaborative research
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CategoryCollaborativeSearch;
