import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UnifiedSearch from "@/pages/unified-search";
import SearchEngine from "@/pages/search-engine";
import ShoppingEngine from "@/pages/shopping-engine";
import SellerVerification from "@/pages/seller-verification";
import GuestSellerVerification from "@/pages/guest-seller-verification";
import AuthPage from "@/pages/auth-page";
import BulkBuy from "@/pages/bulk-buy";
import BulkBuyAgent from "@/pages/bulk-buy-agent";
import SafeSphereSubscription from "@/pages/safesphere-subscription";
import TestSubscription from "@/pages/test-subscription";
import ProfilePage from "@/pages/profile";
import DaswosAi from "@/pages/daswos-ai";
import AIAssistant from "@/pages/ai-assistant";
import AiSearch from "@/pages/ai-search";
import LangchainSearch from "@/pages/langchain-search";
import AdminPanel from "@/pages/admin-panel";
import AdminLogin from "@/pages/admin-login";
import SplitBuyDashboard from "@/pages/split-buy-dashboard";
import CollaborativeSearch from "@/pages/collaborative-search";
import CollaborativeSearchDetail from "@/pages/collaborative-search-detail";
import InformationDetail from "@/pages/information-detail";
import ProductDetail from "@/pages/product-detail";
// Legal and informational pages
import PrivacyPolicy from "@/pages/privacy";
import TermsOfService from "@/pages/terms";
import CookiePolicy from "@/pages/cookies";
import Accessibility from "@/pages/accessibility";
import Contact from "@/pages/contact";
import HowItWorks from "@/pages/how-it-works";
import TrustScore from "@/pages/trust-score";
import SphereComparison from "@/pages/sphere-comparison";
// New shopper & seller pages
import BuyerProtection from "@/pages/buyer-protection";
import ReportScam from "@/pages/report-scam";
import VerificationProcess from "@/pages/verification-process";
import Pricing from "@/pages/pricing";
// New navigation pages
import Shopping from "@/pages/shopping";
import Features from "@/pages/features";
import ForSellers from "@/pages/for-sellers";
import SellerHub from "@/pages/seller-hub";
import ShopperHub from "@/pages/shopper-hub";
import BuyerHub from "@/pages/buyer-hub";
// import DList from "@/pages/d-list"; // Not needed anymore
import AboutUs from "@/pages/about-us";
import ListItem from "@/pages/list-item";
import SellerSearch from "@/pages/seller-search";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
// SimpleFooter removed as we're not using it anymore
import NavigationBar from "@/components/layout/navigation-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminSettingsProvider } from "@/hooks/use-admin-settings";
import SafeSphereProvider from "@/contexts/safe-sphere-context";
import { AutoShopProvider } from "@/contexts/autoshop-context";
import { DasbarProvider } from "@/contexts/dasbar-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { ProtectedRoute, ProtectedSubscriptionRoute } from "./lib/protected-route";
// Using the built-in toast system

import MyListingsPage from "@/pages/my-listings";
import MyOrders from "@/pages/my-orders";
import DasbarSettings from "@/pages/dasbar-settings";

// Import category pages
import ArtPage from "@/pages/categories/art";
import ArtPaintingsPage from "@/pages/categories/art-paintings";
import ArtPaintingsHubPage from "@/pages/categories/art-paintings-hub";
import CraftsDiyPage from "@/pages/categories/crafts-diy";
import HandmadeItemsPage from "@/pages/categories/handmade-items";
import PhotographyPage from "@/pages/categories/photography";
import JewelryPage from "@/pages/categories/jewelry";
import CollectiblesPage from "@/pages/categories/collectibles";
import ClothingPage from "@/pages/categories/clothing";
import ShoesPage from "@/pages/categories/shoes";
import AccessoriesPage from "@/pages/categories/accessories";
import WatchesPage from "@/pages/categories/watches";
import ComputersPage from "@/pages/categories/computers";
import SmartphonesPage from "@/pages/categories/smartphones";
import AudioEquipmentPage from "@/pages/categories/audio-equipment";
import CamerasPage from "@/pages/categories/cameras";
import GamingPage from "@/pages/categories/gaming";
import WearableTechPage from "@/pages/categories/wearable-tech";
import FurniturePage from "@/pages/categories/furniture";
import HomeDecorPage from "@/pages/categories/home-decor";
import KitchenDiningPage from "@/pages/categories/kitchen-dining";
import GardenOutdoorPage from "@/pages/categories/garden-outdoor";
import BathBeddingPage from "@/pages/categories/bath-bedding";
import AppliancesPage from "@/pages/categories/appliances";
import PlumbingPage from "@/pages/categories/plumbing";
import ElectricalPage from "@/pages/categories/electrical";
import ArtExhibitionPage from "@/pages/art-exhibition";
import DaswosCoinsPage from "@/pages/daswos-coins";
import EnhancedDList from "@/pages/enhanced-d-list";
import EnhancedArtPage from "@/pages/categories/enhanced-art";
import BrowseJobsPage from "@/pages/browse-jobs";

import GlobalAutoShopTimer from "@/components/global-autoshop-timer";
import BackspaceTip from "@/components/backspace-tip";

// Import our custom hook
import { useBackspaceNavigation } from '@/hooks/use-backspace-navigation';

function Router() {
  const [location] = useLocation();

  // Use the backspace navigation hook
  useBackspaceNavigation();

  return (
    <div className="flex flex-col min-h-screen">
      <Switch>
        <Route path="/auth">
          <AuthPage />
        </Route>

        <Route path="/">
          <Header />
          <main className="flex-grow bg-[#E0E0E0] pb-24">
            {/* Added padding-bottom to ensure content isn't hidden behind the fixed dasbar */}
            <Home />
          </main>
          <NavigationBar />
        </Route>

        <Route>
          <Header />
          <main className="flex-grow bg-[#E0E0E0] pb-24">
            {/* Added padding-bottom to ensure content isn't hidden behind the fixed dasbar */}
            <Switch>
              {/* Public routes */}
              <Route path="/search" component={UnifiedSearch} />
              <Route path="/unified-search" component={UnifiedSearch} />
              <Route path="/search-engine" component={SearchEngine} />
              <Route path="/shopping-engine" component={ShoppingEngine} />
              <Route path="/bulk-buy" component={BulkBuy} />
              <Route path="/collaborative-search" component={CollaborativeSearch} />
              <Route path="/collaborative-search/:id" component={CollaborativeSearchDetail} />
              <Route path="/information/:id" component={InformationDetail} />
              <Route path="/product/:id" component={ProductDetail} />
              <Route path="/safesphere-subscription" component={SafeSphereSubscription} />
              <Route path="/test-subscription" component={TestSubscription} />

              {/* Legal pages */}
              <Route path="/privacy" component={PrivacyPolicy} />
              <Route path="/terms" component={TermsOfService} />
              <Route path="/cookies" component={CookiePolicy} />
              <Route path="/accessibility" component={Accessibility} />
              <Route path="/contact" component={Contact} />

              {/* Informational pages */}
              <Route path="/how-it-works" component={HowItWorks} />
              <Route path="/trust-score" component={TrustScore} />
              <Route path="/sphere-comparison" component={SphereComparison} />

              {/* Shopper pages */}
              <Route path="/buyer-protection" component={BuyerProtection} />
              <Route path="/report-scam" component={ReportScam} />
              <Route path="/shopper-hub" component={ShopperHub} />
              <Route path="/buyer-hub" component={BuyerHub} />
              <Route path="/d-list" component={BuyerHub} />
              <Route path="/enhanced-d-list" component={EnhancedDList} />

              {/* Seller pages */}
              <Route path="/verification-process" component={VerificationProcess} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/for-sellers" component={ForSellers} />
              <Route path="/seller-hub" component={SellerHub} />
              <Route path="/guest-seller-verification" component={GuestSellerVerification} />
              <Route path="/seller-search" component={SellerSearch} />

              {/* Category pages */}
              <Route path="/categories/art" component={ArtPage} />
              <Route path="/categories/enhanced-art" component={EnhancedArtPage} />
              <Route path="/categories/art-paintings" component={ArtPaintingsPage} />
              <Route path="/categories/art-paintings-hub" component={ArtPaintingsHubPage} />
              <Route path="/categories/crafts-diy" component={CraftsDiyPage} />
              <Route path="/categories/handmade-items" component={HandmadeItemsPage} />
              <Route path="/categories/photography" component={PhotographyPage} />
              <Route path="/categories/jewelry" component={JewelryPage} />
              <Route path="/categories/collectibles" component={CollectiblesPage} />
              <Route path="/categories/clothing" component={ClothingPage} />
              <Route path="/categories/shoes" component={ShoesPage} />
              <Route path="/categories/accessories" component={AccessoriesPage} />
              <Route path="/categories/watches" component={WatchesPage} />
              <Route path="/categories/computers" component={ComputersPage} />
              <Route path="/categories/smartphones" component={SmartphonesPage} />
              <Route path="/categories/audio-equipment" component={AudioEquipmentPage} />
              <Route path="/categories/cameras" component={CamerasPage} />
              <Route path="/categories/gaming" component={GamingPage} />
              <Route path="/categories/wearable-tech" component={WearableTechPage} />
              <Route path="/categories/furniture" component={FurniturePage} />
              <Route path="/categories/home-decor" component={HomeDecorPage} />
              <Route path="/categories/kitchen-dining" component={KitchenDiningPage} />
              <Route path="/categories/garden-outdoor" component={GardenOutdoorPage} />
              <Route path="/categories/bath-bedding" component={BathBeddingPage} />
              <Route path="/categories/appliances" component={AppliancesPage} />
              <Route path="/categories/plumbing" component={PlumbingPage} />
              <Route path="/categories/electrical" component={ElectricalPage} />
              <Route path="/art-exhibition" component={ArtExhibitionPage} />

              {/* New navigation pages */}
              <Route path="/shopping" component={Shopping} />
              <Route path="/features" component={Features} />
              <Route path="/about-us" component={AboutUs} />
              <Route path="/browse-jobs" component={BrowseJobsPage} />

              {/* Protected routes (require login) */}
              <ProtectedRoute path="/seller-verification" component={SellerVerification} />
              <ProtectedRoute path="/profile" component={ProfilePage} />
              <ProtectedRoute path="/split-buy-dashboard" component={SplitBuyDashboard} />
              <ProtectedRoute path="/list-item" component={ListItem} />
              <ProtectedRoute path="/my-listings" component={MyListingsPage} />
              <ProtectedRoute path="/daswos-coins" component={DaswosCoinsPage} />
              <ProtectedRoute path="/my-orders" component={MyOrders} />
              <ProtectedRoute path="/dasbar-settings" component={DasbarSettings} />

              {/* Subscription protected routes (require login + subscription) */}
              <ProtectedSubscriptionRoute path="/bulk-buy-agent" component={BulkBuyAgent} />
              <Route path="/ai-assistant" component={AIAssistant} /> {/* Made accessible without login */}
              <ProtectedRoute path="/ai-search" component={AiSearch} />
              <Route path="/daswos-ai" component={DaswosAi} />
              <Route path="/admin-login" component={AdminLogin} />
              <Route path="/admin" component={AdminPanel} />

              <Route component={NotFound} />
            </Switch>
          </main>
          <NavigationBar />
          {/* Only show footer on information pages */}
          {(location.startsWith('/about-us') ||
            location.startsWith('/privacy') ||
            location.startsWith('/terms') ||
            location.startsWith('/cookies') ||
            location.startsWith('/accessibility') ||
            location.startsWith('/contact') ||
            location.startsWith('/how-it-works') ||
            location.startsWith('/trust-score') ||
            location.startsWith('/sphere-comparison') ||
            location.startsWith('/for-sellers') ||
            location.startsWith('/seller-hub') ||
            location.startsWith('/shopper-hub') ||
            location.startsWith('/buyer-hub')) && <Footer />}
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
          <AdminSettingsProvider>
            <SafeSphereProvider>
              <AutoShopProvider>
                <DasbarProvider>
                  <Router />
                  <GlobalAutoShopTimer />
                  <BackspaceTip />
                  <Toaster />
                </DasbarProvider>
              </AutoShopProvider>
            </SafeSphereProvider>
          </AdminSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
