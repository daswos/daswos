import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Search, Users, BookOpen, Plus, FileText, AlertTriangle, Check, LogIn, BookmarkPlus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Sample collaborative searches for the Discover tab
const SAMPLE_SEARCHES = [
  {
    id: 1001,
    title: "Sustainable Urban Housing Solutions",
    description: "Researching eco-friendly and affordable housing solutions for urban areas facing population growth and environmental challenges.",
    topic: "Environmental Studies",
    isPublic: true,
    userId: 101,
    createdAt: "2025-03-15T12:00:00Z",
    updatedAt: "2025-03-20T14:30:00Z",
    resourceCount: 12,
    collaboratorCount: 5,
    tags: ["sustainability", "urban planning", "green architecture"]
  },
  {
    id: 1002,
    title: "AI in Healthcare Diagnostics",
    description: "Exploring the current and future applications of artificial intelligence in improving medical diagnoses and patient outcomes.",
    topic: "Healthcare Technology",
    isPublic: true,
    userId: 102,
    createdAt: "2025-03-10T09:15:00Z",
    updatedAt: "2025-03-19T16:45:00Z",
    resourceCount: 18,
    collaboratorCount: 7,
    tags: ["artificial intelligence", "healthcare", "medical technology"]
  },
  {
    id: 1003,
    title: "Remote Work's Impact on Urban Development",
    description: "Investigating how the shift to remote work is changing urban landscapes, real estate markets, and city planning priorities.",
    topic: "Urban Studies",
    isPublic: true,
    userId: 103,
    createdAt: "2025-03-05T11:30:00Z",
    updatedAt: "2025-03-18T10:20:00Z",
    resourceCount: 9,
    collaboratorCount: 4,
    tags: ["remote work", "urban planning", "real estate"]
  },
  {
    id: 1004,
    title: "Renewable Energy Storage Solutions",
    description: "Collaborative research on innovative energy storage technologies to address intermittency challenges in renewable energy systems.",
    topic: "Energy",
    isPublic: true,
    userId: 104,
    createdAt: "2025-02-28T14:45:00Z",
    updatedAt: "2025-03-17T13:10:00Z",
    resourceCount: 15,
    collaboratorCount: 6,
    tags: ["renewable energy", "battery technology", "sustainability"]
  },
  {
    id: 1005,
    title: "Food Security in Changing Climate",
    description: "Exploring sustainable agriculture practices and policies to ensure food security in regions most affected by climate change.",
    topic: "Agriculture",
    isPublic: true,
    userId: 105,
    createdAt: "2025-02-20T10:00:00Z",
    updatedAt: "2025-03-15T11:25:00Z",
    resourceCount: 21,
    collaboratorCount: 9,
    tags: ["food security", "climate change", "sustainable agriculture"]
  },
  {
    id: 1006,
    title: "Digital Privacy in Connected Devices",
    description: "Researching privacy implications and protection strategies for consumers using Internet of Things (IoT) and smart home devices.",
    topic: "Technology",
    isPublic: true,
    userId: 106,
    createdAt: "2025-02-15T16:20:00Z",
    updatedAt: "2025-03-12T09:50:00Z",
    resourceCount: 14,
    collaboratorCount: 5,
    tags: ["privacy", "IoT", "cybersecurity"]
  }
];

type CollaborativeSearch = {
  id: number;
  title: string;
  description: string;
  topic: string;
  isPublic: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  resourceCount?: number;
  collaboratorCount?: number;
};

type Resource = {
  id: number;
  searchId: number;
  title: string;
  description: string;
  url: string;
  createdAt: string;
  userId: number;
};

const CollaborativeSearchPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [topic, setTopic] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [newSearch, setNewSearch] = useState({
    title: '',
    description: '',
    topic: '',
    tags: [] as string[],
    isPublic: true
  });
  
  // Function to handle create button click
  const handleCreateButtonClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsLoginPromptOpen(true);
    } else {
      setIsCreateDialogOpen(true);
    }
  };
  
  // Fetch public collaborative searches
  const publicSearchesQuery = useQuery({
    queryKey: ['/api/collaborative-search', searchQuery, topic],
    enabled: activeTab === 'discover'
  });
  
  // Fetch user's own collaborative searches
  const mySearchesQuery = useQuery({
    queryKey: ['/api/collaborative-search/user'],
    enabled: activeTab === 'my-searches'
  });
  
  // Create new collaborative search mutation
  const createSearchMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/collaborative-search', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborative-search/user'] });
      setIsCreateDialogOpen(false);
      setNewSearch({
        title: '',
        description: '',
        topic: '',
        tags: [],
        isPublic: true
      });
      toast({
        title: 'Success',
        description: 'Collaborative search created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create collaborative search',
        variant: 'destructive'
      });
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ['/api/collaborative-search'] });
  };
  
  const handleCreateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have at least one tag (default to topic if none provided)
    const searchData = {...newSearch};
    if (searchData.tags.length === 0) {
      searchData.tags = [searchData.topic];
    }
    
    createSearchMutation.mutate(searchData);
  };
  
  const handleTopicFilter = (selectedTopic: string | null) => {
    setTopic(selectedTopic);
    queryClient.invalidateQueries({ queryKey: ['/api/collaborative-search'] });
  };
  
  // Topics for filtering
  const topicOptions = [
    'Technology',
    'Health',
    'Science',
    'Business',
    'Education',
    'Environment',
    'Politics',
    'Arts',
    'History'
  ];
  
  // For demo purposes, use the sample searches when in discover tab
  const getDisplayedSearches = () => {
    switch(activeTab) {
      case 'discover':
        // Use sample data for the discover tab
        return SAMPLE_SEARCHES.filter(search => {
          // Apply search term filter if any
          const matchesSearch = !searchQuery || 
            search.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            search.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (search.tags && search.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
          
          // Apply topic filter if any
          const matchesTopic = !topic || search.topic === topic;
          
          return matchesSearch && matchesTopic;
        });
      case 'collaborations':
        // In a real app, this would be searches the user is collaborating on
        // For now, just show the first 2 sample searches as an example
        return SAMPLE_SEARCHES.slice(0, 2);
      case 'my-searches':
        // User's own searches
        return (mySearchesQuery.data as CollaborativeSearch[] || []);
      default:
        return [];
    }
  };
  
  const displayedSearches = getDisplayedSearches();
  
  const isLoading = activeTab === 'my-searches' 
    ? mySearchesQuery.isLoading 
    : false; // Sample data is never loading
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Login Prompt Dialog */}
      <AlertDialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <LogIn className="h-5 w-5 mr-2 text-purple-600" />
              Sign in required
            </AlertDialogTitle>
            <AlertDialogDescription>
              You need to be signed in to create and save collaborative searches. Would you like to sign in or create an account now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsLoginPromptOpen(false);
              toast({
                title: "Not signed in",
                description: "You can continue browsing, but your searches won't be saved.",
                variant: "default"
              });
            }}>Continue without signing in</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-purple-600">
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Users className="h-6 w-6 mr-2 text-purple-600" />
          <h1 className="text-2xl font-bold">Collaborative Search</h1>
        </div>
        <p className="text-gray-600">
          Find research partners and collaborate on topics that interest you. Share and discover valuable resources together.
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="discover" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Collaborations
            </TabsTrigger>
            <TabsTrigger value="my-searches" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              My Searches
            </TabsTrigger>
          </TabsList>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setIsLoginPromptOpen(true);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collaborative Search</DialogTitle>
                <DialogDescription>
                  Start a new collaborative search to find partners with similar research interests.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSearch}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter a clear, descriptive title" 
                      value={newSearch.title}
                      onChange={(e) => setNewSearch({...newSearch, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe what you're researching and what kind of collaboration you're looking for" 
                      value={newSearch.description}
                      onChange={(e) => setNewSearch({...newSearch, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <select
                      id="topic"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newSearch.topic}
                      onChange={(e) => setNewSearch({...newSearch, topic: e.target.value})}
                      required
                    >
                      <option value="">Select a topic</option>
                      {topicOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="research, academic, collaboration"
                      value={newSearch.tags.join(', ')}
                      onChange={(e) => {
                        const tagInput = e.target.value;
                        const tagArray = tagInput.split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0);
                        setNewSearch({...newSearch, tags: tagArray});
                      }}
                    />
                    <p className="text-xs text-gray-500">Add relevant keywords to help others find your search</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="isPublic" 
                        checked={newSearch.isPublic}
                        onChange={(e) => setNewSearch({...newSearch, isPublic: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isPublic">Make this search public</Label>
                    </div>
                    
                    {!newSearch.isPublic && (
                      <div className="text-amber-600 text-sm flex items-start bg-amber-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          If your search is not public, other users won't be able to see it for potential collaboration.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={createSearchMutation.isPending}
                  >
                    {createSearchMutation.isPending ? 'Creating...' : 'Create Search'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value="discover" className="space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <form onSubmit={handleSearch} className="flex space-x-2 flex-1">
              <Input
                type="text"
                placeholder="Search for collaborative research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="topic-filter" className="whitespace-nowrap">Filter by Topic:</Label>
              <select
                id="topic-filter"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={topic || ''}
                onChange={(e) => handleTopicFilter(e.target.value || null)}
              >
                <option value="">All Topics</option>
                {topicOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedSearches.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No collaborative searches found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery || topic 
                  ? "Try a different search term or topic filter"
                  : "Be the first to create a collaborative search on a topic you're passionate about!"}
              </p>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSearches.map((search) => (
                <Card key={search.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{search.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Topic: {search.topic}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-3">{search.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {search.resourceCount || 0} resources
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {search.collaboratorCount || 1} collaborators
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => window.location.href = `/collaborative-search/${search.id}`}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="collaborations" className="space-y-6">
          {!user ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <LogIn className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Sign in to view your collaborations</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You need to be signed in to see the searches you're collaborating on.
              </p>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => window.location.href = '/login'}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </Button>
            </div>
          ) : displayedSearches.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">You're not collaborating on any searches yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Browse the Discover tab to find interesting collaborative searches to join.
              </p>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => setActiveTab('discover')}
              >
                <Search className="h-4 w-4 mr-2" />
                Discover Searches
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSearches.map((search) => (
                <Card key={search.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{search.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Topic: {search.topic}
                        </CardDescription>
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Collaborating
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-3">{search.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {search.resourceCount || 0} resources
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {search.collaboratorCount || 1} collaborators
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => window.location.href = `/collaborative-search/${search.id}`}
                    >
                      Continue
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-searches" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedSearches.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">You haven't created any collaborative searches yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Create your first collaborative search to find research partners and share resources.
              </p>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSearches.map((search) => (
                <Card key={search.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{search.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Topic: {search.topic}
                        </CardDescription>
                      </div>
                      {!search.isPublic && (
                        <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Private
                        </div>
                      )}
                      {search.isPublic && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Public
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-3">{search.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {search.resourceCount || 0} resources
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {search.collaboratorCount || 1} collaborators
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => window.location.href = `/collaborative-search/${search.id}`}
                    >
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-900">How Collaborative Search Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="font-medium mb-2">Find Research Partners</h3>
            <p className="text-sm text-gray-600">Discover others who are researching similar topics and build connections for collaborative learning.</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-medium mb-2">Share Valuable Resources</h3>
            <p className="text-sm text-gray-600">Contribute articles, websites, images, and other resources to a shared research space.</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-medium mb-2">Collaborate Effectively</h3>
            <p className="text-sm text-gray-600">Work together on complex topics with intuitive tools for organizing and discussing findings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};



export default CollaborativeSearchPage;