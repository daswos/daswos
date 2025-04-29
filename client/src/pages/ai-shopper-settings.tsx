import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Icons
import {
  Settings2,
  Loader2,
  X,
  ShoppingBasket,
  CreditCard,
  CheckCircle,
  Coins,
  ArrowRight,
} from "lucide-react";

// Custom Components
import { TrustScore } from "@/components/trust-score";
import { Tag } from "@/components/tag";

// Define schema for AI Shopper settings
const aiShopperSettingsSchema = z.object({
  enabled: z.boolean(),
  settings: z.object({
    autoPurchase: z.boolean(),
    budgetLimit: z.number().min(100).max(100000),
    maxCoinsPerItem: z.number().min(1).max(1000),
    maxCoinsPerDay: z.number().min(1).max(2000),
    maxCoinsOverall: z.number().min(1).max(10000),
    purchaseFrequency: z.object({
      hourly: z.number().min(0).max(10),
      daily: z.number().min(0).max(20),
      monthly: z.number().min(0).max(100),
    }),
    purchaseMode: z.enum(["random", "refined"]),
    preferredCategories: z.array(z.string()),
    avoidTags: z.array(z.string()),
    minimumTrustScore: z.number().min(0).max(100),
  }),
});

type AiShopperSettings = z.infer<typeof aiShopperSettingsSchema>;

// Define package options for DasWos Coins
const coinPackages = [
  { id: 1, name: "Starter", coins: 100, price: 499, popular: false },
  { id: 2, name: "Standard", coins: 500, price: 1999, popular: true },
  { id: 3, name: "Premium", coins: 1000, price: 3499, popular: false },
  { id: 4, name: "Ultimate", coins: 2500, price: 7999, popular: false },
];

function AiShopperSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("settings");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [newAvoidTag, setNewAvoidTag] = useState<string>("");
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  // Available tags for product categories
  const availableTags = [
    "Electronics",
    "Home",
    "Fashion",
    "Beauty",
    "Sports",
    "Books",
    "Toys",
    "Furniture",
    "Grocery",
    "Automotive",
  ];

  // Fetch user's current DasWos Coins balance
  const { data: coinsData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["/api/user/daswos-coins/balance"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/daswos-coins/balance");
      return { balance: res.balance || 0 };
    },
  });
  
  // Extract balance value from data for easier access
  const coinsBalance = coinsData?.balance || 0;

  // Fetch user's AI Shopper settings
  const { data: aiShopperData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/user/ai-shopper"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/ai-shopper");
      return res;
    },
  });

  // Fetch transaction history
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/user/daswos-coins/transactions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/daswos-coins/transactions");
      return res.transactions || [];
    },
  });

  // Mutation for purchasing coins
  const purchaseCoinsMutation = useMutation({
    mutationFn: async (packageId: number) => {
      const selectedPkg = coinPackages.find(pkg => pkg.id === packageId);
      if (!selectedPkg) throw new Error("Invalid package selected");
      
      // Format the purchase data properly
      return apiRequest("POST", "/api/user/daswos-coins/purchase", {
        packageId: packageId,
        amount: selectedPkg.coins,
        priceInCents: selectedPkg.price,
        // Include metadata for better transaction tracking
        metadata: {
          packageName: selectedPkg.name,
          purchaseTimestamp: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: "Your DasWos Coins have been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/daswos-coins/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/daswos-coins/transactions"] });
      setIsPurchaseDialogOpen(false);
      setSelectedPackage(null);
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to purchase coins:", error);
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
        maxCoinsPerDay: 100,
        maxCoinsOverall: 1000,
        maxCoinsPerItem: 50,
        purchaseFrequency: {
          hourly: 1,
          daily: 5,
          monthly: 50
        },
        purchaseMode: "refined",
        preferredCategories: [],
        avoidTags: [],
        minimumTrustScore: 85
      }
    }
  });

  // Update form values when we get data from the server
  useEffect(() => {
    if (aiShopperData) {
      form.reset({
        enabled: aiShopperData.enabled,
        settings: {
          ...aiShopperData.settings,
          // Ensure all required properties exist
          autoPurchase: aiShopperData.settings.autoPurchase ?? false,
          budgetLimit: aiShopperData.settings.budgetLimit ?? 5000,
          maxCoinsPerDay: aiShopperData.settings.maxCoinsPerDay ?? 100,
          maxCoinsOverall: aiShopperData.settings.maxCoinsOverall ?? 1000,
          maxCoinsPerItem: aiShopperData.settings.maxCoinsPerItem ?? 50,
          purchaseFrequency: {
            hourly: aiShopperData.settings.purchaseFrequency?.hourly ?? 1,
            daily: aiShopperData.settings.purchaseFrequency?.daily ?? 5,
            monthly: aiShopperData.settings.purchaseFrequency?.monthly ?? 50
          },
          purchaseMode: aiShopperData.settings.purchaseMode ?? "refined",
          preferredCategories: aiShopperData.settings.preferredCategories ?? [],
          avoidTags: aiShopperData.settings.avoidTags ?? [],
          minimumTrustScore: aiShopperData.settings.minimumTrustScore ?? 85
        }
      });
      
      // Set selected tags from settings
      setSelectedTags(aiShopperData.settings.preferredCategories || []);
      setAvoidTags(aiShopperData.settings.avoidTags || []);
    }
  }, [aiShopperData, form]);

  // Update AI Shopper settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AiShopperSettings) => {
      return apiRequest("PUT", "/api/user/ai-shopper", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your AI Shopper settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/ai-shopper"] });
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

  const onSubmit = (data: AiShopperSettings) => {
    // Include selected tags in the form data
    const formData = {
      ...data,
      settings: {
        ...data.settings,
        preferredCategories: selectedTags,
        avoidTags: avoidTags
      }
    };
    updateSettingsMutation.mutate(formData);
  };

  const toggleEnabled = () => {
    const newValue = !form.getValues("enabled");
    form.setValue("enabled", newValue);
    
    // Always submit the form when toggling enabled status
    onSubmit(form.getValues());
  };

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag("");
    }
  };

  const addAvoidTag = () => {
    if (newAvoidTag && !avoidTags.includes(newAvoidTag)) {
      setAvoidTags([...avoidTags, newAvoidTag]);
      setNewAvoidTag("");
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleAvoidTag = (tag: string) => {
    if (avoidTags.includes(tag)) {
      setAvoidTags(avoidTags.filter(t => t !== tag));
    } else {
      setAvoidTags([...avoidTags, tag]);
    }
  };

  const handlePurchase = () => {
    if (selectedPackage) {
      purchaseCoinsMutation.mutate(selectedPackage);
    } else {
      toast({
        title: "No Package Selected",
        description: "Please select a coin package to purchase.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingSettings || isLoadingBalance) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading AI Shopper settings...</span>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daswos AI</h1>
        </div>
      </div>

      {/* DasWos Coins Balance Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Your DasWos Coins</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span className="text-lg font-semibold">{coinsBalance !== undefined ? coinsBalance : 0}</span>
            </Badge>
          </div>
          <CardDescription>
            DasWos Coins are used by the AI Shopper for automated purchases
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setSelectedPackage(null);
              setIsPurchaseDialogOpen(true);
            }}
          >
            <Coins className="mr-2 h-4 w-4" />
            Purchase DasWos Coins
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="settings" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="settings">Preferences</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daswos AI Preferences</CardTitle>
                  <CardDescription>
                    Configure how Daswos AI will find and recommend products for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="settings.autoPurchase"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Automatic Purchases
                          </FormLabel>
                          <FormDescription>
                            Allow AI to automatically purchase items it's very confident about
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
                  
                  {form.watch("settings.autoPurchase") && (
                    <>
                      {/* DasWos Coins Purchase Settings - MOVED ABOVE BUDGET LIMIT */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-medium">DasWos Coins Spending Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure how the AI spends your DasWos Coins for automated purchases</p>
                      
                        <FormField
                          control={form.control}
                          name="settings.maxCoinsPerItem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Coins Per Item</FormLabel>
                              <FormDescription>
                                Maximum DasWos Coins to spend on a single item: {field.value}
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={1}
                                  max={1000}
                                  step={1}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="settings.maxCoinsPerDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Coins Limit</FormLabel>
                              <FormDescription>
                                Maximum DasWos Coins to spend per day: {field.value}
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={1}
                                  max={2000}
                                  step={1}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="settings.maxCoinsOverall"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overall Coins Limit</FormLabel>
                              <FormDescription>
                                Maximum DasWos Coins to spend in total: {field.value}
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={1}
                                  max={10000}
                                  step={10}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="settings.budgetLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Limit</FormLabel>
                        <FormDescription>
                          Maximum amount the AI can spend (per item): ${(field.value / 100).toFixed(2)}
                        </FormDescription>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={100}
                            max={100000}
                            step={100}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.minimumTrustScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Trust Score</FormLabel>
                        <FormDescription>
                          Only recommend products with at least this trust score: {field.value}
                        </FormDescription>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[field.value]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="flex-1 py-4"
                            />
                            <TrustScore score={field.value} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("settings.autoPurchase") && (
                    <>
                      {/* Purchase Frequency Settings */}
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-medium">Purchase Frequency</h3>
                        <p className="text-sm text-muted-foreground">Control how often the AI Shopper makes purchases</p>
                      
                        <FormField
                          control={form.control}
                          name="settings.purchaseFrequency.hourly"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Limit</FormLabel>
                              <FormDescription>
                                Maximum purchases per hour: {field.value}
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={0}
                                  max={10}
                                  step={1}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="settings.purchaseFrequency.daily"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Limit</FormLabel>
                              <FormDescription>
                                Maximum purchases per day: {field.value}
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={0}
                                  max={20}
                                  step={1}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="settings.purchaseFrequency.monthly"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Limit</FormLabel>
                              <FormDescription>
                                Maximum purchases per month: {field.value}
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={0}
                                  max={100}
                                  step={5}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Purchase Mode Settings */}
                      <FormField
                        control={form.control}
                        name="settings.purchaseMode"
                        render={({ field }) => (
                          <FormItem className="space-y-4 p-4 border rounded-lg">
                            <FormLabel className="text-lg font-medium">Purchase Mode</FormLabel>
                            <FormDescription>
                              Choose how the AI Shopper selects items to purchase automatically
                            </FormDescription>
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={`text-sm ${field.value === "random" ? "font-semibold" : "text-muted-foreground"}`}>Random</span>
                                <span className={`text-sm ${field.value === "refined" ? "font-semibold" : "text-muted-foreground"}`}>Refined</span>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[field.value === "random" ? 0 : 100]}
                                  min={0}
                                  max={100}
                                  step={100}
                                  onValueChange={(vals) => field.onChange(vals[0] === 0 ? "random" : "refined")}
                                  className="py-4"
                                />
                              </FormControl>
                            </div>
                            <div className="space-y-1">
                              {field.value === "random" ? (
                                <p className="text-sm">
                                  <span className="font-semibold">Random Mode:</span> AI will make completely random purchases from the SafeSphere, 
                                  within your specified trust score and budget limits.
                                </p>
                              ) : (
                                <p className="text-sm">
                                  <span className="font-semibold">Refined Mode:</span> AI will analyze your shopping history and preferences 
                                  to make more targeted purchase decisions.
                                </p>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <div>
                    <FormLabel className="text-base">Preferred Categories</FormLabel>
                    <FormDescription className="mb-2">
                      Select categories you're interested in
                    </FormDescription>
                    
                    <div className="flex flex-wrap mb-2">
                      {availableTags.map((tag) => (
                        <Tag 
                          key={tag} 
                          text={tag} 
                          active={selectedTags.includes(tag)}
                          onClick={() => toggleTag(tag)}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add custom category..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addTag} size="sm">Add</Button>
                    </div>
                    
                    {selectedTags.length > 0 && (
                      <div className="mt-2">
                        <FormDescription>Your selected categories:</FormDescription>
                        <div className="flex flex-wrap mt-1">
                          {selectedTags.map((tag) => (
                            <Tag 
                              key={tag} 
                              text={tag} 
                              active={true} 
                              onClick={() => toggleTag(tag)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <FormLabel className="text-base">Avoid Tags</FormLabel>
                    <FormDescription className="mb-2">
                      Add tags for products you want to avoid
                    </FormDescription>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add tag to avoid..."
                        value={newAvoidTag}
                        onChange={(e) => setNewAvoidTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAvoidTag())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addAvoidTag} size="sm">Add</Button>
                    </div>
                    
                    {avoidTags.length > 0 && (
                      <div className="mt-2">
                        <FormDescription>Tags you want to avoid:</FormDescription>
                        <div className="flex flex-wrap mt-1">
                          {avoidTags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="destructive" 
                              className="mr-2 mb-2 cursor-pointer"
                              onClick={() => toggleAvoidTag(tag)}
                            >
                              {tag} <X className="ml-1 h-3 w-3" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>DasWos Coins Transactions</CardTitle>
              <CardDescription>
                Your history of DasWos Coins purchases and spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading transactions...</span>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h4 className="font-medium">
                          {transaction.type === "purchase" ? "Purchased" : "Spent"} {Math.abs(transaction.amount)} coins
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()} · 
                          {transaction.metadata?.reason && ` ${transaction.metadata.reason}`}
                        </p>
                      </div>
                      <Badge 
                        variant={transaction.type === "purchase" ? "outline" : "secondary"}
                        className={`${transaction.type === "purchase" ? "text-green-500" : "text-amber-500"}`}
                      >
                        {transaction.type === "purchase" ? "+" : "-"}{Math.abs(transaction.amount)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No transactions found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedPackage(null);
                      setIsPurchaseDialogOpen(true);
                    }}
                  >
                    Purchase Your First Coins
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DasWos Coins Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Purchase DasWos Coins</DialogTitle>
            <DialogDescription>
              Select a coin package to power your AI Shopper's automated purchases
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            {coinPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary/50 ${selectedPackage === pkg.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  {pkg.popular && (
                    <Badge variant="secondary" className="bg-primary/10">Popular</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                    <span className="text-2xl font-bold">{pkg.coins}</span>
                  </div>
                  <p className="text-lg font-medium">${(pkg.price / 100).toFixed(2)}</p>
                </div>
                {selectedPackage === pkg.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsPurchaseDialogOpen(false);
                setSelectedPackage(null);
              }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={!selectedPackage || purchaseCoinsMutation.isPending}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {purchaseCoinsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {purchaseCoinsMutation.isPending ? "Processing..." : "Complete Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AiShopperSettingsPage;