import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Loader2, MessageSquare, Send, Info, User, Bot,
  HelpCircle, ShoppingBag, Package, CreditCard
} from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Define the schema for chat messages
const chatMessageSchema = z.object({
  message: z.string().min(1, "Please enter a message")
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

// Define the message interface
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

// Define suggested topics
const suggestedTopics = [
  {
    title: "App Features",
    icon: <HelpCircle className="h-4 w-4" />,
    questions: [
      "What can I do on DasWos?",
      "How do I search for products?",
      "What is SafeSphere?",
    ]
  },
  {
    title: "Orders & Shipping",
    icon: <ShoppingBag className="h-4 w-4" />,
    questions: [
      "Where can I see my orders?",
      "How do I track my package?",
      "What's the return policy?",
    ]
  },
  {
    title: "Products",
    icon: <Package className="h-4 w-4" />,
    questions: [
      "How do I list an item for sale?",
      "Can I edit my product listing?",
      "How do I remove a product?",
    ]
  },
  {
    title: "Payments",
    icon: <CreditCard className="h-4 w-4" />,
    questions: [
      "What payment methods are accepted?",
      "How do DasWos coins work?",
      "Is my payment information secure?",
    ]
  }
];

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi there! How can I help you today?`,
      timestamp: new Date()
    }
  ]);

  const [processingMessage, setProcessingMessage] = useState(false);

  // Form setup for chat input
  const form = useForm<ChatMessageFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: ""
    }
  });

  const { register, handleSubmit, formState, reset } = form;

  // Scroll to bottom of messages only when new messages are added (not on initial load)
  useEffect(() => {
    // Only scroll if there's more than the initial welcome message
    if (messagesEndRef.current && messages.length > 1) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Generate AI response based on user message
  const generateResponseMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      // This would normally call your API endpoint
      // For now, we'll simulate a response
      return new Promise<{ response: string }>((resolve) => {
        setTimeout(() => {
          // Generate a response based on the message
          let response = "";

          if (data.message.toLowerCase().includes("order")) {
            response = "You can view your orders by clicking on your profile and selecting 'My Orders'. From there, you can track shipments, view order details, and manage returns.";
          } else if (data.message.toLowerCase().includes("payment")) {
            response = "DasWos accepts credit cards, PayPal, and DasWos coins for purchases. Your payment information is securely stored and processed according to industry standards.";
          } else if (data.message.toLowerCase().includes("list") || data.message.toLowerCase().includes("sell")) {
            response = "To list an item for sale, go to your profile menu and select 'List an Item'. You'll need to provide details about your product, set a price, and upload photos.";
          } else if (data.message.toLowerCase().includes("safesphere")) {
            response = "SafeSphere is our trusted marketplace environment where all sellers are verified and products meet our quality standards. It provides an extra layer of security for your purchases.";
          } else {
            response = "I'm here to help with any questions about the DasWos platform. How else can I assist you today?";
          }

          resolve({ response });
        }, 1500); // Simulate API delay
      });
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
              content: data.response
            } :
            msg
        )
      );
    },
    onError: (error) => {
      setProcessingMessage(false);

      // Add error message
      setMessages(prev => [...prev.filter(msg => !msg.loading), {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }]);

      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: ChatMessageFormValues) => {
    if (processingMessage) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: data.message,
      timestamp: new Date()
    };

    // Add loading message from assistant
    const loadingMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "",
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setProcessingMessage(true);

    // Reset form
    reset();

    // Generate response
    generateResponseMutation.mutate({ message: data.message });
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    if (processingMessage) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    // Add loading message from assistant
    const loadingMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "",
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setProcessingMessage(true);

    // Generate response
    generateResponseMutation.mutate({ message: question });
  };

  return (
    <div className="container py-2 page-ai-assistant flex flex-col items-center justify-center">
      {/* Title removed for cleaner interface */}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-6xl mx-auto my-auto">
        {/* Chat Section */}
        <div className="md:col-span-8 md:col-start-1">
          <Card className="h-[450px] flex flex-col">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow overflow-y-auto pb-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex max-w-[80%] ${
                        message.role === 'user'
                          ? 'flex-row-reverse'
                          : 'flex-row'
                      }`}
                    >
                      <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                        <AvatarFallback className={message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.loading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="pt-3 mt-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    className="flex-grow resize-none"
                    {...register("message")}
                    disabled={processingMessage}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={processingMessage || !formState.isValid}
                  >
                    {processingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* Suggested Topics */}
        <div className="md:col-span-4 md:col-start-9">
          <Card className="h-[450px] overflow-y-auto">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-lg text-center">Suggested Topics</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {suggestedTopics.map((topic, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-center mb-2">
                      <Badge variant="outline" className="mr-2 bg-gray-100">
                        {topic.icon}
                      </Badge>
                      <h3 className="font-medium">{topic.title}</h3>
                    </div>

                    <ul className="space-y-1">
                      {topic.questions.map((question, qIndex) => (
                        <li key={qIndex}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left text-sm h-auto py-1"
                            onClick={() => handleSuggestedQuestion(question)}
                            disabled={processingMessage}
                          >
                            {question}
                          </Button>
                        </li>
                      ))}
                    </ul>

                    {index < suggestedTopics.length - 1 && (
                      <Separator className="my-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
