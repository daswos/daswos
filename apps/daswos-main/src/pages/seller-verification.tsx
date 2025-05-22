import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, CheckCircle2, Upload } from 'lucide-react';
import { ProtectedRoute } from '../lib/protected-route';

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

type BusinessInfoValues = z.infer<typeof businessInfoSchema>;
type IndividualSellerValues = z.infer<typeof individualSellerSchema>;

// Create the main component content
const SellerVerificationContent = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [sellerType, setSellerType] = useState<'business' | 'individual'>('business');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  
  // Fetch user and check if they already have a seller profile
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch existing seller verification if any
  const { data: sellerData, isLoading: isLoadingSellerData } = useQuery({
    queryKey: ['/api/sellers/verification'],
    enabled: !!(user && typeof user === 'object' && 'id' in user),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // If seller data exists, set the verification status
    if (sellerData && typeof sellerData === 'object' && 'verification_status' in sellerData) {
      setVerificationStatus(sellerData.verification_status as string);
    }
  }, [sellerData]);

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
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your trusted seller application has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers/verification'] });
      setVerificationStatus('pending');
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
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your trusted seller application has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers/verification'] });
      setVerificationStatus('pending');
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

    const statusMessages = {
      pending: {
        title: "Application Pending",
        description: "Your trusted seller application is currently under review. This process typically takes 1-2 business days.",
        icon: InfoIcon,
        variant: "default" as const
      },
      approved: {
        title: "Trusted Seller Status Granted",
        description: "Congratulations! You are now a trusted seller with increased trust points. Your listings will receive higher visibility.",
        icon: CheckCircle2,
        variant: "default" as const
      },
      rejected: {
        title: "Application Needs Revision",
        description: "Unfortunately, your trusted seller application needs some changes. Please review the feedback below and resubmit.",
        icon: InfoIcon,
        variant: "destructive" as const
      }
    };

    const status = statusMessages[verificationStatus as keyof typeof statusMessages] || statusMessages.pending;

    return (
      <Alert variant={status.variant} className="mb-6">
        <status.icon className="h-4 w-4" />
        <AlertTitle>{status.title}</AlertTitle>
        <AlertDescription>{status.description}</AlertDescription>
        {verificationStatus === 'approved' && (
          <>
            {sellerData && typeof sellerData === 'object' && 'trust_score' in sellerData && (
              <div className="mt-3 mb-2">
                <div className="flex items-center">
                  <div className="mr-2">Seller Trust Score:</div>
                  <div className="font-semibold">
                    {typeof sellerData.trust_score === 'number' ? sellerData.trust_score : 50}/100
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ 
                      width: `${typeof sellerData.trust_score === 'number' ? 
                        Math.min(100, Math.max(0, sellerData.trust_score)) : 50}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This score represents your credibility in the marketplace. Higher scores can lead to better visibility.
                </p>
              </div>
            )}
            <Button className="mt-4" onClick={() => setLocation('/seller/dashboard')}>
              Go to Seller Dashboard
            </Button>
          </>
        )}
        {verificationStatus === 'rejected' && 
          sellerData && 
          typeof sellerData === 'object' && 
          'rejection_reason' in sellerData && (
          <AlertDescription className="mt-2 font-semibold">
            Reason: {typeof sellerData.rejection_reason === 'string' ? sellerData.rejection_reason : 'No reason provided'}
          </AlertDescription>
        )}
      </Alert>
    );
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-2">Become a Trusted Seller</h1>
      <p className="text-muted-foreground mb-6">
        Complete this form to earn trust points and build buyer confidence in your listings.
      </p>

      {renderVerificationStatus()}

      {/* Only show the form if not already approved */}
      {verificationStatus !== 'approved' && (
        <>
          <Tabs defaultValue="business" onValueChange={(value) => setSellerType(value as 'business' | 'individual')}>
            <TabsList className="mb-4">
              <TabsTrigger value="business">Business Account</TabsTrigger>
              <TabsTrigger value="individual">Individual Seller</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Trust Application</CardTitle>
                  <CardDescription>
                    Please provide your registered business information to earn trusted seller status.
                  </CardDescription>
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <h4 className="text-sm font-medium">About Trusted Seller Status</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete all fields to maximize your trust points and earn trusted seller status. Business accounts start with a higher base score.
                      Adding detailed information, documents, and verifiable credentials improves your visibility in the marketplace.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...businessForm}>
                    <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Legal and Registration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={businessForm.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Official Company Name*</FormLabel>
                                <FormControl>
                                  <Input placeholder="As registered with authorities" {...field} />
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
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select business type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="corporation">Corporation</SelectItem>
                                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                                    <SelectItem value="partnership">Partnership</SelectItem>
                                    <SelectItem value="soleProprietorship">Sole Proprietorship</SelectItem>
                                    <SelectItem value="nonprofit">Non-profit Organization</SelectItem>
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
                                <FormLabel>Company Registration Number*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Business registration ID" {...field} />
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
                                <FormLabel>VAT/Tax ID Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tax identification number" {...field} />
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
                              <FormLabel>Registered Business Address*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Full registered address" 
                                  {...field} 
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />
                        
                        <h3 className="text-lg font-medium">Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={businessForm.control}
                            name="contactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Official Phone Number*</FormLabel>
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
                              <FormLabel>Website URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://your-business-website.com" {...field} />
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
                                  placeholder="Describe your business activities and the products you sell" 
                                  {...field} 
                                  rows={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="py-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Upload className="h-5 w-5" />
                            <span className="font-medium">Document Upload</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Please prepare the following documents. You'll be asked to upload them after submitting this form:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            <li>Certificate of incorporation or business registration</li>
                            <li>VAT/Tax registration certificate (if applicable)</li>
                            <li>Proof of business address (utility bill, bank statement)</li>
                            <li>Photo ID of authorized representative</li>
                          </ul>
                        </div>
                        
                        <FormField
                          control={businessForm.control}
                          name="termsAccepted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I confirm that all information provided is accurate and truthful. I agree to the seller terms and conditions.
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={submitBusinessVerification.isPending || verificationStatus === 'pending'}
                      >
                        {submitBusinessVerification.isPending ? "Submitting..." : "Apply for Trusted Seller Status"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="individual">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Trust Application</CardTitle>
                  <CardDescription>
                    Please complete this form to become a trusted individual seller. Only name and email are required.
                  </CardDescription>
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <h4 className="text-sm font-medium">Simplified Trust Application</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      We've simplified our trust application process to get you started quickly. Only your name and email address 
                      are required, but providing additional information may help increase your trust points and verification speed.
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
                                  <Input placeholder="https://your-website.com or social media profile" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={individualForm.control}
                          name="productDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the products you sell and your business activities" 
                                  {...field} 
                                  rows={4}
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
                              <FormLabel>Years in Business (Optional)</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select experience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="new">New to selling</SelectItem>
                                  <SelectItem value="1-2">1-2 years</SelectItem>
                                  <SelectItem value="3-5">3-5 years</SelectItem>
                                  <SelectItem value="5+">5+ years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="py-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Upload className="h-5 w-5" />
                            <span className="font-medium">Document Upload (Optional)</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            You may prepare these documents to help boost your trust points:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            <li>Government-issued photo ID (passport, driver's license, national ID)</li>
                            <li>Proof of address (utility bill, bank statement)</li>
                            <li>Sample photos of your products</li>
                          </ul>
                        </div>

                        <Separator />
                        
                        <FormField
                          control={individualForm.control}
                          name="termsAccepted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I confirm that all information provided is accurate and truthful. I agree to the seller terms and conditions.
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={submitIndividualVerification.isPending || verificationStatus === 'pending'}
                      >
                        {submitIndividualVerification.isPending ? "Submitting..." : "Apply for Trusted Seller Status"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

// Create the main page component that uses ProtectedRoute
const SellerVerificationPage = () => (
  <ProtectedRoute 
    path="/seller-verification" 
    component={SellerVerificationContent} 
  />
);

export default SellerVerificationPage;