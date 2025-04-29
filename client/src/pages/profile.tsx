import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
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
import { X, Check, AlertCircle, UserPlus, User, Shield, ShieldAlert, Users, UserX, Baby, RefreshCw, Key } from "lucide-react";

export default function ProfilePage() {
  const [planType, setPlanType] = useState<"individual" | "family">("individual");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [action, setAction] = useState<"subscribe" | "switch" | "cancel" | undefined>(undefined);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
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
  
  const { user, hasSubscription, subscriptionDetails, subscriptionMutation, isCheckingSubscription } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  
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
  
  // Fetch family members if the user is a family owner
  const { data: familyMembers = [], isLoading: isLoadingFamilyMembers, refetch: refetchFamilyMembers } = useQuery<any[]>({
    queryKey: ['/api/family/members'],
    enabled: !!user && !!subscriptionDetails?.type && subscriptionDetails.type === 'family',
    refetchOnWindowFocus: true,
    refetchInterval: 10000 // Refetch every 10 seconds for testing
  });
  
  // Also refetch when subscription details change
  useEffect(() => {
    if (subscriptionDetails?.type === 'family') {
      console.log('Subscription details changed to family type, refetching family members');
      refetchFamilyMembers();
    }
  }, [subscriptionDetails, refetchFamilyMembers]);

  useEffect(() => {
    // Set the selected plan to match the user's current subscription
    if (subscriptionDetails?.type) {
      setPlanType(subscriptionDetails.type as "individual" | "family");
    }
  }, [subscriptionDetails]);

  const handleSubscriptionAction = (action: "subscribe" | "switch" | "cancel") => {
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

    setAction(action);
    
    subscriptionMutation.mutate({ 
      type: planType, 
      billingCycle, 
      action 
    }, {
      onSuccess: () => {
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
      onSuccess: () => {
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated successfully",
          variant: "default"
        });
      },
      onError: (error) => {
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

  if (!user) {
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
    hasSubscription: hasSubscription,
    subscriptionDetails: subscriptionDetails,
    isLoading: isCheckingSubscription
  };

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
            <div className="space-y-4">
              <div>
                <strong className="text-sm text-muted-foreground">Username:</strong>
                <p>{user.username}</p>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground">Email:</strong>
                <p>{user.email}</p>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground">Full Name:</strong>
                <p>{user.fullName}</p>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground">Account Type:</strong>
                <p>
                  {user.isSeller 
                    ? "Seller" 
                    : subscriptionDetails?.type 
                      ? `${subscriptionDetails.type.charAt(0).toUpperCase() + subscriptionDetails.type.slice(1)}` 
                      : "Standard"}
                </p>
              </div>
              {hasSubscription && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active Subscription
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className="col-span-1 md:col-span-2">
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
                ? "Manage your SafeSphere subscription" 
                : "Subscribe to SafeSphere for added security"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingSubscription ? (
              <div className="text-center py-4">
                <p>Loading subscription details...</p>
              </div>
            ) : hasSubscription ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <strong className="text-sm text-muted-foreground">Current Plan:</strong>
                    <p className="capitalize">{subscriptionDetails?.type || "Individual"} Plan</p>
                  </div>
                  {subscriptionDetails?.expiresAt && (
                    <div>
                      <strong className="text-sm text-muted-foreground">Next Billing Date:</strong>
                      <p>{formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Change Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Plan Type</label>
                      <Select 
                        value={planType} 
                        onValueChange={(value) => setPlanType(value as "individual" | "family")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem 
                            value="individual" 
                            disabled={subscriptionDetails?.type === "individual"}
                          >
                            Individual Plan {subscriptionDetails?.type === "individual" && "- Current"}
                          </SelectItem>
                          <SelectItem 
                            value="family" 
                            disabled={subscriptionDetails?.type === "family"}
                          >
                            Family Plan {subscriptionDetails?.type === "family" && "- Current"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Billing Cycle</label>
                      <Select 
                        value={billingCycle} 
                        onValueChange={(value) => setBillingCycle(value as "monthly" | "annual")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual (Save 15%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-3">
                    <Button 
                      variant="default"
                      disabled={subscriptionMutation.isPending}
                      onClick={() => handleSubscriptionAction("switch")}
                    >
                      Update Plan
                    </Button>
                    <Button 
                      variant="destructive"
                      disabled={subscriptionMutation.isPending}
                      onClick={() => handleSubscriptionAction("cancel")}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p>You don't have an active subscription. Subscribe to SafeSphere to access premium security features.</p>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Plan Type</label>
                      <Select 
                        value={planType} 
                        onValueChange={(value) => setPlanType(value as "individual" | "family")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual Plan (£3/month)</SelectItem>
                          <SelectItem value="family">Family Plan (£7/month)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Billing Cycle</label>
                      <Select 
                        value={billingCycle} 
                        onValueChange={(value) => setBillingCycle(value as "monthly" | "annual")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual (Save 15%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button 
                      variant="default"
                      disabled={subscriptionMutation.isPending}
                      onClick={() => handleSubscriptionAction("subscribe")}
                    >
                      Subscribe Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic data for development purposes */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 border border-dashed rounded-md">
                <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(diagnosticData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SuperSafe Mode & Family Management Section */}
      {hasSubscription && (
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
          {subscriptionDetails?.type === 'family' && (
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
                <div className="font-medium capitalize">{subscriptionDetails?.type || "Individual"} Plan</div>
                
                <div>Price:</div>
                <div className="font-medium">
                  {subscriptionDetails?.type === "individual" ? "£3" : "£7"}/month
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
                <div className="font-medium capitalize">{planType} Plan</div>
                
                <div>Price:</div>
                <div className="font-medium">
                  {planType === "individual" ? "£3" : "£7"}/month
                  {billingCycle === "annual" && " (billed annually with 15% discount)"}
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
                Your new plan rate of {planType === "individual" ? "£3" : "£7"} per month 
                will take effect on your next billing date: {subscriptionDetails?.expiresAt 
                  ? formatDate(new Date(subscriptionDetails.expiresAt), 'MMMM d, yyyy')
                  : "your next billing date"}.
                  
                {planType === "family" && subscriptionDetails?.type === "individual" && (
                  <span className="block mt-2">
                    You'll be upgraded from Individual (£3/month) to Family (£7/month).
                  </span>
                )}
                
                {planType === "individual" && subscriptionDetails?.type === "family" && (
                  <span className="block mt-2">
                    You'll be downgraded from Family (£7/month) to Individual (£3/month).
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