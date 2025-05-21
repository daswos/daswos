import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, ExternalLink, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const SellerOnboardingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if we need to refresh the account link
  const searchParams = new URLSearchParams(window.location.search);
  const needsRefresh = searchParams.get('refresh') === 'true';

  // Get the seller account status
  const {
    data: accountStatus,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/stripe-connect/account-status'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      
      try {
        return await apiRequest('/api/stripe-connect/account-status', {
          method: 'GET',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error fetching account status:', error);
        return null;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: accountStatus?.isFullyOnboarded ? false : 10000, // Poll every 10 seconds until onboarded
  });

  // Create account link mutation
  const createAccountLinkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/stripe-connect/create-account-link', {
        method: 'POST',
        credentials: 'include'
      });
    },
    onSuccess: (data) => {
      if (data.url) {
        setIsRedirecting(true);
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating account link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create Stripe Connect account link. Please try again.',
        variant: 'destructive'
      });
      setIsRedirecting(false);
    }
  });

  // Create login link mutation
  const createLoginLinkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/stripe-connect/login-link', {
        method: 'GET',
        credentials: 'include'
      });
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Error creating login link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create Stripe dashboard login link. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Handle onboarding button click
  const handleOnboarding = () => {
    createAccountLinkMutation.mutate();
  };

  // Handle dashboard button click
  const handleDashboard = () => {
    createLoginLinkMutation.mutate();
  };

  // Auto-refresh if needed
  useEffect(() => {
    if (needsRefresh && !isRedirecting) {
      handleOnboarding();
    }
  }, [needsRefresh]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Seller Onboarding</CardTitle>
            <CardDescription>
              You need to be logged in to become a seller on DasWos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in or create an account to continue with seller onboarding.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth?redirect=/seller-onboarding')}>
              Log In or Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Seller Onboarding</CardTitle>
            <CardDescription>
              Checking your seller account status...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Seller Onboarding</CardTitle>
            <CardDescription>
              There was an error checking your seller account status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                We couldn't retrieve your seller account information. Please try again later.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If the account is fully onboarded
  if (accountStatus?.isFullyOnboarded) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">Seller Account Active</CardTitle>
            <CardDescription className="text-center">
              Your Stripe Connect account is fully set up and ready to receive payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Account Verified</AlertTitle>
              <AlertDescription>
                You can now sell products on DasWos and receive payments directly to your bank account.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Go to your seller dashboard to manage your products</li>
                <li>Set up your store profile and customize your storefront</li>
                <li>Add products to start selling</li>
                <li>Access your Stripe dashboard to manage payouts and financial details</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleDashboard}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => navigate('/seller/dashboard')}
            >
              Go to Seller Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If the account exists but is not fully onboarded
  if (accountStatus?.hasAccount) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Seller Account</CardTitle>
            <CardDescription>
              Your Stripe Connect account has been created, but you need to complete the onboarding process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Onboarding Incomplete</AlertTitle>
              <AlertDescription>
                Please complete the Stripe onboarding process to start receiving payments as a seller.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Account Status</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className={`h-4 w-4 rounded-full mr-2 ${accountStatus.accountStatus.detailsSubmitted ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  <span>Details Submitted: {accountStatus.accountStatus.detailsSubmitted ? 'Yes' : 'No'}</span>
                </li>
                <li className="flex items-center">
                  <span className={`h-4 w-4 rounded-full mr-2 ${accountStatus.accountStatus.chargesEnabled ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  <span>Charges Enabled: {accountStatus.accountStatus.chargesEnabled ? 'Yes' : 'No'}</span>
                </li>
                <li className="flex items-center">
                  <span className={`h-4 w-4 rounded-full mr-2 ${accountStatus.accountStatus.payoutsEnabled ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  <span>Payouts Enabled: {accountStatus.accountStatus.payoutsEnabled ? 'Yes' : 'No'}</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handleOnboarding}
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default case: No account yet
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Become a Seller on DasWos</CardTitle>
          <CardDescription>
            Set up your Stripe Connect account to start selling products and receiving payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Benefits of Selling on DasWos</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Reach millions of potential customers</li>
              <li>Secure payments directly to your bank account</li>
              <li>Easy-to-use seller dashboard</li>
              <li>Powerful analytics and reporting tools</li>
              <li>Low platform fees (only 10% per sale)</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium mb-2 text-blue-800">What You'll Need</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
              <li>Basic personal information</li>
              <li>Your bank account details for receiving payments</li>
              <li>A government-issued ID for verification</li>
              <li>Tax information for reporting purposes</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleOnboarding}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                Set Up Seller Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SellerOnboardingPage;
