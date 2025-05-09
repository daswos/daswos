import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { useAdminSettings } from "@/hooks/use-admin-settings";

type SubscriptionData = {
  type: "limited" | "unlimited" | "individual" | "family"; // Keep legacy types for backward compatibility
  billingCycle: "monthly" | "annual";
  action?: "subscribe" | "switch" | "cancel";
};

type SubscriptionDetails = {
  hasSubscription: boolean;
  type?: string;
  expiresAt?: Date;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  fullName: string;
  password: string;
  verificationData?: any; // For linking seller verification data
};

interface LoggedInUser {
  id: string;
  username: string;
  isActive: boolean;
}

interface AuthContextType {
  loggedInUsers: LoggedInUser[];
  activeUser: LoggedInUser | null;
  switchUser: (userId: string) => void;
  addUser: (credentials: LoginCredentials) => Promise<void>;
  removeUser: (userId: string) => void;
  logoutAll: () => void;
}

const defaultContextValue: AuthContextType = {
  loggedInUsers: [],
  activeUser: null,
  switchUser: () => {},
  addUser: async () => {},
  removeUser: () => {},
  logoutAll: () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match] = useRoute("/safesphere-subscription");

  // Fetch user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch subscription status
  const {
    data: subscriptionDetails,
    isLoading: isCheckingSubscription,
  } = useQuery<SubscriptionDetails | null>({
    queryKey: ["/api/user/subscription"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only run this query if user is logged in
  });

  // Get admin settings to check for subscription dev mode
  const { settings } = useAdminSettings();

  const hasSubscription = Boolean(
    subscriptionDetails?.hasSubscription ||
    (user?.email === 'admin@manipulai.com') ||
    settings.subscriptionDevMode
  );

  // Handle new registration redirect to subscription page
  useEffect(() => {
    if (user && 'isNewRegistration' in user && !match) {
      // Redirect to subscription page
      setLocation('/safesphere-subscription');

      // Clean up the flag after redirection
      setTimeout(() => {
        const cleanedUser = { ...user };
        delete (cleanedUser as any).isNewRegistration;
        queryClient.setQueryData(["/api/user"], cleanedUser);
      }, 500);
    }
  }, [user, match, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login for user:", credentials.username);

        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          // apiRequest already returns the JSON-parsed response
          const response = await apiRequest("POST", "/api/login", credentials, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          return response;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          // Handle specific error cases
          if (fetchError.name === 'AbortError') {
            console.error("Login request timed out");
            throw new Error("Login request timed out. Please try again.");
          }

          // Handle network errors
          if (!navigator.onLine) {
            console.error("Network offline");
            throw new Error("You appear to be offline. Please check your internet connection.");
          }

          // Extract the detailed error message from the API response if available
          if (fetchError.message && fetchError.message.includes('401')) {
            throw new Error("Invalid username or password");
          }

          if (fetchError.message && fetchError.message.includes('Failed to fetch')) {
            console.error("Failed to fetch during login:", fetchError);
            throw new Error("Unable to connect to the server. Please try again later.");
          }

          throw fetchError;
        }
      } catch (error: any) {
        console.error("Login error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      // Store the user data in the query cache
      queryClient.setQueryData(["/api/user"], data.user);

      // Store the session token in localStorage for future API requests
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
        console.log('Session token stored:', data.sessionToken);
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      // Component-level error handling will take care of this
      console.error("Login error:", error.message);

      // Show toast only when not in auth page (where we show inline errors)
      if (window.location.pathname !== "/auth") {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        // Save verification data for after registration
        const verificationData = credentials.verificationData;

        // Remove verification data from credentials before sending
        const { verificationData: _, ...registerCredentials } = credentials;

        // apiRequest already returns the JSON-parsed response
        const userData = await apiRequest("POST", "/api/register", registerCredentials);

        // If we have verification data, process it after successful registration
        if (verificationData) {
          try {
            const verificationResult = await apiRequest("POST", "/api/sellers/verification/complete", verificationData);
            userData.pendingSellerVerification = true;
            userData.sellerVerificationData = verificationResult;
          } catch (verificationError) {
            console.error("Error completing seller verification:", verificationError);
            // We don't fail the registration if verification linking fails
            // The user can try again later from their account
          }
        }

        return userData;
      } catch (error: any) {
        // Extract the detailed error message from the API response if available
        if (error.message && error.message.includes('400')) {
          const errorMessage = error.message.includes('Email already in use')
            ? 'Email already in use'
            : error.message.includes('Username already exists')
              ? 'Username already exists'
              : error.message;

          throw new Error(errorMessage);
        }
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);

      // Check if the user has pending seller verification
      const verificationMessage = user.pendingSellerVerification
        ? " Your seller verification is pending approval."
        : "";

      toast({
        title: "Registration successful",
        description: `Welcome to DasWos, ${user.username}!${verificationMessage}`,
      });
    },
    onError: (error: Error) => {
      // Errors are now handled at the component level for more specific messaging
      console.error("Registration error:", error.message);
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: SubscriptionData) => {
      // apiRequest already returns the JSON-parsed response
      return await apiRequest("POST", "/api/user/subscription", subscriptionData);
    },
    onSuccess: (data) => {
      // Invalidate subscription query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });

      // Also refresh user data since family owner status might have changed
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      // If this is a family or unlimited subscription, also refresh family members
      if (data?.type === 'family' || data?.type === 'unlimited') {
        queryClient.invalidateQueries({ queryKey: ["/api/family/members"] });
      }

      toast({
        title: "Subscription activated",
        description: `Your ${
          data?.type === 'limited' ? 'Daswos Limited' :
          data?.type === 'unlimited' ? 'Daswos Unlimited' :
          data?.type === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'
        } subscription has been activated successfully!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Check if this is an admin user
      const isAdmin = user?.username === 'admin';

      // If admin, call the admin logout endpoint first
      if (isAdmin) {
        try {
          const adminLogoutResponse = await fetch("/api/admin/logout", {
            method: "POST",
            credentials: "include"
          });

          if (!adminLogoutResponse.ok) {
            console.error("Admin logout failed");
          }
        } catch (error) {
          console.error("Error in admin logout:", error);
        }
      }

      // Then call the regular logout endpoint
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }

      return {}; // Return empty object to satisfy the type system
    },
    onSuccess: () => {
      // Clear query cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.setQueryData(["/api/user/subscription"], null);

      // Clear admin session if it exists
      if (sessionStorage.getItem("adminAuthenticated")) {
        sessionStorage.removeItem("adminAuthenticated");
        sessionStorage.removeItem("adminUser");
      }

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      // Redirect to home page after logout
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        hasSubscription,
        isCheckingSubscription,
        subscriptionDetails: subscriptionDetails || null,
        loginMutation,
        logoutMutation,
        registerMutation,
        subscriptionMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}


