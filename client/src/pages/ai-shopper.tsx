import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, ShoppingBasket, Check, X, ShoppingCart,
  Info, ArrowRight, RefreshCw, Trash2, Send, Settings, 
  ShoppingBag, Bot, User
} from "lucide-react";
import { z } from "zod";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// Define chat message schema
const chatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" })
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  recommendations?: Recommendation[];
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

function DaswosAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [processingMessage, setProcessingMessage] = useState(false);
  
  // Query to get DasWos Coins balance
  const { 
    data: coinsData = { balance: 0 }
  } = useQuery({
    queryKey: ["/api/user/daswos-coins/balance"],
    queryFn: async () => {
      return apiRequest<{ balance: number }>("/api/user/daswos-coins/balance", { method: 'GET' });
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  // Form setup for chat input
  const form = useForm<ChatMessageFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: ""
    }
  });
  
  const { register, handleSubmit, formState, reset } = form;
  
  // Fetch AI Shopper status and settings
  const { 
    data: aiShopperData,
    isLoading: isLoadingSettings 
  } = useQuery({
    queryKey: ["/api/user/ai-shopper"],
    queryFn: async () => {
      return apiRequest<{
        enabled: boolean;
        freeAccess?: boolean;
        settings: {
          autoPurchase: boolean;
          budgetLimit: number;
          preferredCategories: string[];
          avoidTags: string[];
          minimumTrustScore: number;
        }
      }>("/api/user/ai-shopper", { method: 'GET' });
    },
    enabled: !!user,
    staleTime: 300000,
    refetchOnWindowFocus: false
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
    staleTime: 300000,
    refetchOnWindowFocus: false
  });
  
  // Generate AI response based on user message
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
      
      // Update the loading message to show error
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.loading ? 
            {
              ...msg,
              loading: false,
              content: "I'm sorry, I encountered an error processing your request. Please try again."
            } : 
            msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate response:", error);
    }
  });

  // Generate AI recommendations based on a query or shopping list
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data: {
      searchQuery?: string;
      bulkBuy?: boolean;
      shoppingList?: string;
      clearExisting?: boolean;
    }) => {
      // If clearExisting is true, first clear all existing recommendations
      if (data.clearExisting) {
        try {
          await apiRequest("/api/user/ai-shopper/recommendations/clear", { method: "POST" });
        } catch (error) {
          console.error("Failed to clear existing recommendations:", error);
        }
      }
      
      return apiRequest("POST", "/api/user/ai-shopper/generate", {
        searchQuery: data.searchQuery || "",
        bulkBuy: data.bulkBuy || false,
        shoppingList: data.shoppingList || ""
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Generated new recommendations",
      });
      
      refetchRecommendations();
      
      // Add a message from the assistant about the recommendations
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've generated some product recommendations based on your request. You can view them below or regenerate specific items if needed.",
        timestamp: new Date(),
        recommendations: recommendations
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
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
  
  // Update recommendation status (add to cart, purchase, reject)
  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      return apiRequest("PUT", `/api/user/ai-shopper/recommendations/${id}`, { status, reason });
    },
    onSuccess: () => {
      refetchRecommendations();
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
  
  // Update AI Shopper settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AiShopperSettings) => {
      return apiRequest("PUT", "/api/user/ai-shopper", data);
    },
    onSuccess: (data) => {
      // Create a message based on whether auto-purchase was updated
      let autoPurchaseToggled = false;
      let autoPurchaseEnabled = false;
      
      // Check if this was an auto-purchase toggle based on latest data
      if (data && data.settings && aiShopperData) {
        autoPurchaseToggled = data.settings.autoPurchase !== aiShopperData.settings.autoPurchase;
        autoPurchaseEnabled = data.settings.autoPurchase;
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
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/user/ai-shopper"],
      });
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
    }
  });
  
  // Function to toggle automated purchase
  const toggleAutoPurchase = () => {
    if (aiShopperData) {
      const newValue = !aiShopperData.settings.autoPurchase;
      
      updateSettingsMutation.mutate({
        enabled: aiShopperData.enabled,
        settings: {
          ...aiShopperData.settings,
          autoPurchase: newValue
        }
      });
    }
  };
  
  // Handle form submission for chat
  const onSubmit = (data: ChatMessageFormValues) => {
    if (processingMessage) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.message,
      timestamp: new Date()
    };
    
    // Add placeholder for assistant's response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage, assistantMessage]);
    setProcessingMessage(true);
    
    // Generate response
    generateResponseMutation.mutate({ message: data.message });
    
    // Reset form
    reset();
  };
  
  // Auto-scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Set initial welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm Daswos AI, your personal shopping assistant. I can help you find products, create shopping lists, make recommendations, and even shop for you automatically. How can I assist you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);
  
  // Helper to format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to add product to cart
  const addToCart = (id: number) => {
    updateRecommendationMutation.mutate({ id, status: "added_to_cart" });
  };
  
  // Function to buy product
  const buyNow = (id: number) => {
    updateRecommendationMutation.mutate({ id, status: "purchased" });
    toast({
      title: "Purchase Initiated",
      description: "Your order has been placed successfully!",
    });
  };
  
  // Function to reject product
  const rejectItem = (id: number, reason: string = "Not interested") => {
    updateRecommendationMutation.mutate({ id, status: "rejected", reason });
  };
  
  // Function to regenerate all recommendations
  const regenerateAll = () => {
    // Find the latest user message about a shopping list or query
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      generateRecommendationsMutation.mutate({
        searchQuery: lastUserMessage.content,
        clearExisting: true
      });
    } else {
      toast({
        title: "Error",
        description: "No search query found. Please ask for recommendations first.",
        variant: "destructive",
      });
    }
  };
  
  // Regenerate one specific recommendation
  const regenerateItem = (id: number) => {
    // Get current recommendation details
    const recommendation = recommendations.find(rec => rec.id === id);
    if (!recommendation) return;
    
    // First reject the current recommendation
    updateRecommendationMutation.mutate(
      { id, status: "rejected", reason: "Requested alternative" },
      {
        onSuccess: () => {
          // Then generate a replacement
          generateRecommendationsMutation.mutate({
            searchQuery: `Find an alternative to: ${recommendation.product?.title}. Similar price range but different style or brand.`,
            clearExisting: false
          });
        }
      }
    );
  };
  
  // Render the recommendations section
  const renderRecommendations = (recommendationsList?: Recommendation[]) => {
    const itemsToShow = recommendationsList || recommendations;
    
    if (!itemsToShow || itemsToShow.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-2 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Recommendations</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={regenerateAll}
            disabled={generateRecommendationsMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itemsToShow.filter(rec => rec.status === 'pending').map((recommendation) => (
            <Card key={recommendation.id} className="overflow-hidden border">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {recommendation.product?.title}
                  </CardTitle>
                  <div className="flex space-x-1">
                    {recommendation.confidence >= 0.8 && (
                      <Badge variant="default" className="flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Best Match
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex">
                  {recommendation.product?.imageUrl && (
                    <div className="relative w-24 h-24 mr-3 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={recommendation.product.imageUrl} 
                        alt={recommendation.product.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1 line-clamp-3">
                      {recommendation.reason}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="font-medium">
                        {formatPrice(recommendation.product?.price || 0)}
                      </div>
                      <TrustScore score={recommendation.product?.trustScore || 0} size="sm" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => regenerateItem(recommendation.id)}
                    >
                      Find similar alternative
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => rejectItem(recommendation.id, "Looking for something cheaper")}
                    >
                      Find cheaper alternative
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => rejectItem(recommendation.id, "Looking for better quality")}
                    >
                      Find higher quality alternative
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addToCart(recommendation.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => buyNow(recommendation.id)}
                  >
                    Buy Now
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="container py-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Daswos AI</h1>
          <p className="text-muted-foreground">Your personal AI shopping assistant</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-md mr-4">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="h-6 w-6 mr-2" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <text 
                x="12" 
                y="16" 
                textAnchor="middle" 
                fontSize="11" 
                fontWeight="bold" 
                fill="currentColor"
              >
                Đ
              </text>
            </svg>
            <span className="font-medium">{coinsData.balance}</span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Daswos AI Settings</SheetTitle>
                <SheetDescription>
                  Configure how Daswos AI works for you
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-purchase" className="text-base">Automated Shopping</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow Daswos AI to make purchases on your behalf
                    </p>
                  </div>
                  <Switch
                    id="auto-purchase"
                    checked={aiShopperData?.settings.autoPurchase || false}
                    onCheckedChange={toggleAutoPurchase}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="budget-limit" className="text-base mb-2 block">Budget Limit</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="budget-limit"
                      type="number"
                      placeholder="5000"
                      value={aiShopperData ? (aiShopperData.settings.budgetLimit / 100) : 50}
                      onChange={(e) => {
                        if (aiShopperData) {
                          const newValue = Math.max(1, Math.min(1000, parseInt(e.target.value) || 0));
                          updateSettingsMutation.mutate({
                            enabled: aiShopperData.enabled,
                            settings: {
                              ...aiShopperData.settings,
                              budgetLimit: newValue * 100
                            }
                          });
                        }
                      }}
                      className="max-w-[150px]"
                    />
                    <span className="text-muted-foreground">currency units maximum</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="trust-score" className="text-base mb-2 block">Minimum Trust Score</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="trust-score"
                      type="number"
                      placeholder="85"
                      value={aiShopperData?.settings.minimumTrustScore || 85}
                      onChange={(e) => {
                        if (aiShopperData) {
                          const newValue = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                          updateSettingsMutation.mutate({
                            enabled: aiShopperData.enabled,
                            settings: {
                              ...aiShopperData.settings,
                              minimumTrustScore: newValue
                            }
                          });
                        }
                      }}
                      className="max-w-[100px]"
                    />
                    <span className="text-muted-foreground">minimum percentage</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Chat interface */}
      <Card className="border">
        <CardContent className="p-0">
          {/* Chat messages */}
          <div className="h-[calc(100vh-300px)] min-h-[400px] max-h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-3">
                    {message.role === 'user' ? (
                      <Avatar>
                        <AvatarFallback>{user?.username.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar>
                        <AvatarImage src="/images/daswos-ai-logo.png" alt="Daswos AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end mr-3' : 'items-start ml-3'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 mb-1 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.loading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </div>
                    
                    {/* Display recommendations if any */}
                    {message.role === 'assistant' && message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-2 w-full">
                        {renderRecommendations(message.recommendations)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
              <Input
                {...register("message")}
                placeholder="Ask Daswos AI a question or request products..."
                disabled={processingMessage}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={processingMessage || !form.formState.isValid}
              >
                {processingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="mt-2 text-xs text-muted-foreground">
              Try asking: "Find me a comfortable office chair" or "How can you help me with shopping?"
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Show any active recommendations if available */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Shopping Recommendations</h2>
          {renderRecommendations()}
        </div>
      )}
    </div>
  );
}

export default DaswosAI;