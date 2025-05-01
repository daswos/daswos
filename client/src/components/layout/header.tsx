import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LogOutIcon, ShoppingBag, UserIcon, ShieldCheck, Search,
  Split, ShoppingCart, Plus, Minus, Trash2, Info, MessageSquare,
  ChevronDown, ChevronRight, Store as StoreIcon, Sun, Moon, Wallet, Package,
  Loader2, Settings, Cog
} from 'lucide-react';
// Theme provider removed as we're using a fixed logo
import { useAuth } from '@/hooks/use-auth';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
// Removed unused import: formatDasWosCoins, formatCurrency
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import DasWosCoinDisplay from '@/components/shared/daswos-coin-display';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
// Sheet components removed as we're using DropdownMenu for cart
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

// Import menu component
import MenuButton from '@/components/menu-button';

// Quick Purchase Button Component
interface QuickPurchaseButtonProps {
  amount: number;
}

const QuickPurchaseButton: React.FC<QuickPurchaseButtonProps> = ({ amount }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/user/daswos-coins/purchase', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      toast({
        title: 'Coins Purchased',
        description: `Successfully purchased ${amount.toLocaleString()} DasWos Coins`,
      });

      // Refresh coins balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: 'Failed to purchase coins. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className="flex flex-col items-center justify-center bg-white border border-gray-300 p-1 text-xs hover:bg-gray-100 transition-colors"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <DasWosCoinIcon size={14} className="mb-1" />
          <span>{amount.toLocaleString()}</span>
        </>
      )}
    </button>
  );
};

const Header = () => {
  const { user, logoutMutation } = useAuth();
  const { settings } = useAdminSettings();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isSafeSphere, setIsSafeSphere] = useState(false);
  const { toast } = useToast();

  // AI search mode functionality moved to home page
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Debug user info including seller status
  useEffect(() => {
    if (user) {
      console.log("Current user:", user);
      console.log("isSeller status:", user.isSeller);
      console.log("isAdmin status:", user.isAdmin);
    }
  }, [user]);
  const [pendingSphereChange, setPendingSphereChange] = useState<boolean | null>(null);
  // Cart dropdown state is managed internally by the DropdownMenu component

  // Fetch DasWos coins balance for logged in users
  const { data: coinsData } = useQuery({
    queryKey: ['/api/user/daswos-coins/balance'],
    queryFn: async () => {
      return apiRequest('/api/user/daswos-coins/balance', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 60000, // 1 minute
  });

  // Fetch cart items for all users (authenticated or not)
  const { data: cartItems = [], isLoading: isCartLoading } = useQuery({
    queryKey: ['/api/user/cart'],
    queryFn: async () => {
      return apiRequest('/api/user/cart', {
        method: 'GET',
        credentials: 'include' // Include cookies for session consistency
      });
    },
    staleTime: 30000, // 30 seconds
  });

  // Log admin settings for debugging
  useEffect(() => {
    console.log('Admin settings in Header component:', settings);
  }, [settings]);

  // Fetch the user's SafeSphere preference when logged in or location changes
  useEffect(() => {
    const fetchSafeSphereStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user/safesphere');
        if (!response.ok) {
          console.error('Failed to fetch SafeSphere status');
          return;
        }

        const data = await response.json();
        const userPreference = data.active;

        // Check current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentSphere = urlParams.get('sphere');

        // If sphere is explicitly set in URL, use that value but don't update database
        if (currentSphere === 'safesphere' || currentSphere === 'opensphere') {
          setIsSafeSphere(currentSphere === 'safesphere');
        }
        // Otherwise use user's stored preference
        else {
          // Update URL without changing the current page
          if (userPreference) {
            urlParams.set('sphere', 'safesphere');
          } else {
            urlParams.set('sphere', 'opensphere');
          }
          const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
          window.history.pushState({}, '', newUrl);
          setIsSafeSphere(userPreference);
        }
      } catch (error) {
        console.error('Error fetching SafeSphere status:', error);
      }
    };

    fetchSafeSphereStatus();
  }, [user, location]);

  // Save the user's SafeSphere preference
  const saveSafeSpherePreference = async (active: boolean) => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/safesphere', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active })
      });

      if (!response.ok) {
        console.error('Failed to update SafeSphere status');
      }
    } catch (error) {
      console.error('Error updating SafeSphere status:', error);
    }
  };

  // Apply sphere change
  const applySphereChange = (checked: boolean) => {
    // Update the URL to include the sphere parameter without changing the page
    const urlParams = new URLSearchParams(window.location.search);
    if (checked) {
      urlParams.set('sphere', 'safesphere');
    } else {
      urlParams.set('sphere', 'opensphere');
    }

    // Build the new URL maintaining the current path
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

    // Just update location (URL) without reloading the page
    window.history.pushState({}, '', newUrl);

    // Update the state
    setIsSafeSphere(checked);

    // Save the user's preference to the database
    if (user) {
      saveSafeSpherePreference(checked);
    }
  };

  // SafeSphere toggle functionality removed

  // Handle confirmation dialog action
  const handleConfirmSphereChange = () => {
    if (pendingSphereChange !== null) {
      applySphereChange(pendingSphereChange);
    }
    setAlertDialogOpen(false);
    setPendingSphereChange(null);
  };

  // Handle cancellation of sphere change
  const handleCancelSphereChange = () => {
    setAlertDialogOpen(false);
    setPendingSphereChange(null);
  };

  // AI search toggle functionality moved to home page

  const handleLogout = async () => {
    // Check if this is an admin user and clear admin session
    if (user?.username === 'admin') {
      try {
        console.log("Admin user detected, performing admin logout");

        // First, clear all client-side storage
        console.log("Clearing client-side storage");
        sessionStorage.removeItem("adminAuthenticated");
        sessionStorage.removeItem("adminUser");
        localStorage.removeItem("sessionToken");

        // Clear any query cache that might be keeping user data
        if (window.queryClient) {
          console.log("Clearing query client cache");
          window.queryClient.clear();
          window.queryClient.removeQueries(["/api/user"]);
          window.queryClient.removeQueries(["/api/user/subscription"]);
        }

        // Clear all cookies
        console.log("Clearing cookies");
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        }

        // Call the regular logout endpoint first
        console.log("Calling regular logout endpoint");
        try {
          await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
          });
        } catch (error) {
          console.error("Error in regular logout:", error);
        }

        // Then call the server-side admin logout endpoint
        console.log("Calling admin logout endpoint");
        const response = await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include", // Important: include cookies
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sessionToken: localStorage.getItem('sessionToken')
          })
        });

        if (!response.ok) {
          console.error("Admin logout failed with status:", response.status);
        } else {
          console.log("Admin logout successful");
        }

        // Add a delay to ensure the server has time to process the logout
        console.log("Waiting for server to process logout...");
        await new Promise(resolve => setTimeout(resolve, 500));

        // Force a complete page reload to clear any in-memory state
        console.log("Redirecting to home page...");
        window.location.replace("/");
        return; // Don't proceed with regular logout
      } catch (error) {
        console.error("Error in admin logout:", error);

        // Force redirect even if there was an error
        window.location.replace("/");
        return;
      }
    }

    // Proceed with regular logout
    console.log("Performing regular user logout");
    logoutMutation.mutate();
  };

  const handleNavigation = (path: string) => {
    // Preserve the SafeSphere/OpenSphere state when navigating
    const newPath = isSafeSphere ?
      `${path}${path.includes('?') ? '&' : '?'}sphere=safesphere` :
      `${path}${path.includes('?') ? '&' : '?'}sphere=opensphere`;

    setLocation(newPath);
  };

  // Unused getInitials function removed

  return (
    <header className="w-full sticky top-0 bg-gray-200 z-20 text-black">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Menu Button as Home Button */}
        <div className="flex items-center">
          {/* Logo/Menu Button - Acts as Home Button */}
          <div
            className="cursor-pointer"
            onClick={() => handleNavigation('/')}
            title="Home"
          >
            <MenuButton height={30} />
          </div>
        </div>

        {/* Center section - empty now that logo is moved to left */}
        <div className="flex items-center">
          {/* This space is intentionally left empty */}
        </div>

        {/* SafeSphere Toggle removed */}

        {/* Info Button removed - now positioned under the DasWos logo */}

        {/* Theme Toggle Button removed - now positioned next to the DasWos logo */}

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* DasWos Coins Balance - Converted to dropdown for quick purchase */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer">
                  <DasWosCoinDisplay
                    coinBalance={coinsData ? coinsData.balance : 0}
                    size="sm"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-black p-1 border border-gray-300 rounded-none shadow-md w-64 user-dropdown">
                <div className="border-b border-gray-300 py-2 px-3 bg-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">DasWos Coins</h3>
                    <div className="flex items-center">
                      <DasWosCoinIcon size={16} className="mr-1" />
                      <span className="font-medium">{coinsData ? coinsData.balance.toLocaleString() : 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-medium mb-2">Quick Purchase</h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <QuickPurchaseButton amount={100} />
                    <QuickPurchaseButton amount={500} />
                    <QuickPurchaseButton amount={1000} />
                  </div>
                  <DropdownMenuItem
                    onClick={() => handleNavigation('/daswos-coins')}
                    className="w-full justify-center py-1 px-2 text-xs hover:bg-gray-200 rounded-none mt-2 user-menu-item"
                  >
                    Manage Coins
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* AI Search Button removed - now positioned under search bar */}

          {/* Shopping Cart Button - Modern style matching user toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="bg-white px-2 py-1 border border-gray-300 text-black flex items-center text-xs ml-2"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span>Cart</span>
                {cartItems.length > 0 && (
                  <span className="ml-1 text-xs bg-black text-white px-1">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-black border border-gray-300 rounded-none p-0 w-72 md:w-80 user-dropdown">
              <div className="border-b border-gray-300 p-3 bg-gray-100">
                <h2 className="text-base font-normal">Your Shopping Cart</h2>
                <p className="text-xs text-gray-500">{cartItems.length || 0} items</p>
              </div>

              <div className="max-h-[60vh] overflow-auto py-2">
                {isCartLoading ? (
                  <div className="flex justify-center py-4">
                    <p className="text-sm">Loading cart items...</p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <ShoppingBag className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Your cart is empty</p>
                    <button
                      className="mt-3 bg-gray-200 border border-gray-400 px-3 py-1 text-xs"
                      onClick={() => {
                        handleNavigation('/');
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-2">
                    {cartItems.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col border-b border-gray-200 pb-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="text-xs font-medium truncate">{item.name}</h3>
                              {item.source === 'ai_shopper' && (
                                <Badge className="text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                                  Auto
                                </Badge>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {item.source === 'ai_shopper' ? (
                                  <span className="flex items-center">
                                    <DasWosCoinIcon className="mr-1" size={12} />
                                    {(item.price || 0).toLocaleString()}
                                  </span>
                                ) : (
                                  <span>${(item.price || 0).toFixed(2)}</span>
                                )}
                              </p>
                              <div className="flex items-center gap-1 text-xs">
                                <button
                                  className="w-4 h-4 bg-white border border-gray-400 flex items-center justify-center"
                                  disabled={item.quantity <= 1}
                                  onClick={(e) => {
                                    if (item.quantity <= 1) {
                                      e.preventDefault();
                                      return;
                                    }

                                    const newQuantity = item.quantity - 1;
                                    fetch(`/api/user/cart/item/${item.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify({ quantity: newQuantity })
                                    }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
                                    }).catch(error => console.error('Error updating quantity:', error));
                                  }}
                                  style={{ opacity: item.quantity <= 1 ? 0.5 : 1 }}
                                >
                                  <Minus className="h-2 w-2" />
                                </button>
                                <span className="mx-1">{item.quantity}</span>
                                <button
                                  className="w-4 h-4 bg-white border border-gray-400 flex items-center justify-center"
                                  onClick={() => {
                                    const newQuantity = item.quantity + 1;
                                    fetch(`/api/user/cart/item/${item.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify({ quantity: newQuantity })
                                    }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
                                    }).catch(error => console.error('Error updating quantity:', error));
                                  }}
                                >
                                  <Plus className="h-2 w-2" />
                                </button>
                                <button
                                  className="w-4 h-4 ml-1 bg-white border border-gray-400 flex items-center justify-center text-red-500"
                                  onClick={() => {
                                    fetch(`/api/user/cart/item/${item.id}`, {
                                      method: 'DELETE',
                                      credentials: 'include'
                                    }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
                                    }).catch(error => console.error('Error removing item:', error));
                                  }}
                                >
                                  <Trash2 className="h-2 w-2" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-gray-300 p-3">
                  {/* Regular currency total */}
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Regular total:</span>
                    <span>${cartItems
                      .filter((item: any) => item.source !== 'ai_shopper') // Include both manual and ai_recommendation
                      .reduce((sum: number, item: any) =>
                        sum + ((item.price || 0) * item.quantity), 0)
                      .toFixed(2)}</span>
                  </div>

                  {/* Daswos coins total */}
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Daswos coins total:</span>
                    <span className="flex items-center">
                      <DasWosCoinIcon className="mr-1" size={12} />
                      {cartItems
                        .filter((item: any) => item.source === 'ai_shopper') // Only auto-shopped items
                        .reduce((sum: number, item: any) =>
                          sum + ((item.price || 0) * item.quantity), 0)
                        .toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between mb-2 text-xs">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <button
                    className="w-full bg-black text-white px-3 py-2 border border-gray-700 text-xs"
                    onClick={() => {
                      handleNavigation('/checkout');
                    }}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button removed - now using a single menu button for both mobile and desktop */}

          {/* Mobile Info Button removed - now positioned under the DasWos logo */}

          {/* Mobile Theme Toggle removed - now positioned next to the DasWos logo */}

          {/* Mobile SafeSphere Toggle removed */}

          {/* Mobile AI Search Toggle removed - now positioned under search bar */}

          {/* User Menu - Combined for both mobile and desktop */}
          {!user ? (
            <button
              onClick={() => handleNavigation('/auth')}
              className="bg-white px-2 py-1 border border-gray-300 text-black text-xs items-center flex ml-2"
            >
              <UserIcon className="h-4 w-4 mr-1" />
              <span>Sign in</span>
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-white px-2 py-1 border border-gray-300 text-black flex items-center text-xs ml-2">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>{user.username}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-black p-1 border border-gray-300 rounded-none shadow-md user-dropdown">
                <div className="border-b border-gray-300 py-1 px-2 text-center bg-gray-100">
                  <p className="text-xs font-medium">{user.username}</p>
                </div>

                <div>
                  <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="py-1 px-2 text-xs hover:bg-gray-200 rounded-none flex items-center user-menu-item">
                    <UserIcon className="mr-2 h-3 w-3" />
                    <span>My Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleNavigation('/user-settings')} className="py-1 px-2 text-xs hover:bg-gray-200 rounded-none flex items-center user-menu-item">
                    <Cog className="mr-2 h-3 w-3" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="h-px bg-gray-300 my-1" />

                  <DropdownMenuItem onClick={handleLogout} className="py-1 px-2 text-xs hover:bg-gray-200 rounded-none flex items-center user-menu-item">
                    <LogOutIcon className="mr-2 h-3 w-3" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Confirmation dialog for disabling SafeSphere */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable SafeSphere?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to turn off SafeSphere protection. This means you will see unverified listings
              and sellers, which may include fraudulent or lower quality offerings.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSphereChange} className="bg-gray-200 text-black hover:bg-gray-300 border-gray-300">
              Keep SafeSphere On
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSphereChange} className="bg-black text-white hover:bg-gray-800 border-black">
              Turn Off SafeSphere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;

