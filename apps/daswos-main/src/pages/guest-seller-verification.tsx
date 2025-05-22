import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoIcon, CheckCircle2 } from 'lucide-react';
import { useAdminSettings } from '@/hooks/use-admin-settings';

// Define form schemas for both business and individual sellers
const businessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(2, "Please select a business type"),
  registrationNumber: z.string().min(2, "Registration number is required"),
  taxId: z.string().optional(),
  businessAddress: z.string().min(5, "Business address is required"),
  contactPhone: z.string().min(5, "Contact phone is required"),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  yearEstablished: z.string().regex(/^\d{4}$/, "Please enter a valid year (YYYY)"),
  description: z.string().min(20, "Please provide at least 20 characters describing your business"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms to continue",
  }),
});

const individualSellerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  tradingName: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  productDescription: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms to continue",
  }),
});

// Type definitions
type BusinessInfoValues = z.infer<typeof businessInfoSchema>;
type IndividualSellerValues = z.infer<typeof individualSellerSchema>;

// The main component
const GuestSellerVerificationContent = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [sellerType, setSellerType] = useState<'business' | 'individual'>('individual');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const { settings } = useAdminSettings();

  // Business form
  const businessForm = useForm<BusinessInfoValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
      registrationNumber: '',
      taxId: '',
      businessAddress: '',
      contactPhone: '',
      websiteUrl: '',
      yearEstablished: '',
      description: '',
      termsAccepted: false,
    }
  });

  // Individual seller form
  const individualForm = useForm<IndividualSellerValues>({
    resolver: zodResolver(individualSellerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      tradingName: '',
      address: '',
      contactPhone: '',
      websiteUrl: '',
      productDescription: '',
      yearsInBusiness: '',
      termsAccepted: false,
    }
  });

  // Mutation for submitting business verification
  const submitBusinessVerification = useMutation({
    mutationFn: async (data: BusinessInfoValues) => {
      return apiRequest('/api/sellers/verification/business', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      if (data.userStatus === 'pending') {
        // Store verification data in state and session storage for account creation
        setVerificationData(data.verificationData);
        // Save verification data to session storage to use during account creation
        sessionStorage.setItem('sellerVerificationData', JSON.stringify(data.verificationData));
        setShowSignupPrompt(true);
        toast({
          title: "Account Required",
          description: "Please create an account to complete your verification.",
        });
      } else {
        toast({
          title: "Verification Submitted",
          description: "Your business verification has been submitted for review.",
        });
        setVerificationStatus('pending');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for submitting individual seller verification
  const submitIndividualVerification = useMutation({
    mutationFn: async (data: IndividualSellerValues) => {
      return apiRequest('/api/sellers/verification/individual', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      if (data.userStatus === 'pending') {
        // Store verification data in state and session storage for account creation
        setVerificationData(data.verificationData);
        // Save verification data to session storage to use during account creation
        sessionStorage.setItem('sellerVerificationData', JSON.stringify(data.verificationData));
        setShowSignupPrompt(true);
        toast({
          title: "Account Required",
          description: "Please create an account to complete your verification.",
        });
      } else {
        toast({
          title: "Verification Submitted",
          description: "Your seller verification has been submitted for review.",
        });
        setVerificationStatus('pending');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onBusinessSubmit = (data: BusinessInfoValues) => {
    submitBusinessVerification.mutate(data);
  };

  const onIndividualSubmit = (data: IndividualSellerValues) => {
    submitIndividualVerification.mutate(data);
  };

  // Renders appropriate status information
  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;

    switch (verificationStatus) {
      case 'pending':
        return (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <InfoIcon className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Verification Pending</AlertTitle>
            <AlertDescription>
              Your verification request is currently being reviewed. This typically takes 1-2 business days.
            </AlertDescription>
          </Alert>
        );
      case 'approved':
        return (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Verification Approved</AlertTitle>
            <AlertDescription>
              Your account has been verified. You can now list products for sale.
              <div className="mt-2">
                <Button onClick={() => setLocation('/list-item')} size="sm" className="bg-green-600 hover:bg-green-700">
                  Start Selling
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      case 'rejected':
        return (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <InfoIcon className="h-4 w-4 text-red-600" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              Unfortunately, your verification request was not approved. Please review our seller guidelines
              and you may submit a new application after making the necessary adjustments.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Show the account creation prompt if needed
  if (showSignupPrompt) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create an Account to Complete Verification</CardTitle>
            <CardDescription>
              Your seller information has been received. Please create an account to complete the verification process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We've saved your verification details. To complete the process, you'll need to:
            </p>
            <ol className="list-decimal ml-5 mb-6 space-y-2">
              <li>Create a DasWos account with the same email address you provided in your verification form</li>
              <li>Once registered, your verification request will be automatically linked to your account</li>
              <li>Our team will review your verification request within 1-2 business days</li>
            </ol>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setLocation('/')}>
              Return to Home
            </Button>
            <Button onClick={() => setLocation('/auth')}>
              Create Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-2">Seller Verification</h1>
      <p className="text-muted-foreground mb-6">
        Complete this form to verify your account as a seller on our platform.
      </p>

      {renderVerificationStatus()}

      <Tabs defaultValue="individual" onValueChange={(value) => setSellerType(value as 'business' | 'individual')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Seller</TabsTrigger>
          <TabsTrigger value="business">Business Seller</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Individual Seller Verification</CardTitle>
              <CardDescription>
                Please complete this form to verify as an individual seller. Only name and email are required.
              </CardDescription>
              <div className="mt-2 p-2 bg-muted rounded-md">
                <h4 className="text-sm font-medium">Simplified Verification</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  We've simplified our verification process to get you started quickly. Only your name and email address 
                  are required, but providing additional information may help speed up your verification.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...individualForm}>
                <form onSubmit={individualForm.handleSubmit(onIndividualSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={individualForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Legal Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full legal name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={individualForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address*</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={individualForm.control}
                      name="tradingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trading Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Business/brand name (if applicable)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={individualForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residential Address (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your full residential address" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={individualForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={individualForm.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website or Social Media URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    <h3 className="text-lg font-medium">Business Details (Optional)</h3>
                    
                    <FormField
                      control={individualForm.control}
                      name="productDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Products or Services Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the products or services you plan to sell" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={individualForm.control}
                      name="yearsInBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2 years" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <FormField
                      control={individualForm.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Accept Terms & Conditions*</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              I agree to the DasWos <a href="/terms" className="text-primary underline">terms of service</a> and 
                              <a href="/seller-terms" className="text-primary underline"> seller guidelines</a>. I confirm that all
                              information provided is accurate to the best of my knowledge.
                            </p>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="min-w-[150px]">
                      Submit for Verification
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Verification</CardTitle>
              <CardDescription>
                Please complete this form to verify your business as a seller on our platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Legal Business Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Your business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type*</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                                <SelectItem value="corporation">Corporation</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                                <SelectItem value="nonprofit">Non-Profit Organization</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Registration Number*</FormLabel>
                            <FormControl>
                              <Input placeholder="Registration/EIN/Business ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="VAT/GST/Tax ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={businessForm.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Full business address" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Phone*</FormLabel>
                            <FormControl>
                              <Input placeholder="Business contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="yearEstablished"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Established*</FormLabel>
                            <FormControl>
                              <Input placeholder="YYYY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={businessForm.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your business, products/services, and experience" 
                              {...field} 
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />
                    
                    <FormField
                      control={businessForm.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Accept Terms & Conditions*</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              I agree to the DasWos <a href="/terms" className="text-primary underline">terms of service</a> and 
                              <a href="/seller-terms" className="text-primary underline"> seller guidelines</a>. I confirm that all
                              information provided is accurate to the best of my knowledge.
                            </p>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="min-w-[150px]">
                      Submit for Verification
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GuestSellerVerificationPage = () => (
  <GuestSellerVerificationContent />
);

export default GuestSellerVerificationPage;