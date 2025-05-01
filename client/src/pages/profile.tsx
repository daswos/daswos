import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { FixedSelect } from "@/components/ui/fixed-select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate, addMonths } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Check, AlertCircle, UserPlus, User, Shield, ShieldAlert, Users, UserX, Baby, RefreshCw, Key, LogOut as LogOutIcon } from "lucide-react";

export default function ProfilePage() {
  const [planType, setPlanType] = useState<"limited" | "unlimited">("limited");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [action, setAction] = useState<"subscribe" | "switch" | "cancel" | undefined>(undefined);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [newFamilyMemberEmail, setNewFamilyMemberEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [showCreateChildDialog, setShowCreateChildDialog] = useState(false);
  const [showChildPasswordDialog, setShowChildPasswordDialog] = useState(false);
  const [childAccountInfo, setChildAccountInfo] = useState<{username: string, password: string} | null>(null);
  const [showManageChildId, setShowManageChildId] = useState<number | null>(null);
  const [superSafeEnabled, setSuperSafeEnabled] = useState(false);
  const [superSafeSettings, setSuperSafeSettings] = useState({
    blockGambling: true,
    blockAdultContent: true,
    blockOpenSphere: false
  });

  const { user, hasSubscription, subscriptionDetails, subscriptionMutation, isCheckingSubscription, isLoading: isAuthLoading } = useAuth();
  const { settings } = useAdminSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();

  // Additional direct API call to fetch user data
  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user, // Only run if we have a user from auth context
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 seconds
  });

  // Use either the user from auth context or the directly fetched user data
  const displayUser = userData || user;
  const isLoading = isAuthLoading || isUserDataLoading;

  // Fetch SuperSafe status
  const { data: superSafeStatus, isLoading: isLoadingSuperSafe } = useQuery({
    queryKey: ['/api/user/supersafe'],
    enabled: !!user
  });

  // Effect to update local state when SuperSafe status is fetched
  useEffect(() => {
    if (superSafeStatus && typeof superSafeStatus === 'object') {
      const status = superSafeStatus as { enabled: boolean, settings?: any };
      setSuperSafeEnabled(status.enabled);
      if (status.settings) {
        setSuperSafeSettings(status.settings);
      }
    }
  }, [superSafeStatus]);

  // Check for setup_payment parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const setupPayment = urlParams.get('setup_payment');

    if (setupPayment === 'true' && subscriptionDetails?.type === 'unlimited') {
      // Show payment setup dialog or scroll to payment section
      setShowPaymentSetup(true);
      setPlanType('unlimited');

      // Show a toast notification
      toast({
        title: "Payment Setup Required",
        description: "Please complete your payment setup for Daswos Unlimited",
        variant: "default",
      });

      // Scroll to subscription section
      const subscriptionSection = document.getElementById('subscription-section');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Clean up the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [subscriptionDetails, toast]);

  // Fetch family members if the user is a family owner
  const { data: familyMembers = [], isLoading: isLoadingFamilyMembers, refetch: refetchFamilyMembers } = useQuery<any[]>({
    queryKey: ['/api/family/members'],
    enabled: !!user && !!subscriptionDetails?.type && (subscriptionDetails.type === 'family' || subscriptionDetails.type === 'unlimited'),
    refetchOnWindowFocus: true,
    refetchInterval: 10000 // Refetch every 10 seconds for testing
  });

  // Also refetch when subscription details change
  useEffect(() => {
    if (subscriptionDetails?.type === 'family' || subscriptionDetails?.type === 'unlimited') {
      console.log('Subscription details changed to family or unlimited type, refetching family members');
      refetchFamilyMembers();
    }
  }, [subscriptionDetails, refetchFamilyMembers]);

  useEffect(() => {
    // Set the selected plan to match the user's current subscription
    if (subscriptionDetails?.type) {
      console.log("Setting plan type from subscription details:", subscriptionDetails.type);
      setPlanType(subscriptionDetails.type as "limited" | "unlimited" | "individual" | "family");
    }

    // Also set the billing cycle if available
    if (subscriptionDetails?.billingCycle) {
      console.log("Setting billing cycle from subscription details:", subscriptionDetails.billingCycle);
      setBillingCycle(subscriptionDetails.billingCycle as "monthly" | "annual");
    }
  }, [subscriptionDetails]);

  // Update the plan type dropdown options when billing cycle changes
  useEffect(() => {
    // This will force a re-render of the dropdown options with the updated price
    const currentPlanType = planType;
    setPlanType(currentPlanType);
  }, [billingCycle]);

  const handleSubscriptionAction = (action: "subscribe" | "switch" | "cancel") => {
    console.log(`Subscription action triggered: ${action}, planType: ${planType}, billingCycle: ${billingCycle}`);

    if (action === "cancel") {
      setShowConfirmCancel(true);
      return;
    }

    if (action === "switch") {
      // Check if they're actually changing something
      if (subscriptionDetails?.type === planType &&
          (billingCycle === "monthly" && subscriptionDetails?.expiresAt)) {
        toast({
          title: "No changes made",
          description: "You're already on this plan",
          variant: "default"
        });
        return;
      }

      setShowConfirmUpdate(true);
      return;
    }

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your subscription",
        variant: "destructive"
      });
      return;
    }

    // Check if admin settings might be preventing subscription
    if (settings.paidFeaturesDisabled) {
      toast({
        title: "Premium Features Disabled",
        description: "The administrator has currently disabled all premium features. Please contact the administrator.",
        variant: "destructive"
      });
      return;
    }

    if (settings.subscriptionDevMode) {
      toast({
        title: "Subscription Development Mode",
        description: "Subscriptions are currently in development mode. All premium features are available without requiring a subscription.",
        variant: "destructive"
      });
      return;
    }

    // Validate that we have a valid plan type selected
    if (!planType || (planType !== "limited" && planType !== "unlimited")) {
      console.error(`Invalid plan type selected: ${planType}`);
      toast({
        title: "Invalid Plan",
        description: "Please select a valid subscription plan",
        variant: "destructive"
      });
      return;
    }

    setAction(action);
    console.log(`Submitting subscription mutation: type=${planType}, billingCycle=${billingCycle}, action=${action}`);

    subscriptionMutation.mutate({
      type: planType,
      billingCycle,
      action
    }, {
      onSuccess: (data) => {
        console.log("Subscription mutation successful:", data);

        // Refresh the subscription data
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });

        // Force update the UI to reflect the new plan type
        if (data && data.type) {
          setPlanType(data.type as "limited" | "unlimited");
        }

        toast({
          title: action === "subscribe" ? "Subscription Updated" : "Subscription Changed",
          description: action === "subscribe"
            ? "Your subscription has been activated"
            : "Your subscription plan has been changed",
          variant: "default"
        });

        // Close any open dialogs
        setShowConfirmUpdate(false);
      },
      onError: (error) => {
        console.error("Subscription mutation error:", error);
        toast({
          title: "Subscription Error",
          description: error.message || "An error occurred while processing your subscription",
          variant: "destructive"
        });
      }
    });
  };

  const confirmUpdateSubscription = () => {
    setShowConfirmUpdate(false);
    subscriptionMutation.mutate({
      type: planType,
      billingCycle,
      action: "switch"
    }, {
      onSuccess: (data) => {
        console.log("Subscription update successful:", data);

        // Refresh the subscription data
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });

        // Force update the UI to reflect the new plan type
        if (data && data.type) {
          setPlanType(data.type as "limited" | "unlimited");
        }

        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated successfully",
          variant: "default"
        });
      },
      onError: (error) => {
        console.error("Subscription update error:", error);
        toast({
          title: "Failed to Update Subscription",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
      }
    });
  };

  const confirmCancelSubscription = () => {
    subscriptionMutation.mutate({
      type: planType,
      billingCycle,
      action: "cancel"
    }, {
      onSuccess: () => {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully",
          variant: "default"
        });
        setShowConfirmCancel(false);
      },
      onError: (error) => {
        toast({
          title: "Cancellation Error",
          description: error.message || "An error occurred while cancelling your subscription",
          variant: "destructive"
        });
      }
    });
  };

  // Special function to handle Unlimited subscription directly
  const subscribeToUnlimited = () => {
    console.log("Executing direct subscription to Unlimited plan");

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe",
        variant: "destructive"
      });
      return;
    }

    // Check if admin settings might be preventing subscription
    if (settings.paidFeaturesDisabled) {
      toast({
        title: "Premium Features Disabled",
        description: "The administrator has currently disabled all premium features. Please contact the administrator.",
        variant: "destructive"
      });
      return;
    }

    if (settings.subscriptionDevMode) {
      toast({
        title: "Subscription Development Mode",
        description: "Subscriptions are currently in development mode. All premium features are available without requiring a subscription.",
        variant: "destructive"
      });
      return;
    }

    // Show a loading toast
    toast({
      title: "Processing",
      description: "Setting up your Unlimited subscription...",
      variant: "default"
    });

    console.log("Sending subscription request with:", {
      type: "unlimited",
      billingCycle: billingCycle,
      action: "subscribe"
    });

    // Direct API call to subscribe to Unlimited plan
    fetch('/api/user/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: "unlimited",
        billingCycle: billingCycle,
        action: "subscribe"
      })
    })
    .then(response => {
      console.log("Subscription response status:", response.status);
      if (!response.ok) {
        return response.text().then(text => {
          console.error("Error response body:", text);
          throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Unlimited subscription successful:", data);

      // Refresh the subscription data
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      // Force update the UI to reflect the new plan type
      setPlanType("unlimited");

      // Force a refresh to ensure the UI updates
      setTimeout(() => {
        // This will trigger a re-render with the latest subscription data
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      }, 500);

      toast({
        title: "Subscription Activated",
        description: "Your Daswos Unlimited plan has been activated successfully!",
        variant: "default"
      });
    })
    .catch(error => {
      console.error("Error subscribing to Unlimited plan:", error);
      toast({
        title: "Subscription Failed",
        description: "There was an error activating your Unlimited subscription. Please try again or contact support.",
        variant: "destructive"
      });
    });
  };

  // SuperSafe Toggle mutations
  const updateSuperSafeMutation = useMutation({
    mutationFn: async (data: { enabled: boolean, settings?: any }) => {
      return apiRequest('PUT', '/api/user/supersafe', data);
    },
    onSuccess: () => {
      toast({
        title: "SuperSafe Updated",
        description: superSafeEnabled ? "SuperSafe mode has been enabled" : "SuperSafe mode has been disabled",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/supersafe'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update SuperSafe settings",
        variant: "destructive"
      });
    }
  });

  // Handle SuperSafe toggle
  const toggleSuperSafe = (enabled: boolean) => {
    setSuperSafeEnabled(enabled);
    updateSuperSafeMutation.mutate({
      enabled,
      settings: superSafeSettings
    });
  };

  // Handle SuperSafe settings change
  const updateSuperSafeSettings = (setting: string, value: boolean) => {
    const newSettings = {
      ...superSafeSettings,
      [setting]: value
    };
    setSuperSafeSettings(newSettings);

    // Only update if SuperSafe is enabled
    if (superSafeEnabled) {
      updateSuperSafeMutation.mutate({
        enabled: superSafeEnabled,
        settings: newSettings
      });
    }
  };

  // Family member mutations
  const addFamilyMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/family/members', { email });
    },
    onSuccess: () => {
      toast({
        title: "Family Member Added",
        description: "The user has been added to your family account",
        variant: "default"
      });
      setNewFamilyMemberEmail("");
      refetchFamilyMembers();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Family Member",
        description: error.message || "Unable to add family member",
        variant: "destructive"
      });
    }
  });

  // Remove family member
  const removeFamilyMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiRequest('DELETE', `/api/family/members/${memberId}`);
    },
    onSuccess: () => {
      toast({
        title: "Family Member Removed",
        description: "The user has been removed from your family account",
        variant: "default"
      });
      refetchFamilyMembers();
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Family Member",
        description: error.message || "Unable to remove family member",
        variant: "destructive"
      });
    }
  });

  // Update family member's SuperSafe settings
  const updateFamilyMemberSuperSafeMutation = useMutation({
    mutationFn: async ({ memberId, enabled, settings }: { memberId: number, enabled: boolean, settings?: any }) => {
      return apiRequest('PUT', `/api/family/members/${memberId}/supersafe`, { enabled, settings });
    },
    onSuccess: () => {
      toast({
        title: "Family Member Settings Updated",
        description: "SuperSafe settings have been updated for this family member",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update family member's SuperSafe settings",
        variant: "destructive"
      });
    }
  });

  // Create child account mutation
  const createChildAccountMutation = useMutation({
    mutationFn: async (childName: string) => {
      const response = await apiRequest('POST', '/api/family/children', { childName });
      return response.json();
    },
    onSuccess: (data: any) => {
      console.log("Child account created successfully:", data);

      toast({
        title: "Child Account Created",
        description: "A new child account has been created successfully",
        variant: "default"
      });

      setChildName("");
      setShowCreateChildDialog(false);

      // Make sure we have the account information
      if (data && data.account && data.account.username && data.account.password) {
        setChildAccountInfo(data.account);
        setShowChildPasswordDialog(true);
      } else {
        console.error("Missing child account credentials in response:", data);
        toast({
          title: "Warning",
          description: "Child account created but credential information was not returned",
          variant: "destructive"
        });
      }

      // Refresh the family members list
      refetchFamilyMembers();
    },
    onError: (error) => {
      console.error("Failed to create child account:", error);
      toast({
        title: "Failed to Create Child Account",
        description: error.message || "Unable to create child account",
        variant: "destructive"
      });
    }
  });

  // Update child account password mutation
  const updateChildPasswordMutation = useMutation({
    mutationFn: async ({ childId, newPassword }: { childId: number, newPassword: string }) => {
      const response = await apiRequest('PUT', `/api/family/children/${childId}/password`, { newPassword });
      return response.json();
    },
    onSuccess: (data: { message?: string, success?: boolean }) => {
      toast({
        title: "Password Updated",
        description: data?.message || "The child account password has been updated successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Password",
        description: error.message || "Unable to update child account password",
        variant: "destructive"
      });
    }
  });

  // Update child account username mutation
  const updateChildUsernameMutation = useMutation({
    mutationFn: async ({ childId, newUsername }: { childId: number, newUsername: string }) => {
      const response = await apiRequest('PUT', `/api/family/children/${childId}/username`, { newUsername });
      return await response.json(); // Parse the JSON response
    },
    onSuccess: (data: { message?: string, success?: boolean }) => {
      toast({
        title: "Username Updated",
        description: data?.message || "The child account username has been updated",
        variant: "default"
      });

      // Refetch family members to get updated data (when backend implementation is complete)
      if (data?.success) {
        refetchFamilyMembers();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Username",
        description: error.message || "Unable to update child account username",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <p>Loading profile information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to view your profile</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Diagnostic output for testing
  const diagnosticData = {
    user: user ? { id: user.id, username: user.username } : null,
    displayUser: displayUser ? { id: displayUser.id, username: displayUser.username, email: displayUser.email } : null,
    userData: userData ? { id: userData.id, username: userData.username, email: userData.email } : null,
    hasSubscription: hasSubscription,
    subscriptionDetails: subscriptionDetails,
    isLoading: isLoading,
    isAuthLoading: isAuthLoading,
    isUserDataLoading: isUserDataLoading,
    isCheckingSubscription: isCheckingSubscription
  };

  // Log user data for debugging
  console.log("User data in profile page:", { user, userData, displayUser });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Information */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <p>Loading user information...</p>
              </div>
            ) : displayUser ? (
              <div className="space-y-4">
                <div>
                  <strong className="text-sm text-muted-foreground">Username:</strong>
                  <p>{displayUser.username || 'Not available'}</p>
                </div>
                <div>
                  <strong className="text-sm text-muted-foreground">Email:</strong>
                  <p>{displayUser.email || 'Not available'}</p>
                </div>
                <div>
                  <strong className="text-sm text-muted-foreground">Full Name:</strong>
                  <p>{displayUser.fullName || 'Not available'}</p>
                </div>
                <div>
                  <strong className="text-sm text-muted-foreground">Account Type:</strong>
                  <p>
                    {displayUser.isSeller
                      ? "Seller"
                      : subscriptionDetails?.type
                        ? subscriptionDetails.type === 'limited'
                          ? "Daswos Limited"
                          : subscriptionDetails.type === 'unlimited'
                            ? "Daswos Unlimited"
                            : subscriptionDetails.type === 'individual'
                              ? "Individual (Legacy)"
                              : subscriptionDetails.type === 'family'
                                ? "Family (Legacy)"
                                : `${subscriptionDetails.type.charAt(0).toUpperCase() + subscriptionDetails.type.slice(1)}`
                        : "Limited"}
                  </p>
                </div>
                {hasSubscription && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active Subscription
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p>User information not available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className="col-span-1 md:col-span-2" id="subscription-section">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Subscription</CardTitle>
              {hasSubscription && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              )}
            </div>
            <CardDescription>
              {hasSubscription
                ? "Manage your Daswos subscription"
                : "Subscribe to Daswos for added security"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.subscriptionDevMode && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Subscription Development Mode</AlertTitle>
                <AlertDescription>
                  Subscriptions are currently in development mode. All premium features are available to all users without requiring a subscription.
                </AlertDescription>
              </Alert>
            )}

            {showPaymentSetup && (
              <Alert className="mb-4 border-amber-500">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Payment Setup Required</AlertTitle>
                <AlertDescription>
                  Your Daswos Unlimited subscription has been activated. Please complete your payment setup below to continue using premium features.
                </AlertDescription>
              </Alert>
            )}

            {isCheckingSubscription || isLoading ? (
              <div className="text-center py-4">
                <p>Loading subscription details...</p>
              </div>
            ) : !displayUser ? (
              <div className="text-center py-4">
                <p>User information not available</p>
              </div>
            ) : hasSubscription ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <strong className="text-sm text-muted-foreground">Current Plan:</strong>
                    <p className="capitalize">
                      {subscriptionDetails?.type === 'limited' ? 'Daswos Limited' :
                       subscriptionDetails?.type === 'unlimited' ? 'Daswos Unlimited' :
                       subscriptionDetails?.type === 'individual' ? 'Individual (Legacy)' :
                       subscriptionDetails?.type === 'family' ? 'Family (Legacy)' :
                       subscriptionDetails?.type || "Daswos Limited"} Plan
                    </p>
                  </div>
                  {subscriptionDetails?.expiresAt && (
                    <div>
                      <strong className="text-sm text-muted-foreground">Next Billing Date:</strong>
                      <p>{formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Change Plan</h3>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Billing Cycle</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Button
                        variant={billingCycle === "monthly" ? "default" : "outline"}
                        onClick={() => setBillingCycle("monthly")}
                        className="w-full"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={billingCycle === "annual" ? "default" : "outline"}
                        onClick={() => setBillingCycle("annual")}
                        className="w-full"
                      >
                        Annual (Save 15%)
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant={subscriptionDetails?.type === "limited" ? "default" : "outline"}
                      disabled={subscriptionMutation.isPending}
                      onClick={() => {
                        setPlanType("limited");
                        // Use the confirm update function directly to ensure proper state updates
                        setShowConfirmUpdate(true);
                      }}
                      className="h-auto py-4"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium">Daswos Limited</span>
                        <span className="text-sm text-muted-foreground">Free</span>
                      </div>
                    </Button>
                    <Button
                      variant={subscriptionDetails?.type === "unlimited" ? "default" : "outline"}
                      disabled={subscriptionMutation.isPending}
                      onClick={() => {
                        setPlanType("unlimited");
                        // Use the confirm update function directly to ensure proper state updates
                        setShowConfirmUpdate(true);
                      }}
                      className="h-auto py-4"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium">Daswos Unlimited</span>
                        <span className="text-sm">{billingCycle === "monthly" ? "£5/month" : "£51/year (Save 15%)"}</span>
                      </div>
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    disabled={subscriptionMutation.isPending}
                    onClick={() => handleSubscriptionAction("cancel")}
                    className="w-full"
                  >
                    {subscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mb-4">
                  <p>You don't have an active subscription. Subscribe to Daswos to access premium security features.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Billing Cycle</label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Button
                        variant={billingCycle === "monthly" ? "default" : "outline"}
                        onClick={() => setBillingCycle("monthly")}
                        className="w-full"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={billingCycle === "annual" ? "default" : "outline"}
                        onClick={() => setBillingCycle("annual")}
                        className="w-full"
                      >
                        Annual (Save 15%)
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant={planType === "limited" ? "default" : "outline"}
                      disabled={subscriptionMutation.isPending}
                      onClick={() => {
                        setPlanType("limited");
                        handleSubscriptionAction("subscribe");
                      }}
                      className="h-auto py-4"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium">Daswos Limited</span>
                        <span className="text-sm text-muted-foreground">Free</span>
                      </div>
                    </Button>
                    <Button
                      variant={planType === "unlimited" ? "default" : "outline"}
                      disabled={subscriptionMutation.isPending}
                      onClick={() => {
                        console.log("Unlimited subscription button clicked");
                        setPlanType("unlimited");
                        subscribeToUnlimited();
                      }}
                      className="h-auto py-4"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium">Daswos Unlimited</span>
                        <span className="text-sm">{billingCycle === "monthly" ? "£5/month" : "£51/year (Save 15%)"}</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic data for admin user only */}
            {((process.env.NODE_ENV === 'development' || settings.debugMode) && displayUser?.username === 'admin') && (
              <div className="mt-8 p-4 border border-dashed rounded-md">
                <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
                <div className="text-xs space-y-2">
                  <div>
                    <strong>Current Plan Type:</strong> {planType}
                  </div>
                  <div>
                    <strong>Billing Cycle:</strong> {billingCycle}
                  </div>
                  <div>
                    <strong>Has Subscription:</strong> {hasSubscription ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Admin Settings:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Paid Features Disabled: {settings.paidFeaturesDisabled ? 'Yes' : 'No'}</li>
                      <li>Subscription Dev Mode: {settings.subscriptionDevMode ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Subscription Details:</strong>
                    <pre className="overflow-auto mt-1">
                      {JSON.stringify(subscriptionDetails, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong>All Diagnostic Data:</strong>
                    <pre className="overflow-auto mt-1">
                      {JSON.stringify(diagnosticData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Admin logout button */}
            {displayUser?.username === 'admin' && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () => {
                    try {
                      // Call the server-side admin logout endpoint
                      const response = await fetch("/api/admin/logout", {
                        method: "POST",
                        credentials: "include" // Important: include cookies
                      });

                      if (!response.ok) {
                        throw new Error("Logout failed");
                      }

                      // Clear client-side admin session
                      sessionStorage.removeItem("adminAuthenticated");
                      sessionStorage.removeItem("adminUser");

                      // Clear any regular user session cookies
                      document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                      // Force a complete page reload to clear any in-memory state
                      window.location.href = "/admin-login";
                    } catch (error) {
                      console.error("Error logging out:", error);
                      // Still try to redirect even if the server call fails
                      window.location.href = "/admin-login";
                    }
                  }}
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Admin Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SuperSafe Mode & Family Management Section */}
      {hasSubscription && !settings.subscriptionDevMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* SuperSafe Mode */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  SuperSafe Mode
                </CardTitle>
                {superSafeEnabled && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Enabled
                  </Badge>
                )}
              </div>
              <CardDescription>
                Control content restrictions and SafeSphere settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="super-safe-toggle">SuperSafe Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable content restrictions and safety features
                    </p>
                  </div>
                  <Switch
                    id="super-safe-toggle"
                    checked={superSafeEnabled}
                    disabled={updateSuperSafeMutation.isPending}
                    onCheckedChange={toggleSuperSafe}
                  />
                </div>

                {superSafeEnabled && (
                  <div className="space-y-4 pt-2">
                    <h3 className="font-medium text-sm">SuperSafe Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="block-gambling"
                            className="font-normal text-sm"
                          >
                            Block Gambling Content
                          </Label>
                        </div>
                        <Switch
                          id="block-gambling"
                          checked={superSafeSettings.blockGambling}
                          onCheckedChange={(checked) => updateSuperSafeSettings('blockGambling', checked)}
                          disabled={updateSuperSafeMutation.isPending}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="block-adult"
                            className="font-normal text-sm"
                          >
                            Block Adult Content
                          </Label>
                        </div>
                        <Switch
                          id="block-adult"
                          checked={superSafeSettings.blockAdultContent}
                          onCheckedChange={(checked) => updateSuperSafeSettings('blockAdultContent', checked)}
                          disabled={updateSuperSafeMutation.isPending}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor="block-opensphere"
                            className="font-normal text-sm"
                          >
                            Block OpenSphere Shopping
                          </Label>
                          <p className="text-xs text-muted-foreground">Restrict to SafeSphere vendors only</p>
                        </div>
                        <Switch
                          id="block-opensphere"
                          checked={superSafeSettings.blockOpenSphere}
                          onCheckedChange={(checked) => updateSuperSafeSettings('blockOpenSphere', checked)}
                          disabled={updateSuperSafeMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Family Management */}
          {(subscriptionDetails?.type === 'family' || subscriptionDetails?.type === 'unlimited') && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Family Management
                  </CardTitle>
                </div>
                <CardDescription>
                  Manage family members and their settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFamilyMembers ? (
                  <div className="text-center py-4">
                    <p>Loading family members...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-medium">Family Members</h3>
                      {familyMembers && familyMembers.length > 0 ? (
                        <div className="space-y-4">
                          {familyMembers
                            .filter((member: any) => !member.isChildAccount) // Only show non-child accounts here
                            .map((member: any) => (
                              <div key={member.id} className="flex items-center justify-between border-b pb-3">
                                <div>
                                  <p className="font-medium">{member.fullName || member.username}</p>
                                  <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => removeFamilyMemberMutation.mutate(member.id)}
                                  disabled={removeFamilyMemberMutation.isPending}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No family members added yet</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Add Family Member</h3>
                      <p className="text-sm text-muted-foreground">You can add up to 4 family members to your account</p>
                      <div className="flex items-start gap-2 pt-1">
                        <div className="flex-grow">
                          <Input
                            placeholder="Enter email address"
                            value={newFamilyMemberEmail}
                            onChange={(e) => setNewFamilyMemberEmail(e.target.value)}
                            disabled={addFamilyMemberMutation.isPending || (familyMembers && familyMembers.length >= 4)}
                          />
                        </div>
                        <Button
                          variant="default"
                          className="h-8 px-3 text-xs"
                          onClick={() => addFamilyMemberMutation.mutate(newFamilyMemberEmail)}
                          disabled={
                            addFamilyMemberMutation.isPending ||
                            !newFamilyMemberEmail ||
                            (familyMembers && familyMembers.length >= 4)
                          }
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Child Account Management */}
                    <div className="space-y-2 pt-6 border-t mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <Baby className="h-4 w-4 mr-2 text-primary" />
                            Child Accounts
                          </h3>
                          <p className="text-sm text-muted-foreground">Create supervised accounts for children</p>
                        </div>
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => setShowCreateChildDialog(true)}
                          disabled={
                            createChildAccountMutation.isPending ||
                            (familyMembers && familyMembers.length >= 4)
                          }
                        >
                          <Baby className="h-4 w-4 mr-2" />
                          Create Child Account
                        </Button>
                      </div>

                      {/* Display child accounts (filtered from family members) */}
                      {familyMembers && familyMembers.filter((member: any) => member.isChildAccount).length > 0 ? (
                        <div className="space-y-4 mt-3">
                          <h4 className="text-sm font-medium">Child Accounts</h4>
                          {familyMembers
                            .filter((member: any) => member.isChildAccount)
                            .map((childAccount: any) => (
                              <div key={childAccount.id} className="bg-muted/40 p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium flex items-center">
                                      <Baby className="h-4 w-4 mr-2 text-primary" />
                                      {childAccount.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Child Account</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Dialog
                                      open={showManageChildId === childAccount.id}
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setShowManageChildId(childAccount.id);
                                        } else {
                                          setShowManageChildId(null);
                                          // Clear temporary fields when dialog closes
                                          const updatedMembers = [...familyMembers];
                                          const index = updatedMembers.findIndex(m => m.id === childAccount.id);
                                          if (index !== -1) {
                                            updatedMembers[index] = {
                                              ...updatedMembers[index],
                                              newPassword: undefined,
                                              newUsername: undefined
                                            };
                                            // Update the query cache directly
                                            queryClient.setQueryData(['/api/family/members'], updatedMembers);
                                          }
                                        }
                                      }}
                                    >
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="default"
                                          className="h-8 px-3 text-xs"
                                        >
                                          Manage
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>Manage Child Account</DialogTitle>
                                          <DialogDescription>
                                            Manage settings for {childAccount.username}'s account
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-6 py-4">
                                          {/* Account Details */}
                                          <div className="space-y-4">
                                            <h3 className="text-sm font-medium">Account Details</h3>

                                            <div className="grid gap-2">
                                              <Label htmlFor="child-username">Username</Label>
                                              <Input
                                                id="child-username"
                                                placeholder="Username"
                                                type="text"
                                                value={childAccount.newUsername || childAccount.username}
                                                onChange={(e) => {
                                                  // Update the temporary state for this child's username
                                                  const updatedMembers = [...familyMembers];
                                                  const index = updatedMembers.findIndex(m => m.id === childAccount.id);
                                                  if (index !== -1) {
                                                    updatedMembers[index] = {
                                                      ...updatedMembers[index],
                                                      newUsername: e.target.value
                                                    };
                                                    // Update the query cache directly
                                                    queryClient.setQueryData(['/api/family/members'], updatedMembers);
                                                  }
                                                }}
                                              />
                                              <p className="text-xs text-muted-foreground">
                                                Username should be fun and memorable for your child.
                                              </p>
                                            </div>

                                            <div className="grid gap-2">
                                              <Label htmlFor="child-password">New Password</Label>
                                              <Input
                                                id="child-password"
                                                placeholder="Enter new password"
                                                type="text"
                                                value={childAccount.newPassword || ""}
                                                onChange={(e) => {
                                                  // Update the temporary state for this child's password
                                                  const updatedMembers = [...familyMembers];
                                                  const index = updatedMembers.findIndex(m => m.id === childAccount.id);
                                                  if (index !== -1) {
                                                    updatedMembers[index] = {
                                                      ...updatedMembers[index],
                                                      newPassword: e.target.value
                                                    };
                                                    // Update the query cache directly
                                                    queryClient.setQueryData(['/api/family/members'], updatedMembers);
                                                  }
                                                }}
                                              />
                                              <p className="text-xs text-muted-foreground">
                                                Leave blank to keep the current password.
                                              </p>
                                            </div>

                                            <Button
                                              className="w-full mt-2"
                                              onClick={() => {
                                                if (childAccount.newPassword && childAccount.newPassword.length >= 6) {
                                                  updateChildPasswordMutation.mutate({
                                                    childId: childAccount.id,
                                                    newPassword: childAccount.newPassword
                                                  });
                                                }

                                                // Update username if changed
                                                if (childAccount.newUsername && childAccount.newUsername !== childAccount.username) {
                                                  updateChildUsernameMutation.mutate({
                                                    childId: childAccount.id,
                                                    newUsername: childAccount.newUsername
                                                  });
                                                }
                                              }}
                                              disabled={(childAccount.newPassword && childAccount.newPassword.length < 6) ||
                                                       (!childAccount.newPassword && !childAccount.newUsername)}
                                            >
                                              Update Account Details
                                            </Button>
                                          </div>

                                          {/* SuperSafe Settings */}
                                          <div className="space-y-4 border-t pt-4">
                                            <div className="flex items-center justify-between">
                                              <h3 className="text-sm font-medium flex items-center">
                                                <ShieldAlert className="h-4 w-4 mr-1 text-primary" />
                                                SuperSafe Mode
                                              </h3>
                                              <Switch
                                                className="h-5 w-9"
                                                checked={childAccount.superSafeMode}
                                                onCheckedChange={(enabled) =>
                                                  updateFamilyMemberSuperSafeMutation.mutate({
                                                    memberId: childAccount.id,
                                                    enabled,
                                                    settings: childAccount.superSafeSettings || {
                                                      blockGambling: true,
                                                      blockAdultContent: true,
                                                      blockOpenSphere: true
                                                    }
                                                  })
                                                }
                                              />
                                            </div>

                                            {childAccount.superSafeMode && (
                                              <div className="space-y-3 ml-1">
                                                <div className="flex items-center justify-between">
                                                  <Label className="text-sm">Block Gambling Content</Label>
                                                  <Switch
                                                    className="h-4 w-8"
                                                    checked={childAccount.superSafeSettings?.blockGambling !== false}
                                                    onCheckedChange={(checked) => {
                                                      const currentSettings = childAccount.superSafeSettings || {
                                                        blockGambling: true,
                                                        blockAdultContent: true,
                                                        blockOpenSphere: true
                                                      };
                                                      updateFamilyMemberSuperSafeMutation.mutate({
                                                        memberId: childAccount.id,
                                                        enabled: childAccount.superSafeMode,
                                                        settings: {
                                                          ...currentSettings,
                                                          blockGambling: checked
                                                        }
                                                      });
                                                    }}
                                                  />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <Label className="text-sm">Block Adult Content</Label>
                                                  <Switch
                                                    className="h-4 w-8"
                                                    checked={childAccount.superSafeSettings?.blockAdultContent !== false}
                                                    onCheckedChange={(checked) => {
                                                      const currentSettings = childAccount.superSafeSettings || {
                                                        blockGambling: true,
                                                        blockAdultContent: true,
                                                        blockOpenSphere: true
                                                      };
                                                      updateFamilyMemberSuperSafeMutation.mutate({
                                                        memberId: childAccount.id,
                                                        enabled: childAccount.superSafeMode,
                                                        settings: {
                                                          ...currentSettings,
                                                          blockAdultContent: checked
                                                        }
                                                      });
                                                    }}
                                                  />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <Label className="text-sm">Block OpenSphere Shopping</Label>
                                                  <Switch
                                                    className="h-4 w-8"
                                                    checked={childAccount.superSafeSettings?.blockOpenSphere !== false}
                                                    onCheckedChange={(checked) => {
                                                      const currentSettings = childAccount.superSafeSettings || {
                                                        blockGambling: true,
                                                        blockAdultContent: true,
                                                        blockOpenSphere: true
                                                      };
                                                      updateFamilyMemberSuperSafeMutation.mutate({
                                                        memberId: childAccount.id,
                                                        enabled: childAccount.superSafeMode,
                                                        settings: {
                                                          ...currentSettings,
                                                          blockOpenSphere: checked
                                                        }
                                                      });
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <DialogFooter className="flex justify-between items-center gap-2">
                                          <Button
                                            variant="destructive"
                                            className="h-8 px-3 text-xs"
                                            onClick={() => removeFamilyMemberMutation.mutate(childAccount.id)}
                                            disabled={removeFamilyMemberMutation.isPending}
                                          >
                                            Remove Account
                                          </Button>
                                          <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                              // Close the dialog by setting the id to null
                                              setShowManageChildId(null);
                                            }}
                                          >
                                            Close
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <Button
                                      variant="ghost"
                                      className="h-8 px-3 text-xs"
                                      onClick={() => removeFamilyMemberMutation.mutate(childAccount.id)}
                                      disabled={removeFamilyMemberMutation.isPending}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>

                                {/* SuperSafe Settings */}
                                <div className="mt-3 pt-3 border-t border-border/40">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium flex items-center">
                                      <ShieldAlert className="h-3.5 w-3.5 mr-1 text-primary" />
                                      SuperSafe Mode
                                    </p>
                                    <Switch
                                      className="h-5 w-9"
                                      checked={childAccount.superSafeMode}
                                      onCheckedChange={(enabled) =>
                                        updateFamilyMemberSuperSafeMutation.mutate({
                                          memberId: childAccount.id,
                                          enabled,
                                          settings: childAccount.superSafeSettings || {
                                            blockGambling: true,
                                            blockAdultContent: true,
                                            blockOpenSphere: true
                                          }
                                        })
                                      }
                                    />
                                  </div>

                                  {childAccount.superSafeMode && (
                                    <div className="grid grid-cols-1 gap-2 pl-1 mt-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs">Block Gambling</Label>
                                        <Switch
                                          className="h-4 w-8"
                                          checked={childAccount.superSafeSettings?.blockGambling !== false}
                                          onCheckedChange={(checked) => {
                                            const currentSettings = childAccount.superSafeSettings || {
                                              blockGambling: true,
                                              blockAdultContent: true,
                                              blockOpenSphere: true
                                            };
                                            updateFamilyMemberSuperSafeMutation.mutate({
                                              memberId: childAccount.id,
                                              enabled: childAccount.superSafeMode,
                                              settings: {
                                                ...currentSettings,
                                                blockGambling: checked
                                              }
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs">Block Adult Content</Label>
                                        <Switch
                                          className="h-4 w-8"
                                          checked={childAccount.superSafeSettings?.blockAdultContent !== false}
                                          onCheckedChange={(checked) => {
                                            const currentSettings = childAccount.superSafeSettings || {
                                              blockGambling: true,
                                              blockAdultContent: true,
                                              blockOpenSphere: true
                                            };
                                            updateFamilyMemberSuperSafeMutation.mutate({
                                              memberId: childAccount.id,
                                              enabled: childAccount.superSafeMode,
                                              settings: {
                                                ...currentSettings,
                                                blockAdultContent: checked
                                              }
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs">Block OpenSphere</Label>
                                        <Switch
                                          className="h-4 w-8"
                                          checked={childAccount.superSafeSettings?.blockOpenSphere !== false}
                                          onCheckedChange={(checked) => {
                                            const currentSettings = childAccount.superSafeSettings || {
                                              blockGambling: true,
                                              blockAdultContent: true,
                                              blockOpenSphere: true
                                            };
                                            updateFamilyMemberSuperSafeMutation.mutate({
                                              memberId: childAccount.id,
                                              enabled: childAccount.superSafeMode,
                                              settings: {
                                                ...currentSettings,
                                                blockOpenSphere: checked
                                              }
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">No child accounts created yet</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to SafeSphere features at the end of your billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmCancel(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              disabled={subscriptionMutation.isPending}
              onClick={confirmCancelSubscription}
            >
              Yes, Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Child Account Creation Dialog */}
      <Dialog open={showCreateChildDialog} onOpenChange={setShowCreateChildDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Child Account</DialogTitle>
            <DialogDescription>
              Create a supervised account for a child with customized SuperSafe settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="child-name">Child's Name</Label>
              <Input
                id="child-name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter child's name"
              />
              <p className="text-xs text-muted-foreground">
                We'll create a fun username and secure password automatically
              </p>
            </div>

            <Alert variant="default" className="bg-primary/10 border-primary/20">
              <Baby className="h-4 w-4" />
              <AlertTitle>SuperSafe Settings</AlertTitle>
              <AlertDescription>
                Child accounts have SuperSafe mode enabled by default with the strongest protection settings.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateChildDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => createChildAccountMutation.mutate(childName)}
              disabled={!childName || createChildAccountMutation.isPending}
            >
              <Baby className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Child Account Password Dialog */}
      <Dialog open={showChildPasswordDialog} onOpenChange={setShowChildPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Child Account Created!</DialogTitle>
            <DialogDescription>
              We've created a child account with the following credentials:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {childAccountInfo && (
              <div className="bg-muted p-4 rounded-md space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Username:</p>
                  <p className="font-medium text-lg">{childAccountInfo.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Password:</p>
                  <p className="font-medium text-lg font-mono">{childAccountInfo.password}</p>
                </div>
              </div>
            )}

            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription className="text-amber-800">
                Please save this information now. You'll need these credentials for your child to log in.
                You can reset the password later if needed.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              onClick={() => {
                setShowChildPasswordDialog(false);
                setChildAccountInfo(null);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Update Confirmation Dialog */}
      <Dialog open={showConfirmUpdate} onOpenChange={setShowConfirmUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              You are changing your subscription plan details:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Current plan info */}
            <div className="bg-muted/30 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Current Plan:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Type:</div>
                <div className="font-medium capitalize">
                  {subscriptionDetails?.type === 'limited' ? 'Daswos Limited' :
                   subscriptionDetails?.type === 'unlimited' ? 'Daswos Unlimited' :
                   subscriptionDetails?.type === 'individual' ? 'Individual (Legacy)' :
                   subscriptionDetails?.type === 'family' ? 'Family (Legacy)' :
                   subscriptionDetails?.type || "Limited"} Plan
                </div>

                <div>Price:</div>
                <div className="font-medium">
                  {subscriptionDetails?.type === 'limited' ? 'Free' :
                   subscriptionDetails?.type === 'unlimited' ?
                     (subscriptionDetails?.billingCycle === 'annual' ? '£51/year (Save 15%)' : '£5/month') :
                   subscriptionDetails?.type === 'individual' ? '£5/month (Legacy)' :
                   subscriptionDetails?.type === 'family' ? '£5/month (Legacy)' : 'Free'}
                </div>

                {subscriptionDetails?.expiresAt && (
                  <>
                    <div>Next Billing:</div>
                    <div className="font-medium">
                      {formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')}
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
                  {planType === 'limited' ? 'Daswos Limited' :
                   planType === 'unlimited' ? 'Daswos Unlimited' :
                   planType === 'individual' ? 'Individual (Legacy)' :
                   planType === 'family' ? 'Family (Legacy)' : planType} Plan
                </div>

                <div>Price:</div>
                <div className="font-medium">
                  {planType === 'limited' ? 'Free' :
                   planType === 'unlimited' ?
                     (billingCycle === "annual" ? '£51/year (Save 15%)' : '£5/month') :
                   'Free'}
                </div>

                {subscriptionDetails?.expiresAt && (
                  <>
                    <div>Effective From:</div>
                    <div className="font-medium">
                      {formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')}
                    </div>
                  </>
                )}
              </div>
            </div>

            <Alert className="mt-4">
              <AlertTitle>Billing Information</AlertTitle>
              <AlertDescription>
                {planType === 'limited' ? (
                  <>
                    Your new free plan will take effect on your next billing date: {subscriptionDetails?.expiresAt
                      ? formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')
                      : "your next billing date"}.
                    You will not be charged again after that date.
                  </>
                ) : (
                  <>
                    Your new plan rate of {
                      planType === 'unlimited' ?
                        (billingCycle === "annual" ? '£51 per year' : '£5 per month') :
                      '£0'
                    } will take effect on your next billing date: {subscriptionDetails?.expiresAt
                      ? formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')
                      : "your next billing date"}.
                    {planType !== 'limited' && " You will not be charged again until that date."}
                  </>
                )}

                {/* Plan change descriptions */}
                {subscriptionDetails?.type === 'limited' && planType === 'unlimited' && (
                  <span className="block mt-2">
                    You'll be upgraded from Daswos Limited (Free) to Daswos Unlimited
                    ({billingCycle === "annual" ? "£51/year" : "£5/month"}).
                  </span>
                )}
                {subscriptionDetails?.type === 'unlimited' && planType === 'limited' && (
                  <span className="block mt-2">
                    You'll be downgraded from Daswos Unlimited
                    ({subscriptionDetails?.billingCycle === 'annual' ? "£51/year" : "£5/month"})
                    to Daswos Limited (Free).
                  </span>
                )}
                {(subscriptionDetails?.type === 'individual' || subscriptionDetails?.type === 'family') && planType === 'unlimited' && (
                  <span className="block mt-2">
                    You'll be migrated from your legacy plan to Daswos Unlimited
                    ({billingCycle === "annual" ? "£51/year" : "£5/month"}).
                  </span>
                )}
                {(subscriptionDetails?.type === 'individual' || subscriptionDetails?.type === 'family') && planType === 'limited' && (
                  <span className="block mt-2">
                    You'll be downgraded from your legacy plan to Daswos Limited (Free).
                  </span>
                )}

              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmUpdate(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={subscriptionMutation.isPending}
              onClick={confirmUpdateSubscription}
            >
              Confirm Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}