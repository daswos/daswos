import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2, ShoppingBasket, Check, X, ShoppingCart, Settings,
  Info, ArrowRight, ArrowLeft, Coins, RefreshCw, Trash2, Play,
  Power as PowerIcon, PowerOff, PauseCircle, PlayCircle, Send,
  Bot, User, MoreVertical, MessageCircle, BadgeCheck, ArrowLeftRight,
  Package
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { formatPrice } from "@/lib/formatters";
import DasWosCoinDisplay from "@/components/shared/daswos-coin-display";
import DasWosCoinIcon from "@/components/shared/daswos-coin-icon";
import TrustScore from "../components/products/trust-score";
import CarouselSearchResults from '@/components/carousel-search-results';

// Define schemas

const chatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
});

const aiShopperSettingsSchema = z.object({
  enabled: z.boolean(),
  settings: z.object({
    autoPurchase: z.boolean(),
    budgetLimit: z.number().min(0),
    preferredCategories: z.array(z.string()),
    avoidTags: z.array(z.string()),
    minimumTrustScore: z.number().min(0).max(100),
  }),
});

// Define types
type AiShopperSettings = z.infer<typeof aiShopperSettingsSchema>;
type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  recommendations?: Recommendation[];
};

type CartItemWithProduct = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  updatedAt?: string;
  source: string; // "manual", "ai_shopper", "saved_for_later"
  recommendationId?: number;
  product?: {
    id: number;
    title: string;
    price: number;
    imageUrl: string;
    trustScore: number;
    sellerName: string;
    sellerVerified: boolean;
  };
};

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

// Main Component
function DaswosAiPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // State for settings dialog
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // State for cart clearing confirmation dialog
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for purchase countdown
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(30); // Default 30 seconds countdown

  // State for showing rejected items
  const [showRejectedItems, setShowRejectedItems] = useState(false);

  // Chat-related state
  const [messages, setMessages] = useState<Message[]>([
    // Add welcome message
    {
      id: 'welcome-message',
      role: 'assistant',
      content: `Welcome to Automated Shopping! I can help you shop using your Daswos coins:

• Tell me what products you're looking for
• Request me to compare options and find the best deals
• Ask me to purchase items automatically within your budget
• Setup preferences for the types of products you want

How would you like me to assist with your shopping today?`,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [processingMessage, setProcessingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch cart items
  const {
    data: cartItems = [],
    isLoading: isLoadingCart,
    refetch: refetchCart
  } = useQuery({
    queryKey: ['/api/user/cart'],
    queryFn: async () => {
      return apiRequest<CartItemWithProduct[]>('/api/user/cart', {
        method: 'GET',
        credentials: 'include' // Include cookies for session consistency
      });
    },
    staleTime: 30000, // 30 seconds
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/user/cart', {});
    },
    onSuccess: () => {
      toast({
        title: "Cart Cleared",
        description: "Your shopping cart has been cleared",
      });

      // Refresh cart data
      queryClient.refetchQueries({
        queryKey: ['/api/user/cart'],
        exact: true
      });

      // Close dialog
      setShowClearCartDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear your shopping cart. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to clear cart:", error);
    }
  });

  // Filter cart items to show only AI-selected items (from Daswos AI)
  const daswosCartItems = cartItems.filter(item => item.source === 'ai_shopper');

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    const seconds = totalSeconds - (hours * 3600) - (minutes * 60);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Chat message submission and response generation
  const generateResponseMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      return apiRequest<{ response: string; recommendations?: Recommendation[] }>(
        "POST",
        "/api/user/ai-shopper/chat",
        { message: data.message }
      );
    },
    onSuccess: (data, variables) => {
      setProcessingMessage(false);

      // Update existing loading message with actual response
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.loading ?
            {
              ...msg,
              loading: false,
              content: data.response,
              recommendations: data.recommendations || []
            } :
            msg
        )
      );

      // Refresh recommendations if needed
      if (data.recommendations && data.recommendations.length > 0) {
        refetchRecommendations();
      }
    },
    onError: (error) => {
      setProcessingMessage(false);

      // Replace loading message with error message
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.loading ?
            {
              ...msg,
              loading: false,
              content: "Sorry, I encountered an error processing your request. Please try again later."
            } :
            msg
        )
      );

      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate AI response:", error);
    }
  });

  // Effect to scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Effect for countdown timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // If countdown is active, start a timer to update every second
    if (countdownActive && countdownSeconds > 0) {
      intervalId = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            // When countdown reaches zero, perform the automated purchase
            // This is where we would call the API to process the purchase
            toast({
              title: "Purchase Completed",
              description: "The AutoShop has purchased the items in your cart.",
            });
            setCountdownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownSeconds <= 0 && countdownActive) {
      // If countdown is active but seconds is at 0, disable the countdown
      setCountdownActive(false);
    }

    // Cleanup the interval on component unmount or when countdown stops
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [countdownActive, countdownSeconds, toast]);

  // Handle sending a chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentMessage.trim()) return;

    // Save the message for processing
    const messageText = currentMessage;

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Add assistant loading message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setCurrentMessage("");
    setProcessingMessage(true);

    // Check if this looks like a product search query
    const searchTerms = ["find", "search", "looking for", "recommend", "show me", "want to buy", "shop for"];
    const isProductSearch = searchTerms.some(term =>
      messageText.toLowerCase().includes(term)
    );

    // If it looks like a product search, also trigger the recommendation API
    if (isProductSearch) {
      // Generate recommendations through the API
      generateRecommendationsMutation.mutate({
        searchQuery: messageText,
        clearExisting: false
      });
    }

    // Send message to server for AI response
    generateResponseMutation.mutate({ message: messageText });
  };

  // Generate AI recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data?: {
      searchQuery?: string;
      bulkBuy?: boolean;
      shoppingList?: string;
      clearExisting?: boolean;
    }) => {
      try {
        // If clearExisting is true, first clear all existing recommendations
        if (data?.clearExisting) {
          try {
            await apiRequest("/api/user/ai-shopper/recommendations/clear", { method: "POST" });
          } catch (error) {
            console.error("Failed to clear existing recommendations:", error);
          }
        }

        // Include an empty query to prevent server from using undefined parameters
        const result = await apiRequest("POST", "/api/user/ai-shopper/generate", {
          searchQuery: data?.searchQuery || "",
          bulkBuy: data?.bulkBuy || false,
          shoppingList: data?.shoppingList || ""
        });

        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Refresh recommendations
      refetchRecommendations().then((refreshData) => {
        // Function to show recommendations in chat
        const showRecommendationsInChat = () => {
          // Only show the freshly generated recommendations that match the search query
          if (variables?.searchQuery && refreshData?.data) {
            const query = variables.searchQuery.toLowerCase();
            const newRecommendations = refreshData.data;

            const freshRecommendations = newRecommendations.filter(rec => {
              const title = rec.product?.title?.toLowerCase() || "";
              const reason = rec.reason?.toLowerCase() || "";

              return (title.includes(query) || reason.includes(query)) &&
                rec.status === "pending";
            });

            if (freshRecommendations.length > 0) {
              // Add AI message with recommendations
              setMessages(prev => [...prev, {
                id: `assistant-recommendations-${Date.now()}`,
                role: 'assistant',
                content: `Based on your search for "${variables.searchQuery}", here are some recommendations I found:`,
                timestamp: new Date(),
                recommendations: freshRecommendations
              }]);
            }
          }
        };

        // Show recommendations with the fresh data
        showRecommendationsInChat();
      });

      // Show success toast
      toast({
        title: "Success",
        description: data.message || "Generated new recommendations",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate recommendations:", error);

      // Add error message to chat
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I couldn't find any products matching your request. Please try a different search or check back later.",
        timestamp: new Date()
      }]);
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
      return apiRequest("PUT", "/api/user/ai-shopper", data);
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
          description: "Your Daswos AI settings have been saved.",
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

      // Close settings dialog
      setIsSettingsDialogOpen(false);

      // Add a message to the chat about settings change
      if (isAutoPurchaseToggled) {
        const autoPurchaseEnabled = form.getValues("settings.autoPurchase");
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: autoPurchaseEnabled
            ? "Automated shopping has been enabled. I'll now help you find and purchase products based on your preferences."
            : "Automated shopping has been disabled. I'll continue to recommend products, but won't make purchases automatically.",
          timestamp: new Date()
        }]);
      }
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

  // Update recommendation status (add to cart or reject)
  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      return apiRequest("PUT", `/api/user/ai-shopper/recommendations/${id}`, { status, reason });
    },
    onSuccess: () => {
      // Refresh recommendations
      queryClient.refetchQueries({
        queryKey: ["/api/user/ai-shopper/recommendations"],
        exact: true
      });

      // Also refresh cart if needed
      if (status === 'added_to_cart') {
        queryClient.refetchQueries({
          queryKey: ['/api/user/cart'],
          exact: true
        });
      }

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
    updateSettingsMutation.mutate(data);
  };

  const toggleEnabled = () => {
    const newValue = !form.getValues("enabled");
    form.setValue("enabled", newValue);

    // Always submit the form when toggling enabled status
    onSubmit(form.getValues());
  };

  // Add to cart
  const addToCart = (recommendation: Recommendation) => {
    if (recommendation.status === "added_to_cart") {
      toast({
        title: "Already in Cart",
        description: "This item is already in your shopping cart.",
      });
      return;
    }

    // Update recommendation status
    updateRecommendationMutation.mutate({
      id: recommendation.id,
      status: "added_to_cart"
    });

    // Add a message to chat
    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `I've added "${recommendation.product?.title}" to your cart.`,
      timestamp: new Date()
    }]);
  };

  // Reject recommendation
  const rejectRecommendation = (recommendation: Recommendation) => {
    // Update recommendation status
    updateRecommendationMutation.mutate({
      id: recommendation.id,
      status: "rejected",
      reason: "User rejected the recommendation"
    });

    // Add a message to chat
    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `I've removed "${recommendation.product?.title}" from your recommendations. I'll learn from this for future suggestions.`,
      timestamp: new Date()
    }]);
  };

  // Swap recommendation for an alternative
  const swapRecommendation = (recommendation: Recommendation) => {
    // Create a message ID to update later
    const messageId = `assistant-${Date.now()}`;

    // Create a loading message first
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: `I'll find you an alternative for "${recommendation.product?.title}". Let me search...`,
      timestamp: new Date(),
      loading: true
    }]);

    // Extract product type/category from the current product
    const productTitle = recommendation.product?.title || "";

    // Create a more specific search query for an alternative product
    // Adding precision to help direct search based on product type
    let searchQuery = "";
    let productType = "";

    // Detect product type from title and create a targeted query
    if (productTitle.toLowerCase().includes("red") &&
        (productTitle.toLowerCase().includes("shoe") || productTitle.toLowerCase().includes("sneaker"))) {
      searchQuery = "red shoes alternative";
      productType = "shoes";
    } else if (productTitle.toLowerCase().includes("headphone") ||
               productTitle.toLowerCase().includes("earbuds") ||
               productTitle.toLowerCase().includes("earphone")) {
      searchQuery = "wireless headphones alternative";
      productType = "headphones";
    } else if (productTitle.toLowerCase().includes("chair")) {
      searchQuery = "office chair alternative";
      productType = "furniture";
    } else if (productTitle.toLowerCase().includes("table") ||
               productTitle.toLowerCase().includes("desk")) {
      searchQuery = "desk furniture alternative";
      productType = "furniture";
    } else if (productTitle.toLowerCase().includes("sofa") ||
               productTitle.toLowerCase().includes("couch")) {
      searchQuery = "sofa furniture alternative";
      productType = "furniture";
    } else if (productTitle.toLowerCase().includes("laptop") ||
               productTitle.toLowerCase().includes("computer")) {
      searchQuery = "laptop alternative";
      productType = "electronics";
    } else if (productTitle.toLowerCase().includes("watch")) {
      searchQuery = "watch alternative";
      productType = "accessory";
    } else {
      // Default fallback
      searchQuery = `alternative for ${productTitle}`;
      productType = "product";
    }

    console.log(`Finding alternative for: "${searchQuery}" (product type: ${productType})`);

    // First, try to update the recommendation status to rejected
    // But continue with finding an alternative regardless of success
    updateRecommendationMutation.mutate({
      id: recommendation.id,
      status: "rejected",
      reason: "User requested an alternative"
    }, {
      onError: (err) => {
        console.error("Error updating recommendation status:", err);
        // We can safely ignore this error and continue with finding an alternative
      },
      onSettled: () => {
        // Always proceed with finding an alternative, regardless of rejection success

        // Generate new recommendations
        generateRecommendationsMutation.mutate({
          searchQuery: searchQuery,
          clearExisting: false
        }, {
          onSuccess: (data) => {
            // Check if we got a successful recommendation with data
            if (data && data.recommendations && data.recommendations.length > 0) {
              console.log("Found alternative product successfully:", data.recommendations[0].product?.title);

              // If successful, update the chat message to reflect success
              setMessages(prev => prev.map(msg =>
                msg.id === messageId ? {
                  ...msg,
                  loading: false,
                  content: `I've found an alternative to "${recommendation.product?.title}" for you. Check out this option!`,
                  recommendations: data.recommendations
                } : msg
              ));

            } else {
              // Response with success flag but no recommendations
              console.log("No alternatives found in response:", data);

              // Check for status/message in the response
              const responseMessage = data?.message || `I couldn't find an alternative ${productType}. Would you like to try a different search?`;

              // No alternative found, update the message
              setMessages(prev => prev.map(msg =>
                msg.id === messageId ? {
                  ...msg,
                  loading: false,
                  content: responseMessage
                } : msg
              ));

              toast({
                title: `No alternative ${productType} found`,
                description: "I couldn't find a suitable alternative. Try a different search query.",
                variant: "destructive"
              });
            }
          },
          onError: (err) => {
            console.error("Error finding alternative:", err);

            // Update the message to show the error
            setMessages(prev => prev.map(msg =>
              msg.id === messageId ? {
                ...msg,
                loading: false,
                content: `I couldn't find an alternative ${productType} due to an error. Would you like to try a different search?`
              } : msg
            ));

            toast({
              title: "Error finding alternative",
              description: "There was a problem searching for alternatives. Please try again.",
              variant: "destructive"
            });
          }
        });
      }
    });
  };

  // Handle search via text input
  const handleSearch = () => {
    if (searchQuery.trim().length === 0) {
      toast({
        title: "Please enter search terms",
        description: "Enter a search query to get recommendations.",
        variant: "default",
      });
      return;
    }

    // Send search to the AI
    handleSendMessage();

    // Provide search to the recommendations API
    generateRecommendationsMutation.mutate({
      searchQuery: searchQuery,
      clearExisting: false // Keep existing recommendations
    });
  };

  // Filter recommendations based on search and status
  const filteredRecommendations = recommendations.filter(recommendation => {
    // First filter by status
    if (!showRejectedItems && recommendation.status === "rejected") {
      return false;
    }

    // Then filter by search query if one exists
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const title = recommendation.product?.title?.toLowerCase() || "";
      const reason = recommendation.reason?.toLowerCase() || "";
      const seller = recommendation.product?.sellerName?.toLowerCase() || "";

      return title.includes(query) || reason.includes(query) || seller.includes(query);
    }

    return true;
  });

  // Check if a recommendation's product is actually in the cart
  const isProductInCart = (productId: number) => {
    return cartItems.some(item => item.productId === productId);
  };

  // Filter recommendations by status
  const pendingRecommendations = filteredRecommendations.filter(rec => rec.status === "pending");
  const purchasedRecommendations = filteredRecommendations.filter(rec => rec.status === "purchased");

  // Filter for items that both have "added_to_cart" status AND are actually in the cart
  const addedToCartRecommendations = filteredRecommendations.filter(rec =>
    rec.status === "added_to_cart" &&
    isProductInCart(rec.productId)
  );

  // We might need to show some recommendations with "added_to_cart" status that are no longer in cart
  // They should be moved back to pending status
  const cartRemovedRecommendations = filteredRecommendations.filter(rec =>
    rec.status === "added_to_cart" &&
    !isProductInCart(rec.productId)
  );

  // Add these to pending recommendations for display
  const allPendingRecommendations = [...pendingRecommendations, ...cartRemovedRecommendations];

  const rejectedRecommendations = showRejectedItems ? filteredRecommendations.filter(rec => rec.status === "rejected") : [];

  // Loading states
  const isLoading = isLoadingSettings || isLoadingRecommendations || isLoadingCart;

  // Handle message keydown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container max-w-screen-xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Automated Shopping</h1>
            <p className="text-muted-foreground mt-1">Let AI shop for you using your Daswos coins</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <DasWosCoinDisplay
              coinBalance={coinsData?.balance || 0}
              size="md"
              className="mr-3"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>AI Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowClearCartDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Clear AI Cart Items</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-8">
            <Card className="flex flex-col h-[calc(100vh-200px)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-primary" />
                  Automated Shopping Assistant
                </CardTitle>
                <CardDescription>
                  Ask the AI to find products and make purchases with your Daswos coins
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow overflow-y-auto pb-0">
                <div className="flex flex-col space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      } items-start gap-3`}
                    >
                      {message.role === "assistant" && (
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="h-2.5 w-2.5 animate-pulse bg-current rounded-full"></div>
                            <div className="h-2.5 w-2.5 animate-pulse bg-current rounded-full animation-delay-200"></div>
                            <div className="h-2.5 w-2.5 animate-pulse bg-current rounded-full animation-delay-500"></div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {/* Display recommendations if any */}
                            {message.recommendations && message.recommendations.length > 0 && (
                              <div className="mt-4 pt-3 border-t">
                                <p className="font-medium mb-2">Recommended products:</p>
                                <div className="mb-4">
                                  <CarouselSearchResults
                                    products={message.recommendations.map(rec => rec.product)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={processingMessage}
                  />
                  <Button
                    type="submit"
                    disabled={!currentMessage.trim() || processingMessage}
                  >
                    {processingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="ml-2">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar: AI Status & Settings */}
          <div className="lg:col-span-4 space-y-4">
            {/* AI Status Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Automated Shopping Status</CardTitle>
                  <Switch
                    checked={form.watch("enabled")}
                    onCheckedChange={toggleEnabled}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                <CardDescription>
                  {form.watch("enabled")
                    ? "Automated Shopping is active and ready to help"
                    : "Enable Automated Shopping to use Daswos coins for purchases"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-md p-3 border">
                    <p className="text-xs text-muted-foreground">Auto Shopping</p>
                    <div className="mt-1 flex items-center">
                      {form.watch("settings.autoPurchase") ? (
                        <Badge variant="default" className="gap-1">
                          <PlayCircle className="h-3 w-3" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <PauseCircle className="h-3 w-3" />
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-background rounded-md p-3 border">
                    <p className="text-xs text-muted-foreground">DasWos Coins</p>
                    <p className="text-lg font-medium mt-1 flex items-center">
                      <DasWosCoinIcon className="h-4 w-4 mr-1.5 text-primary" />
                      {coinsData.balance}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setIsSettingsDialogOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Automated Shopping
                </Button>
              </CardFooter>
            </Card>

            {/* Automated Shopping Cart */}
            <Card className="bg-primary/5 border-primary/20 mb-3">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                    Shopping Cart
                  </CardTitle>
                  {daswosCartItems.length > 0 && (
                    <Badge variant="default" className="bg-primary/90 hover:bg-primary/80">
                      {daswosCartItems.length}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Items the Automated Shopping Assistant will purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {daswosCartItems.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {daswosCartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2 border">
                        <div className="flex items-center space-x-2">
                          {item.product?.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.title} className="h-12 w-12 object-cover rounded" />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground p-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{item.product?.title || "Product"}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.product?.price || 0)} · Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              // Remove item from cart
                              toast({
                                title: "Feature coming soon",
                                description: "Individual item removal will be available soon",
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">Your cart is empty</p>
                    <p className="text-xs text-muted-foreground mt-1">Ask the assistant to find products for you</p>
                  </div>
                )}
              </CardContent>
              {daswosCartItems.length > 0 && (
                <>
                  {/* Countdown timer section */}
                  {aiShopperData?.settings?.autoPurchase && (
                    <div className="px-4 py-2 border-t border-dashed border-primary/20 bg-primary/5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            AutoShop will complete purchase in:
                          </p>
                          <p className="text-sm font-mono font-semibold">
                            {countdownActive ? formatTime(countdownSeconds) : "00:00:30"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!countdownActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/30 bg-primary/10 hover:bg-primary/20"
                              onClick={() => {
                                setCountdownSeconds(30);
                                setCountdownActive(true);
                                toast({
                                  title: "Automated Purchase Started",
                                  description: "Items will be purchased automatically in 30 seconds",
                                });
                              }}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setCountdownActive(false);
                                toast({
                                  title: "Purchase Aborted",
                                  description: "Automated purchase has been cancelled",
                                });
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Abort
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cart footer with totals and action buttons */}
                  <CardFooter className="flex justify-between border-t pt-3">
                    <div>
                      <p className="text-sm font-medium">Total: {formatPrice(daswosCartItems.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0))}</p>
                      <p className="text-xs text-muted-foreground">Using Daswos coins</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowClearCartDialog(true)}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          // If autoPurchase is enabled, start the countdown
                          if (aiShopperData?.settings?.autoPurchase && !countdownActive) {
                            setCountdownSeconds(30);
                            setCountdownActive(true);
                            toast({
                              title: "Automated Purchase Started",
                              description: "Items will be purchased automatically in 30 seconds",
                            });
                          } else {
                            toast({
                              title: "Feature coming soon",
                              description: "Manual checkout functionality will be available soon",
                            });
                          }
                        }}
                      >
                        Checkout
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>

            {/* Recommendations Count Badge */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border">
              <div className="flex items-center space-x-2">
                <ShoppingBasket className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium">Recommendations</h3>
                  <p className="text-xs text-muted-foreground">Ask AI to find products for you</p>
                </div>
              </div>
              {filteredRecommendations.length > 0 && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {filteredRecommendations.length}
                </Badge>
              )}
            </div>

            {/* Show rejected checkbox */}
            {recommendations.length > 0 && (
              <div className="flex items-center space-x-2 px-2">
                <input
                  type="checkbox"
                  id="show-rejected"
                  checked={showRejectedItems}
                  onChange={(e) => setShowRejectedItems(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="show-rejected" className="text-sm">Show rejected items</label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Automated Shopping Settings</DialogTitle>
            <DialogDescription>
              Configure how Automated Shopping works for you
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automated Shopping</FormLabel>
                        <FormDescription>
                          Enable AI-powered shopping with Daswos coins
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.autoPurchase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automated Shopping</FormLabel>
                        <FormDescription>
                          Allow AI to make purchases on your behalf
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.watch("enabled")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.budgetLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Limit (in cents)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={!form.watch("enabled")}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum amount for automated purchases ({formatPrice(field.value)})
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.minimumTrustScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Trust Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={!form.watch("enabled")}
                        />
                      </FormControl>
                      <FormDescription>
                        Only consider products with this trust score or higher
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.preferredCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Categories</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Comma-separated categories"
                          value={field.value.join(", ")}
                          onChange={(e) => {
                            const categories = e.target.value.split(",").map(cat => cat.trim()).filter(Boolean);
                            field.onChange(categories);
                          }}
                          disabled={!form.watch("enabled")}
                        />
                      </FormControl>
                      <FormDescription>
                        Categories you're most interested in
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.avoidTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags to Avoid</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Comma-separated tags"
                          value={field.value.join(", ")}
                          onChange={(e) => {
                            const tags = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                            field.onChange(tags);
                          }}
                          disabled={!form.watch("enabled")}
                        />
                      </FormControl>
                      <FormDescription>
                        Tags or keywords you want to avoid
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending || !form.watch("enabled")}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Automated Shopping Cart Items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items that were added to your cart by the Automated Shopping Assistant.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearCartMutation.mutate()}
              disabled={clearCartMutation.isPending}
            >
              {clearCartMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Clear Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DaswosAiPage;