import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatDasWosCoins } from '@/lib/utils';
import { DasWosCoinIcon } from './daswos-coin-icon';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  Sparkles,
  DollarSign,
} from 'lucide-react';

// Custom Components
import { TrustScore } from '@/components/trust-score';
import { Tag } from '@/components/tag';

// Define schema for AI Shopper settings
const aiShopperSettingsSchema = z.object({
  enabled: z.boolean(),
  settings: z.object({
    autoPurchase: z.boolean(),
    budgetLimit: z.number().min(100).max(100000),
    maxCoinsPerItem: z.number().min(1).max(1000),
    maxCoinsPerDay: z.number().min(1).max(2000),
    purchaseFrequency: z.object({
      hourly: z.number().min(0).max(10),
      daily: z.number().min(0).max(20),
    }),
    purchaseMode: z.enum(['random', 'refined']),
    preferredCategories: z.array(z.string()),
    avoidTags: z.array(z.string()),
    minimumTrustScore: z.number().min(0).max(100),
  }),
});

type AiShopperSettings = z.infer<typeof aiShopperSettingsSchema>;

interface AiShopperSettingsDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  settings?: {
    autoPurchase: boolean;
    budgetLimit: number;
    preferredCategories: string[];
    avoidTags: string[];
    minimumTrustScore: number;
  };
  onSave?: (settings: {
    autoPurchase: boolean;
    budgetLimit: number;
    preferredCategories: string[];
    avoidTags: string[];
    minimumTrustScore: number;
  }) => void;
}

const AiShopperSettingsDialog: React.FC<AiShopperSettingsDialogProps> = ({
  trigger,
  defaultOpen = false,
  open,
  onOpenChange,
  settings,
  onSave,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('general');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(defaultOpen);

  // Available tags for product categories
  const availableTags = [
    'Electronics',
    'Home',
    'Fashion',
    'Beauty',
    'Sports',
    'Books',
    'Toys',
    'Furniture',
    'Grocery',
    'Automotive',
  ];

  // Fetch user's current DasWos Coins balance
  const { data: coinsData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['/api/user/daswos-coins/balance'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/daswos-coins/balance');
      return { balance: res.balance || 0 };
    },
  });
  
  // Extract balance value from data for easier access
  const coinsBalance = coinsData?.balance || 0;

  // Fetch user's AI Shopper settings
  const { data: aiShopperData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/user/ai-shopper'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/ai-shopper');
      return res;
    },
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
        maxCoinsPerItem: 50,
        purchaseFrequency: {
          hourly: 1,
          daily: 5,
        },
        purchaseMode: 'refined',
        preferredCategories: [],
        avoidTags: [],
        minimumTrustScore: 85
      }
    }
  });

  // Handle dialog state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isDialogOpen);
    }
  }, [isDialogOpen, onOpenChange]);
  
  // Update dialog open state when defaultOpen or open props change
  useEffect(() => {
    // If open prop is provided, it takes precedence
    if (open !== undefined) {
      setIsDialogOpen(open);
    } else {
      setIsDialogOpen(defaultOpen);
    }
  }, [defaultOpen, open]);

  // Update form values when we get data from the server or from props
  useEffect(() => {
    // If settings are provided via props, use those
    if (settings) {
      form.reset({
        enabled: true, // Always enabled when settings are provided via props
        settings: {
          // Use provided settings with defaults for any missing properties
          autoPurchase: settings.autoPurchase,
          budgetLimit: settings.budgetLimit,
          maxCoinsPerDay: 100, // Default
          maxCoinsPerItem: 50, // Default
          purchaseFrequency: {
            hourly: 1, // Default
            daily: 5, // Default
          },
          purchaseMode: 'refined', // Default
          preferredCategories: settings.preferredCategories,
          avoidTags: settings.avoidTags,
          minimumTrustScore: settings.minimumTrustScore
        }
      });
      
      // Set selected tags from props
      setSelectedTags(settings.preferredCategories);
      setAvoidTags(settings.avoidTags);
    }
    // Otherwise, use data from server if available
    else if (aiShopperData) {
      form.reset({
        enabled: aiShopperData.enabled,
        settings: {
          ...aiShopperData.settings,
          // Ensure all required properties exist
          autoPurchase: aiShopperData.settings.autoPurchase ?? false,
          budgetLimit: aiShopperData.settings.budgetLimit ?? 5000,
          maxCoinsPerDay: aiShopperData.settings.maxCoinsPerDay ?? 100,
          maxCoinsPerItem: aiShopperData.settings.maxCoinsPerItem ?? 50,
          purchaseFrequency: {
            hourly: aiShopperData.settings.purchaseFrequency?.hourly ?? 1,
            daily: aiShopperData.settings.purchaseFrequency?.daily ?? 5,
          },
          purchaseMode: aiShopperData.settings.purchaseMode ?? 'refined',
          preferredCategories: aiShopperData.settings.preferredCategories ?? [],
          avoidTags: aiShopperData.settings.avoidTags ?? [],
          minimumTrustScore: aiShopperData.settings.minimumTrustScore ?? 85
        }
      });
      
      // Set selected tags from settings
      setSelectedTags(aiShopperData.settings.preferredCategories || []);
      setAvoidTags(aiShopperData.settings.avoidTags || []);
    }
  }, [aiShopperData, form, settings]);

  // Update AI Shopper settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AiShopperSettings) => {
      return apiRequest('PUT', '/api/user/ai-shopper', data);
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Your Daswos AI settings have been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/ai-shopper'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Failed to update AI Shopper settings:', error);
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
    
    // Call onSave prop if provided, otherwise update via API
    if (onSave) {
      onSave(formData.settings);
      setIsDialogOpen(false);
    } else {
      updateSettingsMutation.mutate(formData);
      setIsDialogOpen(false);
    }
  };

  const toggleEnabled = () => {
    const newValue = !form.getValues('enabled');
    form.setValue('enabled', newValue);
    
    // Always submit the form when toggling enabled status
    onSubmit(form.getValues());
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

  if (isLoadingSettings || isLoadingBalance) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Daswos AI Settings
          </DialogTitle>
          <DialogDescription>
            Configure how Daswos AI shops for you automatically
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* General Tab */}
              <TabsContent value="general" className="space-y-4">
                <div className="rounded-lg border p-4 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-medium flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        About Daswos AI
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Daswos AI helps you discover products you'll love and can automatically shop for you using your DasWos Coins. Configure your preferences to get the most out of the AI shopping experience.
                  </p>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-4">
                <FormField
                  control={form.control}
                  name="settings.autoPurchase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Automatic Purchases
                        </FormLabel>
                        <FormDescription>
                          Allow AI to automatically purchase items using your DasWos Coins
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
                  name="settings.purchaseMode"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base font-medium">Purchase Mode</FormLabel>
                      <FormDescription>
                        Choose how Daswos AI selects products for you
                      </FormDescription>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select a purchase mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="refined">Refined (Higher quality picks)</SelectItem>
                            <SelectItem value="random">Random (More diverse options)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="settings.minimumTrustScore"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base font-medium">Minimum Trust Score</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormDescription className="flex-1">
                          Only consider products with trust score above: {field.value}
                        </FormDescription>
                        <TrustScore score={field.value} size="sm" showLabel={false} />
                      </div>
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
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border p-4">
                  <Label className="text-base font-medium">Preferred Categories</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select categories that you're interested in
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map((tag) => (
                      <Tag
                        key={tag}
                        label={tag}
                        selected={selectedTags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <Label className="text-base font-medium">Categories to Avoid</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select categories that you want to avoid
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map((tag) => (
                      <Tag
                        key={tag}
                        label={tag}
                        selected={avoidTags.includes(tag)}
                        onClick={() => toggleAvoidTag(tag)}
                        variant="avoid"
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-base font-medium">Your DasWos Coins</Label>
                    <p className="text-sm text-muted-foreground">Current balance</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-2">
                    <DasWosCoinIcon className="h-4 w-4" />
                    <span className="text-lg font-semibold">{formatDasWosCoins(coinsBalance)}</span>
                  </Badge>
                </div>

                <FormField
                  control={form.control}
                  name="settings.maxCoinsPerItem"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base font-medium">Maximum Coins Per Item</FormLabel>
                      <div className="flex items-center justify-between">
                        <FormDescription>
                          Maximum to spend on a single item
                        </FormDescription>
                        <Badge variant="outline" className="flex items-center">
                          <DasWosCoinIcon className="h-3.5 w-3.5 mr-1" />
                          {field.value}
                        </Badge>
                      </div>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          min={1}
                          max={1000}
                          step={5}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.maxCoinsPerDay"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base font-medium">Daily Spending Limit</FormLabel>
                      <div className="flex items-center justify-between">
                        <FormDescription>
                          Maximum coins to spend per day
                        </FormDescription>
                        <Badge variant="outline" className="flex items-center">
                          <DasWosCoinIcon className="h-3.5 w-3.5 mr-1" />
                          {field.value}
                        </Badge>
                      </div>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          min={5}
                          max={2000}
                          step={10}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.purchaseFrequency.daily"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base font-medium">Daily Purchase Limit</FormLabel>
                      <div className="flex items-center justify-between">
                        <FormDescription>
                          Maximum purchases per day
                        </FormDescription>
                        <Badge variant="outline">
                          {field.value} items
                        </Badge>
                      </div>
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
                    </FormItem>
                  )}
                />
              </TabsContent>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AiShopperSettingsDialog;