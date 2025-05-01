import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck, Shield, Users, CheckCircle, ArrowRight, CreditCard, User, LockIcon, AlertTriangle, Info as InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { StripeWrapper } from '@/components/stripe-payment-form';
import { SimpleStripeForm } from '@/components/simple-stripe-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Payment form validation schema
const paymentFormSchema = z.object({
  cardholderName: z.string().min(3, { message: "Cardholder name is required" }),
  cardNumber: z.string()
    .min(16, { message: "Card number must be at least 16 digits" })
    .max(19, { message: "Card number must not exceed 19 digits" })
    .regex(/^[0-9\s-]+$/, { message: "Card number must contain only digits, spaces or dashes" }),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "Expiry date must be in MM/YY format" }),
  cvv: z.string()
    .min(3, { message: "CVV must be at least 3 digits" })
    .max(4, { message: "CVV must not exceed 4 digits" })
    .regex(/^[0-9]+$/, { message: "CVV must contain only digits" }),
  billingAddress: z.string().min(5, { message: "Billing address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  postCode: z.string().min(3, { message: "Postal code is required" })
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const SafeSphereSubscription: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { subscriptionMutation, user, hasSubscription, registerMutation, loginMutation, subscriptionDetails } = useAuth();
  const { settings } = useAdminSettings();
  const [selectedPlan, setSelectedPlan] = useState<"limited" | "unlimited">('limited');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [showSignupForm, setShowSignupForm] = useState<boolean>(false);
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState<boolean>(false);
  // We no longer need login/register tabs as we're simplifying to registration only
  // const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { toast } = useToast();

  // Log admin settings for debugging
  useEffect(() => {
    console.log('Admin settings in SafeSphere subscription page:', settings);
  }, [settings]);

  // Get return URL from query parameters if exists
  const getReturnTo = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnTo') || '/';
  };

  const returnTo = getReturnTo();

  // Initialize payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      billingAddress: "",
      city: "",
      postCode: ""
    }
  });

  // Register form schema
  const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  // Login schema
  const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  // Initialize register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Initialize login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSelectedPlan = urlParams.get('selectedPlan');
    const urlBillingCycle = urlParams.get('billingCycle');
    const showPayment = urlParams.get('showPayment');

    if (urlSelectedPlan === 'limited' || urlSelectedPlan === 'unlimited') {
      setSelectedPlan(urlSelectedPlan);
    }

    if (urlBillingCycle === 'monthly' || urlBillingCycle === 'annual') {
      setBillingCycle(urlBillingCycle);
    }

    // If showPayment is true and user is logged in, show the payment form immediately
    if (showPayment === 'true' && user) {
      console.log('Auto-showing payment form for', urlSelectedPlan, 'plan with', urlBillingCycle, 'billing');
      setShowPaymentForm(true);
    }
  }, [user]);

  // Handle select plan button click
  const handleSelectPlan = () => {
    if (user) {
      // For free tier, activate immediately without payment
      if (selectedPlan === 'limited') {
        subscriptionMutation.mutate({
          type: "limited",
          billingCycle: "monthly",
          action: "subscribe"
        }, {
          onSuccess: () => {
            setPaymentSuccess(true);
            toast({
              title: "Subscription Activated",
              description: "Your Daswos Limited plan has been activated.",
              variant: "default",
            });
          }
        });
      } else {
        // For paid plans, show payment form
        setShowPaymentForm(true);
      }
    } else {
      // If user is not logged in, show the registration form right here
      setShowSignupForm(true);
    }
  };

  // Show a confirmation dialog when switching plans if user already has a subscription
  const [showPlanChangeConfirmation, setShowPlanChangeConfirmation] = useState<boolean>(false);

  // Handle switching subscription plan
  const handleSwitchPlan = () => {
    // If user is switching plans with an existing subscription,
    // show a confirmation dialog instead of the payment form
    if (hasSubscription) {
      setShowPlanChangeConfirmation(true);
      return;
    }

    // Otherwise proceed with the standard payment process
    completeSubscriptionSwitch();
  };

  // Handle unsubscribe
  const handleUnsubscribe = () => {
    // Use action: "cancel" to indicate unsubscribing
    subscriptionMutation.mutate({
      type: "individual", // These values are required by schema but won't be used
      billingCycle: "monthly",
      action: "cancel"
    }, {
      onSuccess: () => {
        setShowUnsubscribeDialog(false);
        toast({
          title: "Subscription Canceled",
          description: "Your SafeSphere subscription has been canceled. You can resubscribe at any time.",
          variant: "default",
        });
      },
      onError: (error) => {
        setShowUnsubscribeDialog(false);
        toast({
          title: "Error",
          description: error.message || "There was an error canceling your subscription. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Function to actually complete the subscription switch after confirmation
  const completeSubscriptionSwitch = () => {
    subscriptionMutation.mutate({
      type: selectedPlan,
      billingCycle: billingCycle as "monthly" | "annual",
      action: "switch"
    }, {
      onSuccess: () => {
        setPaymentSuccess(true);
        setShowPlanChangeConfirmation(false);
        toast({
          title: "Subscription Updated",
          description: `Your plan has been updated to ${
            selectedPlan === 'limited' ? 'Daswos Limited' :
            selectedPlan === 'unlimited' ? 'Daswos Unlimited' :
            selectedPlan === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'
          } with ${billingCycle} billing. The change will take effect on your next billing date.`,
          variant: "default",
        });
      },
      onError: (error) => {
        setShowPlanChangeConfirmation(false);
        toast({
          title: "Update Failed",
          description: error.message || "There was an error updating your subscription. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Handle payment form submission
  const onPaymentSubmit = (data: PaymentFormValues) => {
    // Process payment and activate subscription
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      subscriptionMutation.mutate({
        type: selectedPlan,
        billingCycle: billingCycle as "monthly" | "annual",
        action: "subscribe"
      }, {
        onSuccess: () => {
          setIsProcessing(false);
          setPaymentSuccess(true);
          toast({
            title: "Subscription Activated",
            description: `Your ${
              selectedPlan === 'limited' ? 'Daswos Limited' :
              selectedPlan === 'unlimited' ? 'Daswos Unlimited' :
              selectedPlan === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'
            } plan has been activated.`,
            variant: "default",
          });
        },
        onError: (error) => {
          setIsProcessing(false);
          toast({
            title: "Subscription Failed",
            description: "There was an error processing your subscription. Please try again.",
            variant: "destructive",
          });
        }
      });
    }, 1500);
  };

  // We no longer need handleLogin and handleRegister
  // Authentication is now handled on the auth page

  // Go back to home or redirect to the returnTo page
  const handleBackToHome = () => {
    // After successful subscription, redirect to the intended page
    if (returnTo !== '/' && paymentSuccess) {
      setLocation(returnTo);
    } else {
      setLocation('/');
    }
  };

  // Close the payment form and return to plans
  const handleBackToPlans = () => {
    setShowPaymentForm(false);
    setShowSignupForm(false);
  };

  // Calculate pricing based on selection
  const getPriceDisplay = () => {
    if (selectedPlan === 'limited') {
      return '0'; // Free tier
    } else if (selectedPlan === 'unlimited') {
      return billingCycle === 'monthly' ? '5' : '50';
    } else {
      // Legacy plans - map to new pricing
      return billingCycle === 'monthly' ? '5' : '50';
    }
  };

  // Calculate savings
  const getSavings = () => {
    if (billingCycle === 'annual') {
      if (selectedPlan === 'limited') {
        return '0'; // Free tier has no savings
      } else if (selectedPlan === 'unlimited') {
        return '19.98'; // $9.99 * 12 - $99.90 = $19.98 savings
      } else if (selectedPlan === 'individual') {
        return '6'; // Legacy savings
      } else {
        return '14'; // Legacy family savings
      }
    }
    return '0';
  };

  // Store registration data for the payment form
  const [registrationData, setRegistrationData] = useState<{
    username: string;
    email: string;
    fullName: string;
    password: string;
  } | null>(null);

  // Validate registration data without creating an account
  const handleRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      const { confirmPassword, ...registerData } = data;

      // First validate the credentials
      const response = await fetch('/api/validate-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific validation errors
        if (errorData.error.includes('Email already in use')) {
          toast({
            title: "Email Already Registered",
            description: "An account already exists with this email. Please go back to plans and log in first.",
            variant: "default",
          });
        } else if (errorData.error.includes('Username already exists')) {
          toast({
            title: "Username Already Taken",
            description: "This username is already taken. Please choose a different username.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Validation Failed",
            description: errorData.error || "There was an error validating your information. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Validation passed, save data and show payment form
      setRegistrationData(registerData);
      setShowSignupForm(false); // Hide the signup form
      setShowPaymentForm(true); // Show the payment form
      toast({
        title: "Information Verified",
        description: "Your information has been verified. Please complete your payment to create your account.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message || "There was an error validating your account information. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add handler for login
  const handleLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: (userData) => {
        // Check if user already has a subscription
        if (userData.hasSubscription) {
          // Check if user already has the exact same plan
          if (userData.subscriptionType === selectedPlan) {
            // User already has this exact subscription
            setShowSignupForm(false);
            toast({
              title: "Already Subscribed",
              description: `You already have an active ${selectedPlan} plan subscription.`,
              variant: "default",
            });
            // Redirect to profile page
            setLocation('/profile');
          } else {
            // User has a different plan - ask if they want to switch
            setShowSignupForm(false);
            setShowPlanChangeConfirmation(true);
            toast({
              title: "Login Successful",
              description: `You already have an active ${userData.subscriptionType} plan. Would you like to switch?`,
              variant: "default",
            });
          }
        } else {
          // User doesn't have an active subscription - show payment form
          setShowSignupForm(false);  // Hide the signup/login form
          setShowPaymentForm(true);  // Show the payment form for the selected plan
          toast({
            title: "Login Successful",
            description: "You're now logged in. Please complete your subscription.",
            variant: "default",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Redirect if paid features are disabled or subscription dev mode is enabled
  useEffect(() => {
    if (settings.paidFeaturesDisabled || settings.subscriptionDevMode) {
      const message = settings.paidFeaturesDisabled
        ? "The administrator has currently disabled all premium features. All users can access SafeSphere features for free."
        : "Subscriptions are currently in development mode. All premium features are available to all users without requiring a subscription.";

      const title = settings.paidFeaturesDisabled
        ? "Premium Features Disabled"
        : "Subscription Development Mode";

      toast({
        title: title,
        description: message,
        variant: "default",
      });

      // Redirect after a short delay to allow the toast to be seen
      const timer = setTimeout(() => {
        setLocation('/');
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [settings.paidFeaturesDisabled, settings.subscriptionDevMode, setLocation, toast]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        <span className="text-primary-500">Daswos</span> Subscription
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Unlock premium Daswos features to enhance your security and protect your transactions.
      </p>

      {(settings.paidFeaturesDisabled || settings.subscriptionDevMode) && (
        <Alert className="max-w-2xl mx-auto mb-8" variant="default">
          <AlertTitle className="flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            {settings.paidFeaturesDisabled ? "Premium Features Currently Disabled" : "Subscription Development Mode"}
          </AlertTitle>
          <AlertDescription>
            {settings.paidFeaturesDisabled
              ? "The administrator has disabled all premium features. All users can access SafeSphere features for free."
              : "Subscriptions are currently in development mode. All premium features are available to all users without requiring a subscription."
            }
            You will be redirected to the home page shortly.
          </AlertDescription>
        </Alert>
      )}

      {paymentSuccess ? (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">Subscription Activated!</h2>
          <p className="text-gray-600 mb-6">
            {subscriptionMutation.variables?.action === "switch" ? (
              <>Your SafeSphere {selectedPlan} subscription has been updated. You still have access to all premium features.</>
            ) : (
              <>Your SafeSphere {selectedPlan} subscription has been activated. You now have access to all premium features.</>
            )}
          </p>
          <Button onClick={handleBackToHome} className="w-full">
            Back to Home
          </Button>
        </div>
      ) : showSignupForm ? (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Sign up to continue with your {selectedPlan} plan subscription
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackToPlans}>
                  Back to Plans
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-start">
                <ShieldCheck className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Selected Plan: {selectedPlan === 'individual' ? 'Individual' : 'Family'} Plan
                  </p>
                  <p className="text-xs text-blue-700">
                    {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} billing at {getPriceDisplay()}
                  </p>
                </div>
              </div>

              <div className="py-2 mb-4">
                <p className="text-sm text-gray-600">
                  Please create a new account to continue with your subscription. If you already have an account, please go back to the plans page and log in first.
                </p>
              </div>

              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
            </CardContent>
          </Card>
        </div>
      ) : showPaymentForm ? (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Complete your Daswos {selectedPlan === 'unlimited' ? 'Unlimited' : 'Limited'} plan subscription</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackToPlans}>
                  Back to Plans
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Removed redundant subscription message - the StripeWrapper component already shows this information */}

              {/* Use SimpleStripeForm for more reliable testing */}
              <SimpleStripeForm
                selectedPlan={selectedPlan as 'limited' | 'unlimited' | 'individual' | 'family'}
                billingCycle={billingCycle as 'monthly' | 'annual'}
                onSuccess={() => {
                  setPaymentSuccess(true);
                  toast({
                    title: "Payment Successful",
                    description: `Your ${selectedPlan} plan has been activated.`,
                    variant: "default",
                  });
                }}
                onCancel={handleBackToPlans}
              />

              {/* Original Stripe form - commented out for now
              <StripeWrapper
                selectedPlan={selectedPlan as 'limited' | 'unlimited' | 'individual' | 'family'}
                billingCycle={billingCycle as 'monthly' | 'annual'}
                registrationData={registrationData || undefined}
                onSuccess={() => {
                  setPaymentSuccess(true);
                  toast({
                    title: "Payment Successful",
                    description: `Your ${selectedPlan} plan has been activated.`,
                    variant: "default",
                  });
                }}
                onCancel={handleBackToPlans}
              />
              */}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* If user is logged in and has a subscription, show subscription management */}
          {user && hasSubscription ? (
            <div className="max-w-md mx-auto mb-8">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Current Subscription</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>
                    Manage your Daswos subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md">
                      <div className="flex items-center mb-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-medium text-blue-800">
                          {subscriptionDetails?.type === 'individual' ? 'Individual' : 'Family'} Plan
                        </h3>
                      </div>
                      <p className="text-sm text-blue-700 mb-1">
                        Your subscription is active until:{' '}
                        {subscriptionDetails?.expiresAt
                          ? new Date(subscriptionDetails.expiresAt).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                      <p className="text-sm text-blue-700">
                        {subscriptionDetails?.type === 'individual'
                          ? 'Includes access for a single user account'
                          : 'Includes access for up to 5 family members'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-2">
                  <div className="w-full flex space-x-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => setShowPaymentForm(true)}
                    >
                      Change Plan
                    </Button>
                    <Dialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                          Unsubscribe
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Unsubscription</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your Daswos subscription?
                            You will lose access to premium features immediately.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-md text-amber-700 text-sm mb-4">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                            <div>
                              <p className="font-medium mb-1">Your account will remain active</p>
                              <p>You're only canceling your Daswos subscription. Your account will still exist, and you can resubscribe at any time.</p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowUnsubscribeDialog(false)}>
                            Keep Subscription
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleUnsubscribe}
                            disabled={subscriptionMutation.isPending}
                          >
                            {subscriptionMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : null}

          {/* Billing Cycle Selection */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-gray-100 p-4 rounded-lg flex justify-center mb-8">
              <RadioGroup
                defaultValue="monthly"
                className="flex"
                orientation="horizontal"
                onValueChange={setBillingCycle}
              >
                <div className="flex items-center mr-6">
                  <RadioGroupItem value="monthly" id="monthly" className="mr-2" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="annual" id="annual" className="mr-2" />
                  <Label htmlFor="annual">Annual (Save 16%)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
              {/* Limited Plan (Free) */}
              <div className="flex flex-col">
                <Card className={`border-2 ${selectedPlan === 'limited' ? 'border-primary-500' : 'border-gray-200'} h-full`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Daswos Limited</CardTitle>
                        <CardDescription>Basic protection for individuals</CardDescription>
                      </div>
                      <Shield className="h-8 w-8 text-primary-500" />
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">Free</span>
                      <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Individual Only</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>SafeSphere protection</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>SuperSafe mode</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>All features except Daswos AI</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center space-x-2 w-full">
                      <RadioGroupItem
                        value="limited"
                        id="limited"
                        disabled={hasSubscription && subscriptionDetails?.type === 'limited'}
                      />
                      <Label htmlFor="limited" className="flex-grow font-medium">
                        {hasSubscription && subscriptionDetails?.type === 'limited'
                          ? "Current Plan"
                          : "Select Limited Plan"}
                      </Label>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Unlimited Plan (Paid) */}
              <div className="flex flex-col">
                <Card className={`border-2 ${selectedPlan === 'unlimited' ? 'border-primary-500' : 'border-gray-200'} h-full`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Daswos Unlimited</CardTitle>
                        <CardDescription>Complete protection with AI features</CardDescription>
                      </div>
                      <Users className="h-8 w-8 text-primary-500" />
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">£{billingCycle === 'monthly' ? '5' : '50'}</span>
                      <span className="text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Up to 5 Accounts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>All Limited plan features</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Daswos AI search</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>AutoShop integration</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Family account support (up to 5 accounts)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>Control of umbrella accounts' SafeSphere and SuperSafe settings</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center space-x-2 w-full">
                      <RadioGroupItem
                        value="unlimited"
                        id="unlimited"
                        disabled={hasSubscription && subscriptionDetails?.type === 'unlimited'}
                      />
                      <Label htmlFor="unlimited" className="flex-grow font-medium">
                        {hasSubscription && subscriptionDetails?.type === 'unlimited'
                          ? "Current Plan"
                          : "Select Unlimited Plan"}
                      </Label>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </RadioGroup>

          {/* Continue with Plan Button - More prominent and above Order Summary */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={user && hasSubscription ? handleSwitchPlan : handleSelectPlan}
              className="px-8 py-6 text-lg font-semibold bg-primary-600 hover:bg-primary-700"
            >
              {user && hasSubscription
                ? 'Switch to this Plan'
                : user
                  ? 'Continue to Payment'
                  : 'Continue with this Plan'
              }
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Daswos Subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Selected Plan:</span>
                    <span className="font-semibold">
                      {selectedPlan === 'limited' ? 'Daswos Limited' :
                       selectedPlan === 'unlimited' ? 'Daswos Unlimited' :
                       selectedPlan === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'} Plan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Cycle:</span>
                    <span>
                      {billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>
                      £{getPriceDisplay()} {billingCycle === 'monthly' ? 'per month' : 'per year'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="flex justify-between text-green-600">
                      <span>You save:</span>
                      <span>£{getSavings()} annually</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>
                      £{getPriceDisplay()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={user && hasSubscription ? handleSwitchPlan : handleSelectPlan}
                  className="w-full"
                >
                  {user && hasSubscription
                    ? 'Switch to this Plan'
                    : user
                      ? 'Continue to Payment'
                      : 'Continue with this Plan'
                  }
                </Button>
              </CardFooter>
            </Card>

            <Alert className="mt-6 bg-blue-50 border-blue-100">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Enhanced Protection</AlertTitle>
              <AlertDescription className="text-blue-700">
                Daswos Unlimited subscription gives you advanced protection features, AI capabilities, and access to exclusive verified sellers.
              </AlertDescription>
            </Alert>
          </div>
        </>
      )}
      {/* Plan Change Confirmation Dialog */}
      <Dialog open={showPlanChangeConfirmation} onOpenChange={setShowPlanChangeConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Daswos Plan Change</DialogTitle>
            <DialogDescription>
              You are changing your Daswos subscription plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current plan info */}
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Current Plan:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Type:</div>
                <div className="font-medium capitalize">
                  {subscriptionDetails?.type === 'limited' ? 'Daswos Limited' :
                   subscriptionDetails?.type === 'unlimited' ? 'Daswos Unlimited' :
                   subscriptionDetails?.type === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'} Plan
                </div>

                <div>Price:</div>
                <div className="font-medium">
                  {subscriptionDetails?.type === 'limited' ? 'Free' :
                   subscriptionDetails?.type === 'unlimited' ? '£5/month' :
                   '£5/month (Legacy Plan)'}
                </div>

                {subscriptionDetails?.expiresAt && (
                  <>
                    <div>Next Billing:</div>
                    <div className="font-medium">
                      {new Date(subscriptionDetails.expiresAt).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* New plan info */}
            <div className="bg-primary/10 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">New Plan:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Type:</div>
                <div className="font-medium capitalize">
                  {selectedPlan === 'limited' ? 'Daswos Limited' :
                   selectedPlan === 'unlimited' ? 'Daswos Unlimited' :
                   selectedPlan === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'} Plan
                </div>

                <div>Price:</div>
                <div className="font-medium">
                  {selectedPlan === 'limited' ? 'Free' :
                   selectedPlan === 'unlimited' ? '£5/month' :
                   '£5/month (Legacy Plan)'}
                </div>
              </div>
            </div>

            <Alert className="mt-4 bg-blue-50 border-blue-100 text-blue-700">
              <AlertTitle className="text-blue-800">Billing Information</AlertTitle>
              <AlertDescription className="text-blue-700">
                {selectedPlan === 'limited' ? (
                  <>
                    Your new free plan will take effect on your next billing date: {subscriptionDetails?.expiresAt
                      ? new Date(subscriptionDetails.expiresAt).toLocaleDateString()
                      : 'Unknown'}.
                    You will not be charged again after that date.
                  </>
                ) : (
                  <>
                    Your new plan rate of {
                      selectedPlan === 'unlimited' ? '£9.99' :
                      selectedPlan === 'individual' ? '£3' : '£7'
                    } per month
                    will take effect on your next billing date: {subscriptionDetails?.expiresAt
                      ? new Date(subscriptionDetails.expiresAt).toLocaleDateString()
                      : 'Unknown'}.
                    You will not be charged again until that date.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanChangeConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={completeSubscriptionSwitch}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SafeSphereSubscription;