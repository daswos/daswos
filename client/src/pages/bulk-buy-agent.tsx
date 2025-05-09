import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { UserCheck, DollarSign, Shield, Calendar, Clock, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Define the schema for the bulk buy request form
const bulkBuyRequestSchema = z.object({
  requestType: z.enum(['basic', 'premium', 'enterprise', 'custom']),
  quantity: z.number().int().positive({ message: "Please enter a positive quantity" }),
  maxBudget: z.number().int().positive().optional(),
  specialRequirements: z.string().min(10, "Please provide at least 10 characters").max(1000),
  preferredDeliveryDate: z.string().optional(),
});

type BulkBuyRequestFormValues = z.infer<typeof bulkBuyRequestSchema>;

const BulkBuyAgent: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'enterprise' | 'custom'>('basic');
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [showRequestForm, setShowRequestForm] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Custom handler for RadioGroup
  const handleRadioChange = (value: string) => {
    if (value === 'basic' || value === 'premium' || value === 'enterprise' || value === 'custom') {
      setSelectedPlan(value);
      form.setValue('requestType', value);
    }
  };
  
  // Create form
  const form = useForm<BulkBuyRequestFormValues>({
    resolver: zodResolver(bulkBuyRequestSchema),
    defaultValues: {
      requestType: 'basic',
      specialRequirements: '',
      quantity: 100, // Default quantity value
    },
  });
  
  // Submit bulk buy request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (data: BulkBuyRequestFormValues) => {
      const response = await fetch('/api/bulk-buy/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setRequestSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your bulk buy request has been sent to our agents. We'll contact you soon!",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error submitting bulk buy request:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: BulkBuyRequestFormValues) => {
    // Make sure the selected plan is a valid request type
    const requestType = selectedPlan as 'basic' | 'premium' | 'enterprise' | 'custom';
    
    // Submit the request with the properly typed data
    submitRequestMutation.mutate({
      ...data,
      requestType
    });
  };
  
  // Go back to bulk buy search
  const handleBackToBulkBuy = () => {
    setLocation('/bulk-buy');
  };
  
  // Handle plan selection
  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan as 'basic' | 'premium' | 'enterprise' | 'custom');
    form.setValue('requestType', plan as 'basic' | 'premium' | 'enterprise' | 'custom');
  };
  
  // Handle request form submission
  const handleSubmitRequest = () => {
    setShowRequestForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        <span className="text-primary-500">BulkBuy</span> Agent Service
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Our professional agents will communicate with sellers on your behalf, verify product quality,
        and ensure you get the best deals with maximum protection.
      </p>

      {!user ? (
        <div className="max-w-md mx-auto text-center py-8">
          <Card>
            <CardHeader>
              <CardTitle>Free BulkBuy Agent Service</CardTitle>
              <CardDescription>
                Sign up for a standard (free) account to access our BulkBuy agent service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4 text-amber-600">
                <Info className="h-5 w-5 mr-2" />
                <span>You need to be logged in to use our BulkBuy Agent service</span>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => setLocation('/auth?action=login&redirectTo=/bulk-buy-agent')}
                  className="w-full"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => setLocation('/auth?action=register&type=standard')}
                  variant="outline"
                  className="w-full"
                >
                  Create Standard Account (Free)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : requestSubmitted ? (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your BulkBuy Agent request has been received. Our team will review your requirements and contact you soon with a quote.
          </p>
          <Button onClick={handleBackToBulkBuy} className="w-full">
            Back to BulkBuy
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`border-2 ${selectedPlan === 'basic' ? 'border-blue-500' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle>Basic Agent</CardTitle>
              <CardDescription>For smaller bulk purchases</CardDescription>
              <div className="text-3xl font-bold mt-2">$49.99</div>
              <Badge className="mt-2" variant="secondary">Most Popular</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Seller verification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic negotiation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Quality confirmation</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Advanced terms negotiation</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Legal document review</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <RadioGroup defaultValue="basic" className="w-full" onValueChange={handleRadioChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basic" id="basic" />
                  <Label htmlFor="basic">Select Basic Plan</Label>
                </div>
              </RadioGroup>
            </CardFooter>
          </Card>

          <Card className={`border-2 ${selectedPlan === 'premium' ? 'border-blue-500' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle>Premium Agent</CardTitle>
              <CardDescription>For medium-sized bulk orders</CardDescription>
              <div className="text-3xl font-bold mt-2">$149.99</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Seller verification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced negotiation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Quality confirmation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced terms negotiation</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Legal document review</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <RadioGroup defaultValue="basic" className="w-full" onValueChange={handleRadioChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium">Select Premium Plan</Label>
                </div>
              </RadioGroup>
            </CardFooter>
          </Card>

          <Card className={`border-2 ${selectedPlan === 'enterprise' ? 'border-blue-500' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle>Enterprise Agent</CardTitle>
              <CardDescription>For large bulk purchases</CardDescription>
              <div className="text-3xl font-bold mt-2">$299.99</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Seller verification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Expert negotiation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Quality confirmation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced terms negotiation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Legal document review</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <RadioGroup defaultValue="basic" className="w-full" onValueChange={handleRadioChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enterprise" id="enterprise" />
                  <Label htmlFor="enterprise">Select Enterprise Plan</Label>
                </div>
              </RadioGroup>
            </CardFooter>
          </Card>
        </div>
      )}

      {user && !requestSubmitted && !showRequestForm && (
        <>
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-bold mb-4">What Our BulkBuy Agents Do For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <UserCheck className="h-6 w-6 text-primary-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Seller Verification</h3>
                  <p className="text-sm text-gray-600">We'll personally contact and verify the seller's credentials and reputation.</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Price Negotiation</h3>
                  <p className="text-sm text-gray-600">Our agents will negotiate the best possible price for your bulk order.</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Shield className="h-6 w-6 text-primary-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Purchase Protection</h3>
                  <p className="text-sm text-gray-600">We provide additional security for high-value bulk transactions.</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-500 mr-3" />
                <div>
                  <h3 className="font-semibold">Delivery Scheduling</h3>
                  <p className="text-sm text-gray-600">We'll coordinate with the seller to arrange delivery that works for you.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-blue-300 shadow-lg">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>BulkBuy Agent Service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Selected Plan:</span>
                    <span className="font-semibold">
                      {selectedPlan === 'basic' && 'Basic Agent'}
                      {selectedPlan === 'premium' && 'Premium Agent'}
                      {selectedPlan === 'enterprise' && 'Enterprise Agent'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>
                      {selectedPlan === 'basic' && '$49.99'}
                      {selectedPlan === 'premium' && '$149.99'}
                      {selectedPlan === 'enterprise' && '$299.99'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>
                      {selectedPlan === 'basic' && '$49.99'}
                      {selectedPlan === 'premium' && '$149.99'}
                      {selectedPlan === 'enterprise' && '$299.99'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleSubmitRequest} 
                  className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  size="lg"
                >
                  Continue with Request
                </Button>
              </CardFooter>
            </Card>

            <Alert className="mt-6 bg-blue-50 border-blue-100">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Fast Turnaround Time</AlertTitle>
              <AlertDescription className="text-blue-700">
                Our agents will contact you within 2 business hours after your request is submitted.
              </AlertDescription>
            </Alert>
          </div>
        </>
      )}
      
      {user && !requestSubmitted && showRequestForm && (
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Bulk Buy Request</CardTitle>
              <CardDescription>
                Tell us about your bulk purchase requirements and we'll have an agent contact you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you're looking to purchase in bulk. Include details like product type, estimated quantity, quality requirements, etc."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The more details you provide, the better our agents can assist you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 500"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Budget (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 10000"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Delivery Date (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitRequestMutation.isPending}
                      className="flex-1"
                    >
                      {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BulkBuyAgent;