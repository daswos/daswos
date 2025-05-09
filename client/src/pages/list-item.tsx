import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Image as ImageIcon, Info, AlertTriangle, Package, PackageX, PackageCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isBase64Image } from '@/lib/utils';
import ImageUpload from '@/components/image-upload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for product listing
const productSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }).max(1000),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Price must be a positive number' }
  ),
  imageUrl: z.string().refine(
    (val) => val === '' || val.startsWith('http') || isBase64Image(val),
    { message: 'Please upload an image or enter a valid image URL' }
  ),
  tags: z.string().min(3, { message: 'Please add at least one tag' }),
  category: z.string().min(1, { message: 'Please select a category' }),
  listingType: z.enum(['single', 'multiple', 'bulk']),
  quantity: z.string().optional(),
  condition: z.string().min(1, { message: 'Please select a condition' }),
  color: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ListItemPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute<any>('/list-item');
  const [, setLocation] = useLocation();
  const [showTagsHelp, setShowTagsHelp] = useState(false);
  
  // Parse URL query parameters to get prefilled values
  const queryParams = new URLSearchParams(window.location.search);
  
  // Set up form with validation
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: queryParams.get('title') || '',
      description: queryParams.get('description') || '',
      price: queryParams.get('price') || '',
      imageUrl: queryParams.get('imageUrl') || '',
      tags: queryParams.get('tags') || '',
      category: queryParams.get('category') || '',
      listingType: 'single',
      quantity: '1',
      condition: queryParams.get('condition') || 'used',
      color: queryParams.get('color') || '',
    },
  });
  
  // Watch listing type
  const watchListingType = form.watch('listingType');
  
  // Submit mutation
  const listItemMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Determine if this is a bulk buy, multi-quantity or single item listing
      const isBulkBuy = data.listingType === 'bulk';
      const isMultipleItems = data.listingType === 'multiple';
      const quantity = isMultipleItems ? parseInt(data.quantity || '1') : 1;
      
      return apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          tags: data.tags.split(',').map(tag => tag.trim()),
          isBulkBuy,
          quantity: isBulkBuy ? 100 : quantity,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Item Listed Successfully',
        description: 'Your item has been listed and is now available for buyers.',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setLocation('/my-listings');
    },
    onError: (error: any) => {
      toast({
        title: 'Error Listing Item',
        description: error?.message || 'There was an error listing your item. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProductFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to list an item.',
        variant: 'destructive',
      });
      return;
    }
    
    listItemMutation.mutate(data);
  };

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'other', label: 'Other' },
  ];
  
  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">List an Item for Sale</CardTitle>
          <CardDescription>
            Fill out the form below to list your item on Daswos marketplace.
          </CardDescription>
        </CardHeader>
        
        {!user?.isSeller && (
          <CardContent>
            <Alert className="mb-4 border-amber-500 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-800">Become a Trusted Seller</AlertTitle>
              <AlertDescription className="text-amber-700">
                While your listing is active immediately, becoming a trusted seller will increase 
                your trust score and help you sell items faster. Complete the seller verification 
                process to earn trust points.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a clear, descriptive title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed information about your item, including condition, specifications, and any other relevant details."
                        rows={6}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Tags</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTagsHelp(!showTagsHelp)}
                        className="h-6 px-2 text-xs"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Help
                      </Button>
                    </div>
                    {showTagsHelp && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter comma-separated tags to help buyers find your item (e.g., "wireless, headphones, bluetooth")
                      </p>
                    )}
                    <FormControl>
                      <Input placeholder="Enter comma-separated tags" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxSizeMB={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the color of your item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="listingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div className="flex items-start space-x-2 border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <RadioGroupItem value="single" id="single" className="mt-1" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="single" className="font-medium flex items-center">
                              <Package className="h-4 w-4 mr-2 text-blue-500" />
                              Single Item
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              List one individual item for sale
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <RadioGroupItem value="multiple" id="multiple" className="mt-1" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="multiple" className="font-medium flex items-center">
                              <PackageCheck className="h-4 w-4 mr-2 text-green-500" />
                              Multiple Items
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              List 2-100 identical items
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <RadioGroupItem value="bulk" id="bulk" className="mt-1" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="bulk" className="font-medium flex items-center">
                              <PackageX className="h-4 w-4 mr-2 text-orange-500" />
                              Bulk Buy
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Large quantity (100+ items)
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchListingType === 'multiple' && (
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Available</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="2" 
                          max="100" 
                          {...field} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val < 2) {
                              field.onChange('2');
                            } else if (val > 100) {
                              field.onChange('100');
                            } else {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a quantity between 2-100 items
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={listItemMutation.isPending}
                  className="gap-2"
                >
                  {listItemMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  List Item for Sale
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListItemPage;