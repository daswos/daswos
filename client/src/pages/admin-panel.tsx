import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, XCircle, User, Building2, Phone, Mail, Globe, Calendar, Info, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PhotoVerificationPanel from "@/components/admin/photo-verification-panel";

// Default message templates for feature explanations
const SAFESPHERE_DEV_MESSAGE = "This is a development version of SafeSphere. Data is being collected via OpenSphere for development purposes.";
const AI_SHOPPER_DEV_MESSAGE = "This is a development version of Daswos AI. Features may be limited and recommendations are for testing only.";

interface AppSettings {
  paidFeaturesEnabled: boolean;
  safesphereDevMode: boolean;
  aiShopperDevMode: boolean;
  safesphereDevMessage: string;
  aiShopperDevMessage: string;
}

interface SellerVerification {
  id: number;
  userId: number;
  businessName: string;
  businessType: string;
  businessAddress: string;
  contactPhone: string;
  taxId: string;
  website: string;
  yearEstablished: string;
  description: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string | null;
  // User fields joined from the query
  username: string;
  email: string;
  fullName: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<AppSettings>({
    paidFeaturesEnabled: false, // We'll invert this when saving since backend uses paidFeaturesDisabled
    safesphereDevMode: false,
    aiShopperDevMode: false,
    safesphereDevMessage: SAFESPHERE_DEV_MESSAGE,
    aiShopperDevMessage: AI_SHOPPER_DEV_MESSAGE
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [sellerVerifications, setSellerVerifications] = useState<SellerVerification[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingVerification, setProcessingVerification] = useState(false);

  // Check if admin is authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin panel",
        variant: "destructive",
      });
      setLocation("/admin-login");
    }
  }, [setLocation, toast]);

  // Fetch seller verification requests
  const fetchSellerVerifications = async () => {
    setLoadingVerifications(true);
    try {
      const response = await fetch("/api/admin/seller-verifications");
      if (!response.ok) {
        throw new Error("Failed to fetch seller verifications");
      }
      const data = await response.json();
      setSellerVerifications(data.verifications || []);
    } catch (error) {
      console.error("Error fetching seller verifications:", error);
      toast({
        title: "Error",
        description: "Failed to load seller verification requests",
        variant: "destructive",
      });
    } finally {
      setLoadingVerifications(false);
    }
  };

  // Handle tab change to load seller verifications when switching to that tab
  useEffect(() => {
    if (activeTab === "seller-verifications") {
      fetchSellerVerifications();
    }
  }, [activeTab]);

  // Approve seller verification
  const approveSeller = async (sellerId: number) => {
    setProcessingVerification(true);
    try {
      const response = await fetch(`/api/admin/approve-seller/${sellerId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to approve seller");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Seller verification approved successfully",
      });

      // Refresh the list
      await fetchSellerVerifications();

      // If the server indicates that we should refresh user data
      if (result.refresh) {
        // Force refresh user data in case the user who was just approved is currently logged in
        try {
          if (window.queryClient) {
            window.queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          } else {
            // Fallback - just refresh the page
            window.location.reload();
          }
        } catch (refreshError) {
          console.error("Error refreshing user data:", refreshError);
        }
      }

      // Close the dialog if open
      setSelectedSeller(null);
    } catch (error) {
      console.error("Error approving seller:", error);
      toast({
        title: "Error",
        description: "Failed to approve seller verification",
        variant: "destructive",
      });
    } finally {
      setProcessingVerification(false);
    }
  };

  // Unapprove a previously approved seller
  const unapproveSelector = async (sellerId: number) => {
    setProcessingVerification(true);
    try {
      const response = await fetch(`/api/admin/unapprove-seller/${sellerId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to unapprove seller");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Seller verification has been revoked",
      });

      // Refresh the list
      await fetchSellerVerifications();

      // If the server indicates that we should refresh user data
      if (result.refresh) {
        // Force refresh user data in case the user who was just approved is currently logged in
        try {
          if (window.queryClient) {
            window.queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          } else {
            // Fallback - just refresh the page
            window.location.reload();
          }
        } catch (refreshError) {
          console.error("Error refreshing user data:", refreshError);
        }
      }

      // Close the dialog if open
      setSelectedSeller(null);
    } catch (error) {
      console.error("Error unapproving seller:", error);
      toast({
        title: "Error",
        description: "Failed to unapprove seller verification",
        variant: "destructive",
      });
    } finally {
      setProcessingVerification(false);
    }
  };

  // Reject seller verification
  const rejectSeller = async (sellerId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessingVerification(true);
    try {
      const response = await fetch(`/api/admin/reject-seller/${sellerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject seller");
      }

      toast({
        title: "Success",
        description: "Seller verification rejected",
      });

      // Refresh the list
      await fetchSellerVerifications();

      // Reset the form and close dialog
      setRejectionReason("");
      setSelectedSeller(null);
    } catch (error) {
      console.error("Error rejecting seller:", error);
      toast({
        title: "Error",
        description: "Failed to reject seller verification",
        variant: "destructive",
      });
    } finally {
      setProcessingVerification(false);
    }
  };

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();

          // Initialize with defaults, then override with stored values
          const fetchedSettings: AppSettings = {
            paidFeaturesEnabled: false, // Default is FREE access (paid features disabled)
            safesphereDevMode: false,
            aiShopperDevMode: false,
            safesphereDevMessage: SAFESPHERE_DEV_MESSAGE,
            aiShopperDevMessage: AI_SHOPPER_DEV_MESSAGE
          };

          // Update with any stored values
          // Backend uses paidFeaturesDisabled, so we need to invert the logic
          if (data.paidFeaturesDisabled !== undefined) {
            fetchedSettings.paidFeaturesEnabled = !data.paidFeaturesDisabled;
          }

          if (data.safesphereDevMode !== undefined) {
            fetchedSettings.safesphereDevMode = data.safesphereDevMode;
          }

          if (data.aiShopperDevMode !== undefined) {
            fetchedSettings.aiShopperDevMode = data.aiShopperDevMode;
          }

          if (data.safesphereDevMessage) {
            fetchedSettings.safesphereDevMessage = data.safesphereDevMessage;
          }

          if (data.aiShopperDevMessage) {
            fetchedSettings.aiShopperDevMessage = data.aiShopperDevMessage;
          }

          setSettings(fetchedSettings);
        }
      } catch (error) {
        console.error("Failed to fetch admin settings:", error);
        toast({
          title: "Error",
          description: "Failed to load developer settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save each setting individually
      const settingsToSave = [
        // Note: Backend uses paidFeaturesDisabled (inverted) so we need to save the opposite value
        { key: "paidFeaturesDisabled", value: !settings.paidFeaturesEnabled },
        { key: "safesphereDevMode", value: settings.safesphereDevMode },
        { key: "aiShopperDevMode", value: settings.aiShopperDevMode },
        { key: "safesphereDevMessage", value: settings.safesphereDevMessage },
        { key: "aiShopperDevMessage", value: settings.aiShopperDevMessage },
      ];

      // Save each setting
      for (const setting of settingsToSave) {
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(setting),
        });

        if (!response.ok) {
          throw new Error(`Failed to save setting: ${setting.key}`);
        }
      }

      toast({
        title: "Success",
        description: "Developer settings saved successfully",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save developer settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChange = (key: keyof AppSettings) => (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  if (loading) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Developer Admin Panel</CardTitle>
            <CardDescription>Loading settings...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Manage platform settings and seller verifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="settings" className="flex-1">Platform Settings</TabsTrigger>
              <TabsTrigger value="seller-verifications" className="flex-1">Seller Verifications</TabsTrigger>
              <TabsTrigger value="photo-verification" className="flex-1">Photo Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  These settings control site-wide functionality. Changes will affect all users.
                </AlertDescription>
              </Alert>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="paid-features" className="text-base">
                  Paid Features
                </Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all paid features and subscriptions
                </p>
              </div>
              <Switch
                id="paid-features"
                checked={settings.paidFeaturesEnabled}
                onCheckedChange={handleToggleChange('paidFeaturesEnabled')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="safesphere-dev" className="text-base">
                  SafeSphere Development Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show development mode message for SafeSphere features
                </p>
              </div>
              <Switch
                id="safesphere-dev"
                checked={settings.safesphereDevMode}
                onCheckedChange={handleToggleChange('safesphereDevMode')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-shopper-dev" className="text-base">
                  Daswos AI Development Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show development mode message for Daswos AI features
                </p>
              </div>
              <Switch
                id="ai-shopper-dev"
                checked={settings.aiShopperDevMode}
                onCheckedChange={handleToggleChange('aiShopperDevMode')}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="seller-verifications">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Pending Seller Verification Requests</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSellerVerifications}
                  disabled={loadingVerifications}
                >
                  {loadingVerifications ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              {loadingVerifications ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading seller verification requests...</p>
                </div>
              ) : sellerVerifications.length === 0 ? (
                <div className="text-center border rounded-lg py-8">
                  <p className="text-muted-foreground">No pending seller verification requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellerVerifications.map((seller) => (
                    <Card key={seller.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{seller.businessName || 'Unnamed Business'}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <User className="h-4 w-4" /> {seller.fullName}
                              <Mail className="h-4 w-4 ml-2" /> {seller.email}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              !seller.verificationStatus || seller.verificationStatus === 'pending' ? 'outline' :
                              seller.verificationStatus === 'approved' ? 'success' : 'destructive'
                            }
                          >
                            {seller.verificationStatus ? seller.verificationStatus.toUpperCase() : 'PENDING'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="details">
                            <AccordionTrigger>Business Details</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Business Type:</span> {seller.businessType || 'Not specified'}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Tax ID:</span> {seller.taxId || 'Not provided'}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Established:</span> {seller.yearEstablished || 'Not specified'}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Contact:</span> {seller.contactPhone || 'Not provided'}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Website:</span> {seller.website || 'Not provided'}
                                </div>

                                {seller.businessAddress && (
                                  <div className="mt-2">
                                    <span className="font-medium">Address:</span><br />
                                    <p className="text-muted-foreground whitespace-pre-line">{seller.businessAddress}</p>
                                  </div>
                                )}

                                {seller.description && (
                                  <div className="mt-2">
                                    <span className="font-medium">Description:</span><br />
                                    <p className="text-muted-foreground">{seller.description}</p>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardContent className="pt-0">
                        <div className="flex gap-2 justify-end">
                          {seller.verificationStatus === 'approved' ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => unapproveSelector(seller.id)}
                              disabled={processingVerification}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Revoke Approval
                            </Button>
                          ) : (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Seller Verification</DialogTitle>
                                <DialogDescription>
                                  This will reject the seller verification request. Please provide a reason.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Explain why this seller verification is being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={() => rejectSeller(seller.id)}
                                  disabled={processingVerification || !rejectionReason.trim()}
                                >
                                  {processingVerification ? "Processing..." : "Reject Seller"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => approveSeller(seller.id)}
                            disabled={processingVerification}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="photo-verification">
            <PhotoVerificationPanel />
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t mt-6">
          <Button
            onClick={() => {
              sessionStorage.removeItem("adminAuthenticated");
              setLocation("/admin-login");
            }}
            variant="outline"
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Preview of development messages */}
    {(settings.safesphereDevMode || settings.aiShopperDevMode) && (
      <Card>
        <CardHeader>
          <CardTitle>Development Messages Preview</CardTitle>
          <CardDescription>
            How the development messages will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.safesphereDevMode && (
            <Alert>
              <AlertTitle>SafeSphere Development Mode</AlertTitle>
              <AlertDescription>
                {settings.safesphereDevMessage}
              </AlertDescription>
            </Alert>
          )}

          {settings.aiShopperDevMode && (
            <Alert>
              <AlertTitle>Daswos AI Development Mode</AlertTitle>
              <AlertDescription>
                {settings.aiShopperDevMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )}
    </div>
  );
}