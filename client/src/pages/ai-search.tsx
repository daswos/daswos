import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2, Search, Bot, ShoppingCart, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrustScore } from "@/components/trust-score";
import { formatPrice } from "@/lib/utils";

// Define the search schema
const aiSearchSchema = z.object({
  query: z.string().min(2, "Search query must be at least 2 characters")
});

type AiSearchFormValues = z.infer<typeof aiSearchSchema>;

type Recommendation = {
  id: number;
  userId: number;
  productId: number;
  product?: {
    id: number;
    title: string;
    price: number;
    imageUrl: string;
    trustScore: number;
    sellerName: string;
    sellerVerified: boolean;
  };
  reason: string;
  status: "pending" | "added_to_cart" | "purchased" | "rejected";
  confidence: number;
  createdAt: string;
  updatedAt?: string;
  purchasedAt?: string;
  rejectedReason?: string;
};

function AiSearchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Setup form
  const [isBulkBuy, setIsBulkBuy] = useState(false);
  
  const form = useForm<AiSearchFormValues>({
    resolver: zodResolver(aiSearchSchema),
    defaultValues: {
      query: ""
    }
  });

  // Fetch AI Shopper status to access settings
  const { data: aiShopperData, isLoading: isLoadingAiShopper } = useQuery({
    queryKey: ["/api/user/ai-shopper"],
    queryFn: async () => {
      return apiRequest<{
        enabled: boolean;
        settings: {
          autoPurchase: boolean;
          budgetLimit: number;
          preferredCategories: string[];
          avoidTags: string[];
          minimumTrustScore: number;
        }
      }>("/api/user/ai-shopper", { method: 'GET' });
    },
    enabled: !!user
  });

  // Fetch AI Shopper recommendations
  const { 
    data: recommendations = [], 
    isLoading: isLoadingRecommendations,
    refetch: refetchRecommendations
  } = useQuery({
    queryKey: ["/api/user/ai-shopper/recommendations"],
    queryFn: async () => {
      return apiRequest<Recommendation[]>("/api/user/ai-shopper/recommendations", { method: 'GET' });
    },
    enabled: !!user && searchPerformed
  });

  // Generate AI recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data: { query: string }) => {
      return apiRequest("POST", "/api/user/ai-shopper/generate", { 
        searchQuery: data.query,
        bulkBuy: isBulkBuy 
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Search Complete",
        description: data.message || "Generated new recommendations",
      });
      refetchRecommendations();
    },
    onError: (error) => {
      toast({
        title: "Search Error",
        description: "Failed to find matching products. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate recommendations:", error);
    }
  });

  // Update recommendation status
  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      return apiRequest("PUT", `/api/user/ai-shopper/recommendations/${id}`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/ai-shopper/recommendations"] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AiSearchFormValues) => {
    setSearchPerformed(true);
    generateRecommendationsMutation.mutate({ query: data.query });
  };

  const addToCart = (id: number) => {
    updateRecommendationMutation.mutate({ id, status: "added_to_cart" });
  };

  const buyNow = (id: number) => {
    updateRecommendationMutation.mutate({ id, status: "purchased" });
    toast({
      title: "Purchase Initiated",
      description: "Your order has been placed successfully!",
    });
  };

  const rejectItem = (id: number) => {
    updateRecommendationMutation.mutate({ 
      id, 
      status: "rejected",
      reason: "Manually rejected by user" 
    });
  };

  if (isLoadingAiShopper) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading AI Search...</span>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col items-start mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Bot className="h-7 w-7 mr-2 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">AI Search</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant={isBulkBuy ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsBulkBuy(true)}
              className={isBulkBuy ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              Bulk Buy
            </Button>
            <Button 
              variant={!isBulkBuy ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsBulkBuy(false)}
            >
              Standard
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          {isBulkBuy 
            ? "Tell our AI what bulk products you're looking for from verified sellers" 
            : "Tell our AI what you're looking for and it will find the best products"}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What are you looking for?</CardTitle>
          <CardDescription>
            {isBulkBuy 
              ? "Describe bulk items you need in natural language, our AI will find verified sellers with the best bulk deals" 
              : "Describe what you want in natural language, and our AI will find the best matches"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault(); // Prevent default form submission behavior
              form.handleSubmit(onSubmit)(e);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={isBulkBuy 
                            ? "e.g., 50 office chairs for our new workspace, delivered by next month"
                            : "e.g., A comfortable office chair with good back support under $200"
                          } 
                          {...field} 
                          className="pr-24 text-base py-6"
                        />
                        <Button 
                          type="button" // Changed from submit to button to avoid form submission
                          onClick={() => form.handleSubmit(onSubmit)()}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2"
                          disabled={generateRecommendationsMutation.isPending}
                        >
                          {generateRecommendationsMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Search
                            </>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {isBulkBuy 
                        ? "Include details like quantity, delivery timeline, price range, and specifications"
                        : "Include details like price range, features, colors, or styles"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {generateRecommendationsMutation.isPending ? (
        <div className="mt-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2">Searching for the perfect products...</p>
        </div>
      ) : searchPerformed && (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            {recommendations.length > 0 
              ? "Here's what we found for you" 
              : "No matches found"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{recommendation.product?.title}</CardTitle>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-semibold text-primary">
                      {formatPrice(recommendation.product?.price || 0)}
                    </p>
                    <TrustScore score={recommendation.product?.trustScore || 0} />
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  {recommendation.product?.imageUrl && (
                    <div className="relative h-40 mb-3 bg-slate-100 rounded-md overflow-hidden">
                      <img 
                        src={recommendation.product.imageUrl} 
                        alt={recommendation.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {recommendation.product?.sellerVerified 
                          ? "Verified Seller" 
                          : "Standard Seller"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {recommendation.product?.sellerName}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {recommendation.reason}
                    </p>
                    
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium mr-1">
                        Match confidence:
                      </span>
                      <div 
                        className="h-2 flex-grow rounded-full bg-slate-200"
                      >
                        <div 
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${recommendation.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs ml-1 font-medium">
                        {recommendation.confidence}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <div className="flex justify-between w-full space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => addToCart(recommendation.id)}
                      disabled={
                        recommendation.status === "added_to_cart" || 
                        recommendation.status === "purchased" ||
                        updateRecommendationMutation.isPending
                      }
                    >
                      {recommendation.status === "added_to_cart" ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-1 h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => buyNow(recommendation.id)}
                      disabled={
                        recommendation.status === "purchased" ||
                        updateRecommendationMutation.isPending
                      }
                    >
                      Buy Now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {recommendations.length === 0 && searchPerformed && !isLoadingRecommendations && (
            <div className="text-center py-8">
              <p className="text-lg">No products found matching your search.</p>
              <p className="text-muted-foreground">Try adjusting your search terms or check your AI Shopper settings.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Export directly as the component since the route is defined in App.tsx
export default AiSearchPage;