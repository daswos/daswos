import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Send, MessageCircle, Bot, User, ShoppingCart, Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { formatPrice } from "@/lib/formatters";
import TrustScore from "@/components/products/trust-score";

// Define schemas and types
const chatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  recommendations?: any[];
};

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  trustScore: number;
  sellerName: string;
  sellerVerified: boolean;
  tags: string[];
};

// Product Card Component for displaying search results
function ProductCard({ product, addToCart }: { product: Product, addToCart: (product: Product) => void }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{product.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center text-sm mt-1">
                {product.sellerVerified && (
                  <Badge variant="outline" className="text-xs mr-2 bg-primary/10">
                    <span className="flex items-center">
                      Verified
                    </span>
                  </Badge>
                )}
                Seller: {product.sellerName}
              </div>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{formatPrice(product.price)}</div>
            <TrustScore score={product.trustScore} showText={true} size="sm" className="mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex gap-4">
          {product.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags?.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags?.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button
          onClick={() => addToCart(product)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

// Main Component for LangChain Natural Language Search
export default function LangchainSearchPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Chat-related state
  const [messages, setMessages] = useState<Message[]>([
    // Add welcome message
    {
      id: 'welcome-message',
      role: 'assistant',
      content: `Welcome to the Natural Language Product Search! I can help you find products using everyday language.

Try asking for something like:
- "Show me comfortable running shoes for women under $100"
- "I need a laptop with good battery life for college"
- "Find me a waterproof jacket for hiking"

How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [processingMessage, setProcessingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle key press events (e.g., Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      return apiRequest("POST", "/api/user/cart", {
        productId: product.id,
        quantity: 1,
        source: "langchain_search"
      });
    },
    onSuccess: (_, product) => {
      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart`,
      });
      
      // Refresh cart data
      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add to cart:", error);
    }
  });

  // LangChain chat mutation with natural language search
  const langchainChatMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      return apiRequest<{ response: string; recommendations?: any[] }>(
        "POST", 
        "/api/user/langchain-chat", 
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

  // Handle sending a chat message
  const handleSendMessage = () => {
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
    
    // Send message to server for LangChain processing
    langchainChatMutation.mutate({ message: messageText });
  };

  // Render chat message bubbles
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* User avatar */}
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? 'ml-2 bg-primary' : 'mr-2 bg-muted'}`}>
            {isUser ? (
              <User className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Bot className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          {/* Message bubble */}
          <div className={`rounded-lg p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
            {message.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Thinking...</span>
              </div>
            ) : (
              <div>
                {/* Message content */}
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Product recommendations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <Separator />
                    <h4 className="font-medium text-sm">Product Recommendations:</h4>
                    <div className="space-y-3">
                      {message.recommendations.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          addToCart={addToCartMutation.mutate}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Search className="mr-2 h-6 w-6 text-primary" />
          Natural Language Product Search
        </h1>
        <p className="text-muted-foreground mt-1">
          Find products by describing what you're looking for in everyday language
        </p>
      </div>
      
      <Card className="flex flex-col h-[calc(100vh-200px)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            Chat with AI Product Assistant
          </CardTitle>
          <CardDescription>
            Describe what you're looking for and our AI will find matching products
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="pt-3">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex w-full gap-2">
            <Input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you're looking for..."
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
  );
}