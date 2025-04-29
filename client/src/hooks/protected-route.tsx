import { useAuth } from "../hooks/use-auth";
import { Loader2, ShieldCheck } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useAdminSettings } from "@/hooks/use-admin-settings";

type ComponentType = React.ComponentType<any>;

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType;
}) {
  const { user, isLoading } = useAuth();
  const { settings, loading: loadingSettings } = useAdminSettings();

  if (isLoading || loadingSettings) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If paid features are disabled, allow access without authentication
  if (settings.paidFeaturesDisabled) {
    console.log("ProtectedRoute: Paid features are disabled, allowing access without auth");
    return <Route path={path} component={Component} />;
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={`/auth?redirect=${encodeURIComponent(path)}`} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

export function ProtectedSubscriptionRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType;
}) {
  const { user, isLoading, hasSubscription, isCheckingSubscription } = useAuth();
  const { settings, loading: loadingSettings } = useAdminSettings();
  
  // Show loading state while checking authentication or subscription or feature flag
  if (isLoading || isCheckingSubscription || loadingSettings) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If paid features are disabled, allow access without authentication
  if (settings.paidFeaturesDisabled) {
    console.log("ProtectedSubscriptionRoute: Paid features are disabled, allowing access without subscription");
    return <Route path={path} component={Component} />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={`/auth?redirect=${encodeURIComponent(path)}`} />
      </Route>
    );
  }

  // Redirect to subscription page if authenticated but no subscription
  if (!hasSubscription) {
    return (
      <Route path={path}>
        <div className="container mx-auto py-16 px-4">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-2xl">SafeSphere Subscription Required</CardTitle>
              <CardDescription>
                The feature you're trying to access is only available to SafeSphere subscribers.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-4">
                SafeSphere gives you access to verified sellers, enhanced security features, 
                and advanced trust score filtering to ensure your transactions are protected.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild size="lg">
                <a href="/safesphere-subscription">Subscribe to SafeSphere</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Route>
    );
  }

  // If user is authenticated and has subscription, show the component
  return <Route path={path} component={Component} />;
}