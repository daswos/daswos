import React, { Suspense, lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UnifiedSearch from "@/pages/unified-search";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/layout/header";
import NavigationBar from "@/components/layout/navigation-bar";
import { AuthProvider } from "@/hooks/use-auth";
import SafeSphereProvider from "@/contexts/safe-sphere-context";
import SuperSafeProvider from "@/contexts/super-safe-context";
import { AutoShopProvider } from "@/contexts/autoshop-context";
import { DasbarProvider } from "@/contexts/dasbar-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { Loader2 } from "lucide-react";

// Lazy load the UserSettings page
const UserSettings = lazy(() => import('@/pages/user-settings'));

// Import our custom hook
import { useBackspaceNavigation } from '@/hooks/use-backspace-navigation';

function Router() {
  // Use the backspace navigation hook
  useBackspaceNavigation();

  return (
    <div className="flex flex-col min-h-screen">
      <Switch>
        <Route path="/">
          <Header />
          <main className="flex-grow bg-[#E0E0E0] pb-24">
            <Home />
          </main>
          <NavigationBar />
        </Route>

        <Route>
          <Header />
          <main className="flex-grow bg-[#E0E0E0] pb-24">
            <Switch>
              {/* Only keep the unified search route */}
              <Route path="/search" component={UnifiedSearch} />
              <Route path="/unified-search" component={UnifiedSearch} />
              {/* Add auth page route */}
              <Route path="/auth" component={AuthPage} />
              {/* Add user settings route */}
              <Route path="/user-settings">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full w-full py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Loading settings...</span>
                  </div>
                }>
                  <UserSettings />
                </Suspense>
              </Route>
              <Route component={NotFound} />
            </Switch>
          </main>
          <NavigationBar />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="daswos-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeSphereProvider>
            <SuperSafeProvider>
              <AutoShopProvider>
                <DasbarProvider>
                  <Router />
                  <Toaster />
                </DasbarProvider>
              </AutoShopProvider>
            </SuperSafeProvider>
          </SafeSphereProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
