import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, ShoppingBasket, Check, X, ShoppingCart,
  Info, ArrowRight, ArrowLeft, Coins, RefreshCw, Trash2
} from "lucide-react";
import { z } from "zod";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrustScore } from "@/components/trust-score";
import { formatPrice } from "@/lib/utils";

// Define the settings schema
const aiShopperSettingsSchema = z.object({
  enabled: z.boolean(),
  settings: z.object({
    autoPurchase: z.boolean().default(false),
    budgetLimit: z.number().min(100).max(100000).default(5000), // 1 to 1000 dollars in cents
    preferredCategories: z.array(z.string()).default([]),
    avoidTags: z.array(z.string()).default([]),
    minimumTrustScore: z.number().min(0).max(100).default(85)
  })
});

type AiShopperSettings = z.infer<typeof aiShopperSettingsSchema>;

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

function AiShopperPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  // Initialize activeTab from localStorage if available, otherwise default to "recommendations"
  const [activeTab, setActiveTab] = useState<"recommendations" | "automated">(() => {
    // Try to get saved tab from localStorage
    const savedTab = localStorage.getItem("daswosAiActiveTab");
    return (savedTab === "automated" ? "automated" : "recommendations");
  });
  // Define state for shopping list search
  const [shoppingListQuery, setShoppingListQuery] = useState("");
  // State to toggle showing rejected items
  const [showRejectedItems, setShowRejectedItems] = useState(false);

  // Define the type for AI Shopper data
  interface AiShopperData {
    enabled: boolean;
    freeAccess?: boolean;
    devMessage?: string;
    settings: {
      autoPurchase: boolean;
      budgetLimit: number;
      preferredCategories: string[];
      avoidTags: string[];
      minimumTrustScore: number;
    };
  }
  
  // Fetch AI Shopper status and settings
  const { 
    data: aiShopperData, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings 
  } = useQuery({
    queryKey: ["/api/user/ai-shopper"],
    queryFn: async () => {
      return apiRequest<AiShopperData>("/api/user/ai-shopper", { method: 'GET' });
    },
    enabled: !!user,
    staleTime: 300000, // Data will be considered fresh for 5 minutes to reduce refreshes
    refetchOnWindowFocus: false, // Prevents refetching when focus returns to window
    refetchOnMount: false, // Prevents refetching when component mounts if data exists
    refetchOnReconnect: false // Prevents refetching when reconnecting
  });

  // Fetch DasWos Coins balance
  const { 
    data: coinsData = { balance: 0 }
  } = useQuery({
    queryKey: ["/api/user/daswos-coins/balance"],
    queryFn: async () => {
      return apiRequest<{ balance: number }>("/api/user/daswos-coins/balance", { method: 'GET' });
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
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
    enabled: !!user && !!aiShopperData?.enabled,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  
  // Generate AI recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data?: {
      searchQuery?: string;
      bulkBuy?: boolean;
      shoppingList?: string;
      clearExisting?: boolean;
    }) => {
      // Store current tab before mutation
      const currentTab = activeTab;
      
      try {
        // If clearExisting is true, first clear all existing recommendations
        if (data?.clearExisting) {
          try {
            await apiRequest("/api/user/ai-shopper/recommendations/clear", { method: "POST" });
          } catch (error) {
            console.error("Failed to clear existing recommendations:", error);
            // Continue with generating new ones even if clearing fails
          }
        }
        
        // Include an empty query to prevent server from using undefined parameters
        const result = await apiRequest("POST", "/api/user/ai-shopper/generate", {
          searchQuery: data?.searchQuery || "",
          bulkBuy: data?.bulkBuy || false,
          shoppingList: data?.shoppingList || ""
        });
        
        // Ensure tab doesn't change during this operation
        setTimeout(() => {
          if (localStorage.getItem("daswosAiActiveTab") !== currentTab) {
            localStorage.setItem("daswosAiActiveTab", currentTab);
            setActiveTab(currentTab);
          }
        }, 0);
        
        return result;
      } catch (error) {
        // Restore tab on error
        localStorage.setItem("daswosAiActiveTab", currentTab);
        setActiveTab(currentTab);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Generated new recommendations",
      });
      // Use refetchQueries for more controlled refetch
      queryClient.refetchQueries({ 
        queryKey: ["/api/user/ai-shopper/recommendations"],
        exact: true
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate recommendations:", error);
    }
  });

  // Setup form
  const form = useForm<AiShopperSettings>({
    resolver: zodResolver(aiShopperSettingsSchema),
    defaultValues: {
      enabled: false,
      settings: {
        autoPurchase: false,
        budgetLimit: 5000, // Default $50
        preferredCategories: [],
        avoidTags: [],
        minimumTrustScore: 85
      }
    }
  });

  // Update form values when we get data from the server
  useEffect(() => {
    if (aiShopperData) {
      let settings = {
        ...aiShopperData.settings,
        // Ensure all required properties exist
        autoPurchase: aiShopperData.settings.autoPurchase ?? false,
        budgetLimit: aiShopperData.settings.budgetLimit ?? 5000,
        preferredCategories: aiShopperData.settings.preferredCategories ?? [],
        avoidTags: aiShopperData.settings.avoidTags ?? [],
        minimumTrustScore: aiShopperData.settings.minimumTrustScore ?? 85
      };

      // If this is free access mode, check localStorage for overrides
      if (aiShopperData.freeAccess) {
        try {
          const savedSettings = localStorage.getItem("daswosAiSettings");
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            
            // Only override the autoPurchase setting from localStorage if it exists
            if (typeof parsedSettings.autoPurchase !== "undefined") {
              console.log("Using localStorage autoPurchase value:", parsedSettings.autoPurchase);
              settings = {
                ...settings,
                autoPurchase: parsedSettings.autoPurchase
              };
            }
          }
        } catch (error) {
          console.error("Error loading settings from localStorage:", error);
        }
      }

      form.reset({
        enabled: aiShopperData.enabled,
        settings
      });
    }
  }, [aiShopperData, form]);

  // Update AI Shopper settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AiShopperSettings) => {
      // Store current tab before mutation
      const currentTab = activeTab;
      try {
        const result = await apiRequest("PUT", "/api/user/ai-shopper", data);
        // Ensure tab doesn't change during this operation
        setTimeout(() => {
          if (localStorage.getItem("daswosAiActiveTab") !== currentTab) {
            localStorage.setItem("daswosAiActiveTab", currentTab);
            setActiveTab(currentTab);
          }
        }, 0);
        return result;
      } catch (error) {
        // Restore tab on error
        localStorage.setItem("daswosAiActiveTab", currentTab);
        setActiveTab(currentTab);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Create a more specific toast message based on what was updated
      const isAutoPurchaseToggled = typeof form.getValues("settings.autoPurchase") !== "undefined";
      
      if (isAutoPurchaseToggled) {
        const autoPurchaseEnabled = form.getValues("settings.autoPurchase");
        toast({
          title: autoPurchaseEnabled ? "Automated Shopping Enabled" : "Automated Shopping Disabled",
          description: autoPurchaseEnabled 
            ? "You can now use Daswos AI to automatically shop for you."
            : "Automated shopping has been disabled.",
        });
      } else {
        toast({
          title: "Settings Updated",
          description: "Your AI Shopper settings have been saved.",
        });
      }
      
      // Force a complete refresh of AI shopper data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/user/ai-shopper"],
      });
      
      // Also refresh recommendations if needed
      queryClient.invalidateQueries({
        queryKey: ["/api/user/ai-shopper/recommendations"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update AI Shopper settings:", error);
    }
  });

  // Update recommendation status
  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ id, status, reason, removeFromList }: { id: number; status: string; reason?: string; removeFromList?: boolean }) => {
      // Store current tab before mutation
      const currentTab = activeTab;
      try {
        const result = await apiRequest("PUT", `/api/user/ai-shopper/recommendations/${id}`, { status, reason, removeFromList });
        // Ensure tab doesn't change during this operation
        setTimeout(() => {
          if (localStorage.getItem("daswosAiActiveTab") !== currentTab) {
            localStorage.setItem("daswosAiActiveTab", currentTab);
            setActiveTab(currentTab);
          }
        }, 0);
        return result;
      } catch (error) {
        // Restore tab on error
        localStorage.setItem("daswosAiActiveTab", currentTab);
        setActiveTab(currentTab);
        throw error;
      }
    },
    onSuccess: () => {
      // Using refetchQueries instead of invalidateQueries to minimize UI disruption
      queryClient.refetchQueries({ 
        queryKey: ["/api/user/ai-shopper/recommendations"],
        exact: true
      });
      toast({
        title: "Success",
        description: "Recommendation updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update recommendation. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update recommendation:", error);
    }
  });

  const onSubmit = (data: AiShopperSettings) => {
    // Make a direct call to the mutation with success handlers
    updateSettingsMutation.mutate(data, {
      onSuccess: () => {
        // Force refresh query data to update UI immediately
        queryClient.invalidateQueries({
          queryKey: ["/api/user/ai-shopper"]
        });
        
        // Check if we're toggling autoPurchase
        if (typeof data.settings?.autoPurchase !== "undefined") {
          const autoPurchaseEnabled = data.settings.autoPurchase;
          toast({
            title: autoPurchaseEnabled ? "Automated Shopping Enabled" : "Automated Shopping Disabled",
            description: autoPurchaseEnabled 
              ? "You can now use Daswos AI to automatically shop for you." 
              : "Automated shopping has been disabled.",
          });
        } else {
          toast({
            title: "Settings Updated",
            description: "Your AI Shopper settings have been saved.",
          });
        }
      }
    });
  };

  const toggleEnabled = () => {
    const newValue = !form.getValues("enabled");
    form.setValue("enabled", newValue);
    
    // Always submit the form when toggling enabled status
    onSubmit(form.getValues());
  };

  const toggleAutoPurchase = () => {
    // Remember we're in the "automated" tab
    localStorage.setItem("daswosAiActiveTab", "automated");
    
    const newValue = !form.watch("settings.autoPurchase");
    console.log("toggleAutoPurchase - Current value:", !newValue, "New value:", newValue);
    
    // Set the value in the form
    form.setValue("settings.autoPurchase", newValue);
    
    // Store the setting in localStorage to persist it for free mode
    try {
      // Store current settings in localStorage for free mode
      const currentSettings = {
        ...form.getValues().settings,
        autoPurchase: newValue,
      };
      localStorage.setItem("daswosAiSettings", JSON.stringify(currentSettings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
    
    // Log form values after setting
    console.log("Form values after setting:", form.getValues());
    
    // Use setTimeout to ensure the tab state is preserved
    setTimeout(() => {
      // Make sure we're on the automated tab
      if (activeTab !== "automated") {
        setActiveTab("automated");
      }
      console.log("Submitting form with values:", form.getValues());
      
      // Submit the form
      updateSettingsMutation.mutate(form.getValues(), {
        onSuccess: (result) => {
          // Check if this is free access mode
          const isFreeMode = result && 'freeAccess' in result && result.freeAccess === true;
          
          // If free mode, manually apply the changes directly to UI
          if (isFreeMode) {
            // We manually update our copy of aiShopperData to trigger UI updates
            if (aiShopperData) {
              const updatedData = {
                ...aiShopperData,
                settings: {
                  ...aiShopperData.settings,
                  autoPurchase: newValue
                }
              };
              
              // Update with manual dispatch to React Query cache
              queryClient.setQueryData(["/api/user/ai-shopper"], updatedData);
            }
          } else {
            // For regular mode, just invalidate the query to refresh data from server
            queryClient.invalidateQueries({
              queryKey: ["/api/user/ai-shopper"]
            });
          }
          
          toast({
            title: newValue ? "Automated Shopping Enabled" : "Automated Shopping Disabled",
            description: newValue ? 
              "You can now use Daswos AI to automatically shop for you." : 
              "Automated shopping has been disabled.",
          });
        }
      });
    }, 0);
  };

  const acceptRecommendation = (id: number) => {
    // First update the recommendation status
    updateRecommendationMutation.mutate(
      { id, status: "added_to_cart" },
      {
        onSuccess: async () => {
          try {
            // Then add it to the cart
            await fetch(`/api/user/cart/add-recommendation/${id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include' // Include cookies for authentication
            });
            
            toast({
              title: "Added to cart",
              description: "Item has been added to your cart",
              duration: 3000
            });
            
            // Refresh the cart data if needed
            queryClient.refetchQueries({
              queryKey: ["/api/user/cart"],
              exact: true
            });
          } catch (error) {
            console.error('Error adding recommendation to cart:', error);
            toast({
              title: "Error",
              description: "Failed to add item to cart. Please try again.",
              variant: "destructive",
              duration: 5000
            });
          }
        }
      }
    );
  };

  const addAllToCart = () => {
    // Only add recommendations that are still pending (not already in cart, purchased, or rejected)
    const pendingRecommendations = recommendations?.filter(rec => rec.status === 'pending') || [];
    
    if (pendingRecommendations.length === 0) {
      toast({
        title: "No items to add",
        description: "All recommendations are already in your cart or have been processed.",
      });
      return;
    }

    // Store current tab state
    const currentTab = activeTab;
    
    // Create a promise array for all mutations
    const statusUpdatePromises = pendingRecommendations.map(rec => 
      updateRecommendationMutation.mutateAsync({ id: rec.id, status: "added_to_cart" })
    );
    
    // Execute all status updates first
    Promise.all(statusUpdatePromises)
      .then(async () => {
        // Then add all items to cart
        const cartPromises = pendingRecommendations.map(rec => 
          fetch(`/api/user/cart/add-recommendation/${rec.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies for authentication
          }).then(response => {
            if (!response.ok) {
              throw new Error(`Failed to add recommendation ${rec.id} to cart`);
            }
            return response.json();
          })
        );

        try {
          await Promise.all(cartPromises);
          
          // Ensure tab doesn't change during this operation
          setTimeout(() => {
            if (localStorage.getItem("daswosAiActiveTab") !== currentTab) {
              localStorage.setItem("daswosAiActiveTab", currentTab);
              setActiveTab(currentTab);
            }
          }, 0);
          
          toast({
            title: "Success",
            description: `Added ${pendingRecommendations.length} items to your cart.`,
          });
          
          // Refresh both recommendations and cart
          queryClient.refetchQueries({ 
            queryKey: ["/api/user/ai-shopper/recommendations"],
            exact: true
          });
          
          queryClient.refetchQueries({ 
            queryKey: ["/api/user/cart"],
            exact: true
          });
        } catch (cartError) {
          console.error('Error adding items to cart:', cartError);
          toast({
            title: "Warning",
            description: "Some items may not have been added to your cart properly.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        // Restore tab on error
        localStorage.setItem("daswosAiActiveTab", currentTab);
        setActiveTab(currentTab);
        
        toast({
          title: "Error",
          description: "Failed to add items to cart. Please try again.",
          variant: "destructive",
        });
        console.error("Failed to add all items to cart:", error);
      });
  };

  const rejectRecommendation = (id: number) => {
    // When a user clicks "No Thanks", the item is rejected and won't show up again
    // until all other similar SafeSphere items have been shown to the user
    updateRecommendationMutation.mutate({ 
      id, 
      status: "rejected",
      reason: "Manually rejected by user",
      removeFromList: true // Completely remove from the current list
    });
    
    toast({
      title: "Item Rejected",
      description: "This item won't appear again until you've seen all other similar items.",
    });
  };
  
  // Function to reject all items (mark as rejected but keep them visible)
  const rejectAllItems = () => {
    // Get all displayed recommendations (whether pending, in cart, or rejected)
    if (!recommendations || recommendations.length === 0) {
      toast({
        title: "No items to reject",
        description: "There are no recommendations to reject.",
      });
      return;
    }

    // Store current tab state
    const currentTab = activeTab;
    
    // Create a promise array for all mutations - mark as rejected but don't remove from list
    const updatePromises = recommendations.map(rec => 
      updateRecommendationMutation.mutateAsync({ 
        id: rec.id, 
        status: "rejected",
        reason: "Rejected by user via Reject All function",
        removeFromList: false // Keep visible but mark as rejected
      })
    );
    
    // Execute all promises and show a toast when done
    Promise.all(updatePromises)
      .then(() => {
        // Ensure tab doesn't change during this operation
        setTimeout(() => {
          if (localStorage.getItem("daswosAiActiveTab") !== currentTab) {
            localStorage.setItem("daswosAiActiveTab", currentTab);
            setActiveTab(currentTab);
          }
        }, 0);
        
        toast({
          title: "Success",
          description: `All items have been marked as rejected.`,
        });
        
        // Use refetchQueries for more controlled refetch
        queryClient.refetchQueries({ 
          queryKey: ["/api/user/ai-shopper/recommendations"],
          exact: true
        });
      })
      .catch((error) => {
        // Restore tab on error
        localStorage.setItem("daswosAiActiveTab", currentTab);
        setActiveTab(currentTab);
        
        toast({
          title: "Error",
          description: "Failed to reject some items. Please try again.",
          variant: "destructive",
        });
        console.error("Failed to reject all items:", error);
      });
  };

  // Function to completely remove all items (clear the recommendation list)
  const removeAllItems = () => {
    // Get all displayed recommendations
    if (!recommendations || recommendations.length === 0) {
      toast({
        title: "No items to remove",
        description: "There are no recommendations to remove.",
      });
      return;
    }

    // Store current tab state
    const currentTab = activeTab;

    // Create a new endpoint request to clear all recommendations
    apiRequest("/api/user/ai-shopper/recommendations/clear", {
      method: "POST"
    })
      .then(() => {
        // Ensure tab doesn't change during this operation
        setTimeout(() => {
          if (localStorage.getItem("daswosAiActiveTab") !== currentTab) {
            localStorage.setItem("daswosAiActiveTab", currentTab);
            setActiveTab(currentTab);
          }
        }, 0);
        
        toast({
          title: "Success",
          description: `All recommendations have been removed. Generate a new list when you're ready.`,
        });
        
        // Use refetchQueries for more controlled refetch
        queryClient.refetchQueries({ 
          queryKey: ["/api/user/ai-shopper/recommendations"],
          exact: true
        });
      })
      .catch((error) => {
        // Restore tab on error
        localStorage.setItem("daswosAiActiveTab", currentTab);
        setActiveTab(currentTab);
        
        toast({
          title: "Error",
          description: "Failed to remove all items. Please try again.",
          variant: "destructive",
        });
        console.error("Failed to remove all items:", error);
      });
  };

  const buyNow = (id: number) => {
    updateRecommendationMutation.mutate({ id, status: "purchased" });
    toast({
      title: "Purchase Initiated",
      description: "Your order has been placed successfully!",
    });
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading AI Shopper...</span>
      </div>
    );
  }

  // Handle shopping list search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shoppingListQuery.trim()) {
      generateRecommendationsMutation.mutate({
        searchQuery: shoppingListQuery.trim(),
        bulkBuy: false,
        shoppingList: shoppingListQuery.trim(),
        clearExisting: true // Clear existing before generating new ones from search
      });
    }
  };

  // Handle individual item regeneration
  const regenerateItem = (itemId: number) => {
    // In a real implementation, this would call a specific API to regenerate just one item
    toast({
      title: "Regenerating Item",
      description: "Finding a new recommendation for this item...",
    });
    // For now we'll simulate by calling the full generate endpoint
    generateRecommendationsMutation.mutate({
      searchQuery: "",
      bulkBuy: false,
      shoppingList: "",
      // Don't clear existing recommendations when regenerating a single item
      clearExisting: false
    });
  };
  
  // Filter recommendations based on current view setting (current or rejected)
  const getFilteredRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return [];
    
    // Find recommendations that were rejected but not completely removed from list
    if (showRejectedItems) {
      return recommendations.filter(rec => rec.status === 'rejected');
    } 
    
    // In normal view, show all non-rejected items
    return recommendations.filter(rec => rec.status !== 'rejected');
  };

  return (
    <div className="container py-6 max-w-5xl">

      {/* Show disabled message if AI Shopper is not enabled */}
      {aiShopperData && !aiShopperData.enabled ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <X className="mr-2 h-5 w-5 text-red-500" />
              AI Shopper is currently disabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to enable AI Shopper in your account settings to use this feature.
              Once enabled, AI Shopper can recommend products based on your preferences and
              even make automated purchases if you choose to activate that feature.
            </p>
            <Button 
              onClick={() => window.location.href = '/ai-shopper-settings'}
              className="mt-2"
            >
              Go to AI Shopper Settings <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Tabs for AI Recommendations and Automated Purchases */}
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={(value) => {
              const newTab = value as "recommendations" | "automated";
              // Save tab selection to localStorage
              localStorage.setItem("daswosAiActiveTab", newTab);
              setActiveTab(newTab);
            }} 
            className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="recommendations" className="flex items-center">
                <ShoppingBasket className="h-4 w-4 mr-2" /> 
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="automated" className="flex items-center">
                <Coins className="h-4 w-4 mr-2" /> 
                Automated Purchases
              </TabsTrigger>
            </TabsList>

            {/* AI Recommendations Tab */}
            <TabsContent value="recommendations">
              {/* AI Shopper search with logo - only shown in recommendations tab */}
              {aiShopperData?.enabled && (
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-4">
                      <img 
                        src="/images/daswos-ai-logo.png" 
                        alt="Daswos AI Logo" 
                        className="h-12 w-auto" 
                      />
                    </div>
                    <CardDescription className="text-center">Describe what you're looking for and let AI find products for you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          placeholder="Describe products you're looking for... (e.g. 'noise-cancelling headphones for running')"
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          value={shoppingListQuery}
                          onChange={(e) => setShoppingListQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-black hover:bg-black/90 text-white"
                        disabled={generateRecommendationsMutation.isPending}
                      >
                        {generateRecommendationsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ShoppingBasket className="h-4 w-4 mr-2" />
                        )}
                        Search
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {!aiShopperData?.enabled ? (
                <Card className="bg-muted/40">
                  <CardHeader>
                    <CardTitle>AI Recommendations are Disabled</CardTitle>
                    <CardDescription>
                      Enable the AI Shopper to get personalized product recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-6 p-4 bg-primary/10 rounded-md">
                      <ShoppingBasket className="h-10 w-10 text-primary mr-4" />
                      <div>
                        <h3 className="font-semibold">Personalized Product Recommendations</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          When enabled, our Daswos AI will analyze your preferences and find
                          products that match your interests from the DasWohnen marketplace.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={toggleEnabled}
                      className="w-full md:w-auto bg-black hover:bg-black/90 text-white"
                    >
                      <ShoppingBasket className="h-4 w-4 mr-2" /> Enable AI Recommendations
                    </Button>
                  </CardContent>
                </Card>
              ) : isLoadingRecommendations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Finding recommendations for you...</span>
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div>
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <CardTitle>Recommendations</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          <Badge className="flex items-center">
                            <ShoppingBasket className="h-4 w-4 mr-1" /> {recommendations.length} Recommendations
                          </Badge>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={toggleEnabled}
                            className="bg-black hover:bg-black/90 text-white"
                          >
                            Disable AI Recommendations
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => generateRecommendationsMutation.mutate({ clearExisting: true })}
                            disabled={generateRecommendationsMutation.isPending}
                            className="bg-black hover:bg-black/90 text-white"
                          >
                            {generateRecommendationsMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ShoppingBasket className="h-4 w-4 mr-2" />
                            )}
                            Generate New List
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={addAllToCart}
                            disabled={updateRecommendationMutation.isPending}
                            className="bg-black hover:bg-black/90 text-white"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add All to Cart
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={rejectAllItems}
                            disabled={updateRecommendationMutation.isPending}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject All Items
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={removeAllItems}
                            disabled={updateRecommendationMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove All Items
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Personalized product recommendations from DasWos AI
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <div className="mb-6 flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRejectedItems(!showRejectedItems)}
                      className="flex items-center"
                    >
                      {showRejectedItems ? (
                        <>
                          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Current Recommendations
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" /> View Rejected Items ({recommendations.filter(rec => rec.status === 'rejected').length})
                        </>
                      )}
                    </Button>
                    
                    {showRejectedItems && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={removeAllItems}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Clear All Rejected Items
                      </Button>
                    )}
                  </div>
                  
                  {/* Title for current view */}
                  <h2 className="text-lg font-semibold mb-4">
                    {showRejectedItems 
                      ? "Previously Rejected Items" 
                      : "Current Recommendations"}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredRecommendations().map((recommendation: Recommendation) => (
                      <Card key={recommendation.id} className={recommendation.status === 'rejected' ? 'opacity-60' : ''}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-lg">
                              {recommendation.product?.title || "Product"}
                            </CardTitle>
                            <TrustScore score={recommendation.product?.trustScore || 0} size="sm" />
                          </div>
                          <CardDescription className="flex justify-between items-center">
                            <span>{recommendation.product?.sellerName || "Unknown Seller"}</span>
                            <Badge variant={recommendation.status === 'pending' ? 'outline' : recommendation.status === 'purchased' ? 'default' : recommendation.status === 'added_to_cart' ? 'secondary' : 'destructive'}>
                              {recommendation.status === 'pending' ? 'New' 
                              : recommendation.status === 'purchased' ? 'Purchased' 
                              : recommendation.status === 'added_to_cart' ? 'In Cart' 
                              : 'Rejected'}
                            </Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {recommendation.product?.imageUrl && (
                            <div className="relative h-40 mb-3 bg-muted rounded-md overflow-hidden">
                              <img 
                                src={recommendation.product.imageUrl} 
                                alt={recommendation.product.title || "Product image"} 
                                className="object-contain w-full h-full"
                              />
                              {/* Regenerate button for this specific item */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-white"
                                onClick={() => regenerateItem(recommendation.id)}
                                disabled={generateRecommendationsMutation.isPending}
                              >
                                {generateRecommendationsMutation.isPending ? 
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 
                                  <ShoppingBasket className="h-3 w-3 mr-1" />
                                }
                                Regenerate
                              </Button>
                            </div>
                          )}
                          <div className="text-lg font-semibold mb-1">
                            {recommendation.product?.price 
                              ? formatPrice(recommendation.product.price) 
                              : "$-.--"}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Why we picked this:</strong> {recommendation.reason}
                          </p>
                          {recommendation.rejectedReason && (
                            <p className="text-sm text-destructive mt-1">
                              <strong>Rejection reason:</strong> {recommendation.rejectedReason}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          {recommendation.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => rejectRecommendation(recommendation.id)}
                                disabled={updateRecommendationMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" /> No Thanks
                              </Button>
                              <div className="space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => acceptRecommendation(recommendation.id)}
                                  disabled={updateRecommendationMutation.isPending}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => buyNow(recommendation.id)}
                                  disabled={updateRecommendationMutation.isPending}
                                >
                                  <ShoppingBasket className="h-4 w-4 mr-1" /> Buy Now
                                </Button>
                              </div>
                            </>
                          )}
                          {recommendation.status === 'added_to_cart' && (
                            <div className="flex w-full justify-between">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => rejectRecommendation(recommendation.id)}
                                disabled={updateRecommendationMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" /> Remove
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => buyNow(recommendation.id)}
                                disabled={updateRecommendationMutation.isPending}
                              >
                                <ShoppingBasket className="h-4 w-4 mr-1" /> Complete Purchase
                              </Button>
                            </div>
                          )}
                          {recommendation.status === 'purchased' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              disabled
                            >
                              <Check className="h-4 w-4 mr-1" /> Purchased
                            </Button>
                          )}
                          {recommendation.status === 'rejected' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => acceptRecommendation(recommendation.id)}
                              disabled={updateRecommendationMutation.isPending}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart Anyway
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Recommendations</CardTitle>
                      </div>
                      <CardDescription>
                        Personalized product recommendations from DasWos AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="mb-4 flex justify-center">
                          <div className="rounded-full bg-primary/10 p-3">
                            <ShoppingBasket className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                          Recommendations will appear here as our AI finds products that match your preferences.
                          You can modify your preference settings in your account page.
                        </p>
                        <div className="flex justify-center space-x-4">
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = '/ai-shopper-settings'}
                          >
                            Configure Settings
                          </Button>
                          <Button
                            onClick={() => generateRecommendationsMutation.mutate({ clearExisting: true })}
                            disabled={generateRecommendationsMutation.isPending}
                            className="bg-black hover:bg-black/90 text-white"
                          >
                            {generateRecommendationsMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ShoppingBasket className="h-4 w-4 mr-2" />
                            )}
                            {generateRecommendationsMutation.isPending ? "Generating..." : "Generate Now"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <Info className="h-4 w-4 mr-2" /> How AI Recommendations Works
                    </AlertTitle>
                    <AlertDescription className="pt-2">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>The AI studies your search history and selected preferences</li>
                        <li>It identifies products that match your interests and criteria</li>
                        <li>Each recommendation includes a confidence score and reasoning</li>
                        <li>You can reject or accept recommendations as you prefer</li>
                        <li>Your feedback helps improve future recommendations</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>

            {/* Automated Purchases Tab */}
            <TabsContent value="automated">
              {/* Use form value directly instead of relying on server data */}
              {!form.watch("settings.autoPurchase") ? (
                <Card className="bg-muted/40">
                  <CardHeader>
                    <CardTitle>Automated Shopping is Disabled</CardTitle>
                    <CardDescription>
                      Enable automated shopping to let AI make purchases with your DasWos Coins
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-6 p-4 bg-primary/10 rounded-md">
                      <Coins className="h-10 w-10 text-primary mr-4" />
                      <div>
                        <h3 className="font-semibold">Automated Purchasing with AI</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          When enabled, our Daswos AI will automatically purchase products that 
                          perfectly match your preferences using your DasWos Coins balance.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={toggleAutoPurchase}
                      className="w-full md:w-auto bg-black hover:bg-black/90 text-white"
                    >
                      <Coins className="h-4 w-4 mr-2" /> Enable Automated Shopping
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Automated Shopping</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="flex items-center">
                            <Coins className="h-4 w-4 mr-1" /> {formatPrice(coinsData.balance)} DasWos Coins
                          </Badge>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={toggleAutoPurchase}
                            className="bg-black hover:bg-black/90 text-white"
                          >
                            Disable Automated Shopping
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Let AI automatically purchase products with your DasWos Coins
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/40 p-4 rounded-lg">
                        <div>
                          <h3 className="font-medium text-lg mb-2">Current Settings</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                              <span>Budget Limit:</span>
                              <span className="font-semibold">{formatPrice(aiShopperData?.settings?.budgetLimit || 0)} per week</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Minimum Trust Score:</span>
                              <span className="font-semibold">{aiShopperData?.settings?.minimumTrustScore || 0}/100</span>
                            </li>
                            <li className="flex justify-between">
                              <span>DasWos Coins Balance:</span>
                              <span className="font-semibold">{formatPrice(coinsData.balance)}</span>
                            </li>
                          </ul>
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              onClick={() => window.location.href = '/ai-shopper-settings'}
                              className="w-full"
                            >
                              Adjust Settings <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-lg mb-2">Available Categories</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {aiShopperData?.settings?.preferredCategories && aiShopperData?.settings?.preferredCategories.length > 0 ? (
                              aiShopperData?.settings?.preferredCategories.map((category: string) => (
                                <Badge key={category} variant="secondary">{category}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No preferred categories selected. Configure in settings.</p>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => {
                              // Start shopping using Daswos AI, similar to generateRecommendations but emphasizing auto-purchase
                              const isAutomated = form.getValues("settings.autoPurchase");
                              generateRecommendationsMutation.mutate({
                                bulkBuy: isAutomated, // Use the auto-purchase setting
                                clearExisting: true   // Clear existing recommendations
                              });
                            }}
                            size="lg"
                            disabled={generateRecommendationsMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4 flex items-center justify-center gap-2"
                          >
                            {generateRecommendationsMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Coins className="h-5 w-5" />
                                Daswos Start Shopping
                              </>
                            )}
                          </Button>
                          
                          {aiShopperData?.settings?.avoidTags && aiShopperData?.settings?.avoidTags.length > 0 && (
                            <>
                              <h3 className="font-medium text-lg mb-2">Avoided Tags</h3>
                              <div className="flex flex-wrap gap-2">
                                {aiShopperData?.settings?.avoidTags.map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="border-destructive text-destructive">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <Info className="h-4 w-4 mr-2" /> How Automated Shopping Works
                    </AlertTitle>
                    <AlertDescription className="pt-2">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>The AI analyzes your preferences and shopping patterns</li>
                        <li>When it finds suitable products, it uses your DasWos Coins to make purchases</li>
                        <li>You can control your spending limits and frequency in your account settings</li>
                        <li>All purchases follow your chosen trust score and category preferences</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Tip: Customize Your AI Shopper Experience</AlertTitle>
            <AlertDescription>
              Fine-tune your AI recommendations and automated shopping settings in your account page.
              <Button variant="link" className="p-0 h-auto font-semibold" 
                onClick={() => window.location.href = '/ai-shopper-settings'}>
                Go to Account Settings <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default AiShopperPage;