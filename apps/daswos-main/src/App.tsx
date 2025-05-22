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
import { AutoShopProvider as GlobalAutoShopProvider } from "@/contexts/global-autoshop-context";
import { DasbarProvider } from "@/contexts/dasbar-context";
import { WorkspaceProvider } from "@/components/workspace/workspace-context";
import Workspace from "@/components/workspace/workspace";
import { ThemeProvider } from "@/providers/theme-provider";
import { Loader2 } from "lucide-react";
import GlobalAutoShopTimer from "@/components/global-autoshop-timer";
import PageManager from "@/components/page-manager";

// Lazy load pages
const UserSettings = lazy(() => import('@/pages/user-settings'));
const AutoShopDashboard = lazy(() => import('@/pages/autoshop-dashboard'));

// Import our custom hook
import { useBackspaceNavigation } from '@/hooks/use-backspace-navigation';

// Import our components
import Sidebar from '@/components/layout/sidebar';
import HomeLogo from '@/components/layout/home-logo';

function Router() {
  // Use the backspace navigation hook
  useBackspaceNavigation();

  // The PageManager component will handle tracking page views

  return (
    <div className="flex flex-col min-h-screen bg-[#E0E0E0] dark:bg-[#222222]">
      <HomeLogo />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-grow bg-[#E0E0E0] dark:bg-[#222222] ml-[60px]">
          <PageManager />
        </main>
      </div>
      <Workspace />
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
              <GlobalAutoShopProvider>
                <AutoShopProvider>
                  <DasbarProvider>
                    <WorkspaceProvider>
                      <Router />
                      <GlobalAutoShopTimer />
                      <Toaster />
                    </WorkspaceProvider>
                  </DasbarProvider>
                </AutoShopProvider>
              </GlobalAutoShopProvider>
            </SuperSafeProvider>
          </SafeSphereProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
