import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, Search, Users, BookOpen, Plus, FileText, 
  ExternalLink, Lock, Globe, Calendar, User, Share2 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

// Type definition for useParams
interface Params {
  id: string;
}

type CollaborativeSearch = {
  id: number;
  title: string;
  description: string;
  topic: string;
  isPublic: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type Resource = {
  id: number;
  searchId: number;
  title: string;
  description: string;
  url: string;
  createdAt: string;
  userId: number;
  username?: string;
};

type Collaborator = {
  id: number;
  searchId: number;
  userId: number;
  role: string;
  username?: string;
  addedAt: string;
};

type PermissionRequest = {
  id: number;
  resourceId: number;
  userId: number;
  status: string;
  requestedAt: string;
  username?: string;
};

const CollaborativeSearchDetailPage = () => {
  const params = useParams<Params>();
  const id = params?.id; 
  const searchId = id ? parseInt(id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('resources');
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    url: '',
    searchId
  });
  
  // Fetch collaborative search details
  const searchQuery = useQuery({
    queryKey: ['/api/collaborative-search', searchId],
    enabled: !!searchId && !isNaN(searchId)
  });
  
  // Fetch resources for this search
  const resourcesQuery = useQuery({
    queryKey: ['/api/collaborative-search', searchId, 'resources'],
    enabled: !!searchId && !isNaN(searchId)
  });
  
  // Fetch collaborators for this search
  const collaboratorsQuery = useQuery({
    queryKey: ['/api/collaborative-search', searchId, 'collaborators'],
    enabled: !!searchId && !isNaN(searchId) && activeTab === 'collaborators'
  });
  
  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/collaborative-resource', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborative-search', searchId, 'resources'] });
      setIsAddResourceDialogOpen(false);
      setNewResource({
        title: '',
        description: '',
        url: '',
        searchId
      });
      toast({
        title: 'Success',
        description: 'Resource added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add resource',
        variant: 'destructive'
      });
    }
  });
  
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    addResourceMutation.mutate(newResource);
  };
  
  const search = searchQuery.data as CollaborativeSearch;
  const resources = resourcesQuery.data as Resource[] || [];
  const collaborators = collaboratorsQuery.data as Collaborator[] || [];
  
  if (searchQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!search) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Collaborative Search Not Found</h2>
        <p className="text-gray-600 mb-6">
          The collaborative search you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => window.location.href = '/collaborative-search'}>
          Back to Collaborative Search
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center mb-1">
          <Button 
            variant="link" 
            className="p-0 mr-2"
            onClick={() => window.location.href = '/collaborative-search'}
          >
            Collaborative Search
          </Button>
          <span className="text-gray-500">/</span>
          <span className="ml-2">{search.title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{search.title}</h1>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <Calendar className="h-4 w-4 mr-1" />
                Created {format(new Date(search.createdAt), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center mr-4">
                <FileText className="h-4 w-4 mr-1" />
                {resources.length} resources
              </div>
              <div className="flex items-center">
                {search.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1" />
                    Private
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                // Copy share link to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: 'Link copied',
                  description: 'Share link copied to clipboard',
                });
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Resource</DialogTitle>
                  <DialogDescription>
                    Share a valuable resource with this collaborative search group.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddResource}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        placeholder="Enter a clear, descriptive title for this resource" 
                        value={newResource.title}
                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe this resource and why it's valuable" 
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input 
                        id="url" 
                        type="url"
                        placeholder="https://example.com" 
                        value={newResource.url}
                        onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddResourceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={addResourceMutation.isPending}
                    >
                      {addResourceMutation.isPending ? 'Adding...' : 'Add Resource'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-1">Description</h3>
          <p className="text-gray-700">{search.description}</p>
          <div className="mt-2 inline-block bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded">
            {search.topic}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="resources" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Collaborators
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources" className="space-y-6">
          {resourcesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No resources yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                Be the first to add a valuable resource to this collaborative search.
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsAddResourceDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Resource
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    {resource.username && (
                      <CardDescription className="text-sm text-gray-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Added by {resource.username}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-700 mb-3">{resource.description}</p>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Resource
                    </a>
                  </CardContent>
                  <CardFooter className="pt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added on {format(new Date(resource.createdAt), 'MMM d, yyyy')}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="collaborators" className="space-y-6">
          {collaboratorsQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No collaborators yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                Share this search with others to invite them to collaborate.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: 'Link copied',
                    description: 'Share link copied to clipboard',
                  });
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{collaborator.username || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <div className="mr-3 capitalize">{collaborator.role}</div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {format(new Date(collaborator.addedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborativeSearchDetailPage;