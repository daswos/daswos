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
  const [selectedPlan, setSelectedPlan] = useState<"limited" | "unlimited">('unlimited');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
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

  // Check URL parameters on mount and check if user already has a subscription
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSelectedPlan = urlParams.get('selectedPlan');
    const urlBillingCycle = urlParams.get('billingCycle');
    const showPayment = urlParams.get('showPayment');
    const success = urlParams.get('success');

    // If the user just completed a successful subscription, redirect to home
    if (success === 'true' && user && user.hasSubscription) {
      console.log('User has successfully subscribed, redirecting to home page');
      toast({
        title: "Subscription Activated",
        description: `Your ${user.subscriptionType} plan has been activated. You now have access to all premium features.`,
        variant: "default",
      });

      // Redirect to home page after a short delay to allow the toast to be seen
      setTimeout(() => {
        setLocation('/');
      }, 1500);
      return;
    }

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
  }, [user, toast, setLocation]);

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
      // If user is not logged in, go directly to the payment form
      // which now includes account creation functionality
      setShowPaymentForm(true);

      // Show a helpful toast message
      toast({
        title: "Create an Account",
        description: "You'll need to create an account during the payment process to continue with your subscription.",
        variant: "default",
      });
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

  // Auto-redirect to home after successful subscription
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        if (returnTo !== '/') {
          setLocation(returnTo);
        } else {
          setLocation('/');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, returnTo, setLocation]);

  // Close the payment form and return to plans
  const handleBackToPlans = () => {
    setShowPaymentForm(false);
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

  // We no longer need to store registration data separately
  // as it's handled directly in the SimpleStripeForm component

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
    <div className="container mx-auto px-4 py-4">

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
        <div className="max-w-md mx-auto text-center py-6">
          <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-700 mb-2">Subscription Activated!</h2>
          <p className="text-gray-600 text-sm">
            {subscriptionMutation.variables?.action === "switch" ? (
              <>Your Daswos Unlimited subscription has been updated. You now have access to all premium features.</>
            ) : (
              <>Your Daswos Unlimited subscription has been activated. You now have access to all premium features.</>
            )}
          </p>
        </div>
      ) : showPaymentForm ? (
        <div className="max-w-md mx-auto">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Payment Details</CardTitle>
                  <CardDescription className="text-xs">Complete your Daswos Unlimited subscription</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackToPlans} className="h-7 text-xs px-2">
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Order Summary */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-white text-xs mb-2">Order Summary</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Plan:</span>
                    <span className="font-semibold text-black dark:text-white">Daswos Unlimited</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Billing:</span>
                    <span className="text-black dark:text-white">{billingCycle === 'monthly' ? 'Monthly' : 'Annual'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Price:</span>
                    <span className="text-black dark:text-white">£{getPriceDisplay()} {billingCycle === 'monthly' ? 'per month' : 'per year'}</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                      <span>Savings:</span>
                      <span>£{getSavings()} annually</span>
                    </div>
                  )}
                  <Separator className="my-1" />
                  <div className="flex justify-between items-center font-bold text-black dark:text-white">
                    <span>Total:</span>
                    <span>£{getPriceDisplay()}</span>
                  </div>
                </div>
              </div>

              {/* Use SimpleStripeForm for more reliable testing */}
              <div className="text-xs">
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
              </div>
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
          <div className="max-w-md mx-auto mb-4">
            <div className="flex justify-center mb-1">
              <h3 className="text-xs font-medium text-gray-700 dark:text-white">Choose Your Billing Cycle</h3>
            </div>
            <RadioGroup
              value={billingCycle}
              onValueChange={setBillingCycle}
              className="grid grid-cols-2 gap-2"
            >
              <div
                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                  billingCycle === 'monthly'
                    ? 'border-primary-500 bg-primary-50 dark:bg-gray-700 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value="monthly"
                    id="monthly"
                    className="mr-1.5"
                  />
                  <Label htmlFor="monthly" className="font-medium text-xs text-black dark:text-white">Monthly</Label>
                </div>
                <div className="pl-5 text-xs text-gray-600 dark:text-gray-300">
                  <p className="text-black dark:text-white">£5 per month</p>
                  <p>Flexible, cancel anytime</p>
                </div>
              </div>

              <div
                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                  billingCycle === 'annual'
                    ? 'border-primary-500 bg-primary-50 dark:bg-gray-700 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setBillingCycle('annual')}
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value="annual"
                    id="annual"
                    className="mr-1.5"
                  />
                  <Label htmlFor="annual" className="font-medium text-xs text-black dark:text-white">Annual</Label>
                  <Badge className="ml-1 bg-green-100 text-green-800 text-xs px-1 py-0">Save 16%</Badge>
                </div>
                <div className="pl-5 text-xs text-gray-600 dark:text-gray-300">
                  <p className="text-black dark:text-white">£50 per year</p>
                  <p>Best value, save £10</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="max-w-md mx-auto mb-4">
            <div className="border rounded-lg p-3 border-primary-500 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Daswos Unlimited</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">Complete protection with AI features</p>
                </div>
                <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>

              <div className="flex items-baseline mb-2">
                <span className="text-xl font-bold dark:text-white">£{billingCycle === 'monthly' ? '5' : '50'}</span>
                <span className="text-gray-600 dark:text-gray-300 ml-1 text-xs">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 text-xs px-1 py-0 dark:bg-green-900 dark:text-green-100">Up to 5 Accounts</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-white mb-0.5 text-xs">Premium Features</h3>
                  <ul className="space-y-0.5 text-xs">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">SafeSphere protection</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">SuperSafe mode</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">Daswos AI search</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">AutoShop integration</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-white mb-0.5 text-xs">Account Benefits</h3>
                  <ul className="space-y-0.5 text-xs">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">Family account support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">Control umbrella accounts</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 flex-shrink-0" />
                      <span className="dark:text-white">Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-1.5 bg-blue-50 dark:bg-blue-900 rounded-md text-xs">
                <div className="flex items-start">
                  <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400 mr-1 mt-0.5" />
                  <p className="text-blue-700 dark:text-blue-200 text-xs">
                    Advanced protection features, AI capabilities, and access to exclusive verified sellers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={user && hasSubscription ? handleSwitchPlan : handleSelectPlan}
              className="px-8 py-2 font-medium bg-primary-600 hover:bg-primary-700 shadow-sm transition-all hover:shadow-md text-black dark:text-white"
              variant="default"
            >
              {user && hasSubscription
                ? 'Switch to Unlimited Plan'
                : user
                  ? 'Continue to Payment'
                  : 'Subscribe to Unlimited'
              }
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      {/* Plan Change Confirmation Dialog */}
      <Dialog open={showPlanChangeConfirmation} onOpenChange={setShowPlanChangeConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Daswos Unlimited Subscription</DialogTitle>
            <DialogDescription>
              You are subscribing to the Daswos Unlimited plan.
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
                   subscriptionDetails?.type === 'unlimited' ?
                     (subscriptionDetails?.billingCycle === 'annual' ? '£50/year' : '£5/month') :
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
                  Daswos Unlimited Plan
                </div>

                <div>Price:</div>
                <div className="font-medium">
                  £{billingCycle === 'monthly' ? '5/month' : '50/year'}
                </div>

                <div>Features:</div>
                <div className="font-medium">
                  All premium features including Daswos AI
                </div>
              </div>
            </div>

            <Alert className="mt-4 bg-blue-50 border-blue-100 text-blue-700">
              <AlertTitle className="text-blue-800">Billing Information</AlertTitle>
              <AlertDescription className="text-blue-700">
                {subscriptionDetails?.expiresAt ? (
                  <>
                    Your new Unlimited plan rate of £{billingCycle === 'monthly' ? '5' : '50'}
                    {billingCycle === 'monthly' ? ' per month' : ' per year'} will take effect on your next billing date:
                    {' '}{new Date(subscriptionDetails.expiresAt).toLocaleDateString()}.
                    You will not be charged again until that date.
                  </>
                ) : (
                  <>
                    Your Unlimited plan subscription of £{billingCycle === 'monthly' ? '5' : '50'}
                    {billingCycle === 'monthly' ? ' per month' : ' per year'} will begin immediately.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanChangeConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={completeSubscriptionSwitch} className="bg-primary-600 hover:bg-primary-700 text-black dark:text-white">
              Confirm Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SafeSphereSubscription;