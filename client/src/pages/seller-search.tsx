import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Package, ShoppingBag, Store, ChevronRight, Bot, Loader2, Tag, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Define the search schema
const sellerSearchSchema = z.object({
  query: z.string().min(2, "Please describe what you're selling (at least 2 characters)")
});

type SellerSearchFormValues = z.infer<typeof sellerSearchSchema>;

// Interface for AI suggestions
interface AiSuggestion {
  category: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  confidence: number;
}

const SellerSearch: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('start');

  const handleListItemClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a listing.",
        variant: "destructive"
      });
      // Redirect to auth with list-item as redirect destination
      setLocation('/auth?redirect=/list-item');
      return;
    }
    
    // If user is authenticated, navigate directly to the list-item page
    setLocation('/list-item');
  };

  // Setup form
  const form = useForm<SellerSearchFormValues>({
    resolver: zodResolver(sellerSearchSchema),
    defaultValues: {
      query: ''
    }
  });

  // AI suggestions mutation
  const aiSuggestionsMutation = useMutation({
    mutationFn: async (data: { query: string }) => {
      return apiRequest('/api/seller/ai-suggestions', {
        method: 'POST',
        body: JSON.stringify({ query: data.query }),
      });
    },
    onSuccess: (data) => {
      setSearchPerformed(true);
      setActiveTab('suggestions');
      toast({
        title: "Suggestions Ready",
        description: "We've analyzed your product and prepared some recommendations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch AI suggestions from our API route
  const { 
    data: suggestions = [], 
    isLoading: isLoadingSuggestions 
  } = useQuery({
    queryKey: ['/api/seller/ai-suggestions', form.watch('query')],
    queryFn: async () => {
      if (!searchPerformed || !form.watch('query').trim()) return [];
      
      // Get suggestions from our API
      const response = await apiRequest('/api/seller/ai-suggestions', {
        method: 'POST',
        body: JSON.stringify({ query: form.watch('query') }),
      });
      
      return response as AiSuggestion[];
    },
    enabled: searchPerformed,
    // Don't auto-refresh the data
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity
  });

  const onSubmit = (data: SellerSearchFormValues) => {
    aiSuggestionsMutation.mutate({ query: data.query });
  };

  const useAiSuggestion = (suggestion: AiSuggestion) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a listing.",
        variant: "destructive"
      });
      
      // Redirect to auth with list-item as redirect destination
      setLocation('/auth?redirect=/list-item');
      return;
    }
    
    // Create a query string with all suggestion data
    const queryParams = new URLSearchParams({
      title: suggestion.title,
      price: suggestion.price.toString(),
      description: suggestion.description,
      category: suggestion.category,
      tags: suggestion.tags.join(','),
      condition: 'used' // Default condition
    });
    
    // If user is authenticated, navigate to the list-item page with query parameters
    setLocation(`/list-item?${queryParams.toString()}`);
    
    toast({
      title: "Suggestion Applied",
      description: "The listing form has been populated with the suggestion."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#E0E0E0] dark:bg-[#222222] py-6 flex-grow">
        <div className="container mx-auto px-4 text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center logo-container">
            <div className="px-16 py-6 inline-block">
              <DasWosLogo height={80} width="auto" />
            </div>
          </div>
          
          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">
            Sell on Daswos
          </h1>
          <p className="text-md text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-6">
            Our AI-powered selling experience makes it easy to list your items and reach buyers.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="start" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="start">Get Started</TabsTrigger>
                <TabsTrigger value="suggestions" disabled={!searchPerformed}>AI Suggestions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="start">
                {/* AI Search Bar */}
                <Card className="mb-8 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center justify-center">
                      <Bot className="h-5 w-5 mr-2 text-blue-500" />
                      AI Selling Assistant
                    </CardTitle>
                    <CardDescription>
                      Tell us what you're selling and get AI-powered listing suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                        <FormField
                          control={form.control}
                          name="query"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder={aiSuggestionsMutation.isPending ? "Analyzing..." : "What are you selling?"}
                                    {...field} 
                                    className="pr-28 text-base py-6 bg-blue-50 dark:bg-blue-900 rounded-none border-none"
                                    disabled={aiSuggestionsMutation.isPending}
                                  />
                                  {aiSuggestionsMutation.isPending && (
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                                    </div>
                                  )}
                                  <Button 
                                    type="submit"
                                    className="absolute right-0 top-0 h-full rounded-none border-none bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    disabled={aiSuggestionsMutation.isPending}
                                  >
                                    {aiSuggestionsMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                      </>
                                    ) : (
                                      <>
                                        <Bot className="mr-2 h-4 w-4" />
                                        Tell Daswos
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <p>
                      Example: "Black Nike running shoes, size 10, worn twice, original box included"
                    </p>
                  </CardFooter>
                </Card>

                {/* Divider with "OR" text */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#E0E0E0] dark:bg-[#222222] px-4 text-sm text-gray-500 dark:text-gray-400">
                      OR CREATE A LISTING DIRECTLY
                    </span>
                  </div>
                </div>

                {/* Main Action Card */}
                <Card className="mb-8 shadow-lg border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
                  <CardContent className="text-center pt-6">
                    <p className="mb-6">
                      Skip the AI suggestions and create your listing manually with our
                      AI-powered listing form.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-6"
                      onClick={handleListItemClick}
                    >
                      <Package className="mr-2 h-5 w-5" />
                      List an Item
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Seller Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2 text-orange-500" />
                        Seller Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Access analytics, manage listings, and track sales with our comprehensive seller dashboard.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setLocation('/seller-hub')}
                      >
                        Seller Hub
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Store className="h-5 w-5 mr-2 text-green-500" />
                        Get Verified
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Boost buyer trust and unlock premium features by becoming a verified Daswos seller.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setLocation('/verification-process')}
                      >
                        Verification Process
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions">
                {aiSuggestionsMutation.isPending ? (
                  <div className="mt-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="mt-2">Analyzing your product and preparing suggestions...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <h2 className="text-2xl font-semibold">
                        {suggestions.length > 0 
                          ? "Listing Suggestions" 
                          : "No suggestions found"}
                      </h2>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('start')}
                      >
                        Back to Search
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <Card key={index} className="text-left">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                                <Badge className="bg-blue-500 hover:bg-blue-600">
                                  {suggestion.category}
                                </Badge>
                              </div>
                              <CardDescription>
                                Estimated Price: ${suggestion.price.toFixed(2)}
                              </CardDescription>
                            </CardHeader>
                            
                            <CardContent>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                {suggestion.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {suggestion.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center mt-2">
                                <span className="text-xs font-medium mr-1">
                                  Match confidence:
                                </span>
                                <div 
                                  className="h-2 w-full rounded-full bg-slate-200"
                                >
                                  <div 
                                    className="h-full rounded-full bg-blue-500"
                                    style={{ width: `${suggestion.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs ml-1 font-medium">
                                  {suggestion.confidence}%
                                </span>
                              </div>
                            </CardContent>
                            
                            <CardFooter>
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => useAiSuggestion(suggestion)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Use This Suggestion
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                              No suggestions were found for your query. Try a more detailed description or create a listing manually.
                            </p>
                            <Button onClick={handleListItemClick}>
                              Create Manual Listing
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Navigation tabs */}
          <div className="border-t border-b border-gray-400 dark:border-gray-600 flex justify-center mt-12 nav-tabs">
            <div className="w-full max-w-xl flex text-sm">
              <button 
                className="flex-1 py-2 border-r border-gray-400 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white nav-tab"
                onClick={() => setLocation('/for-sellers')}
              >
                Selling Guide
              </button>
              <button 
                className="flex-1 py-2 border-r border-gray-400 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white nav-tab"
                onClick={() => setLocation('/seller-hub')}
              >
                Seller Hub
              </button>
              <button 
                className="flex-1 py-2 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white nav-tab"
                onClick={() => setLocation('/verification-process')}
              >
                Get Verified
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSearch;