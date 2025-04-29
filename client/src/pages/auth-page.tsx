import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { RegisterForm } from "./register-form";
import DasWosLogo from '@/components/daswos-logo';

const loginSchema = z.object({
  username: z.string().min(3, "Username or password is incorrect"),
  password: z.string().min(6, "Username or password is incorrect"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get URL parameters
  const getUrlParams = () => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return {
      returnTo: params.get('returnTo') || '/',
      redirect: params.get('redirect') || null
    };
  };

  // Store the URL parameters
  const { returnTo, redirect } = getUrlParams();

  // Log the redirect parameter for debugging
  console.log("Auth page received redirect parameter:", redirect);

  const [safeSphereRedirect, setSafeSphereRedirect] = useState(
    (returnTo.includes('/search') && returnTo.includes('safesphere')) ||
    (redirect && redirect.includes('safesphere'))
  );

  useEffect(() => {
    // If user is logged in, determine where to redirect
    if (user) {
      const urlParams = new URLSearchParams(location.split('?')[1] || '');
      const selectedPlan = urlParams.get('selectedPlan');
      const billingCycle = urlParams.get('billingCycle');

      // Log for debugging
      console.log("Auth success redirection - user:", user.username);
      console.log("Redirect path:", redirect);
      console.log("Return to:", returnTo);

      // Coming from subscription page with plan selection
      if (selectedPlan && billingCycle) {
        console.log("Redirecting to subscription page with plan selection");
        // Check if user already has a subscription
        if (user.subscriptionType) {
          // If user already has a subscription, send them to the subscription page
          // without showPayment=true flag, to let the page handle existing subscriptions
          navigate(`/safesphere-subscription?selectedPlan=${selectedPlan}&billingCycle=${billingCycle}`);
        } else {
          // If user doesn't have a subscription, proceed to payment
          navigate(`/safesphere-subscription?selectedPlan=${selectedPlan}&billingCycle=${billingCycle}&showPayment=true`);
        }
      }
      // When a specific redirect is provided (comes from ProtectedSubscriptionRoute or other protected page)
      else if (redirect) {
        console.log("Handling redirect to:", redirect);
        // For new registrations that need subscription but don't have plan selected
        if (registerMutation.isSuccess && !user.subscriptionType) {
          console.log("New registration needs subscription, redirecting to subscription page");
          navigate('/safesphere-subscription?returnTo=' + encodeURIComponent(redirect));
        } else {
          // Otherwise go to the intended page (for existing users with subscription)
          console.log("Redirecting to the intended protected page:", redirect);
          navigate(redirect);
        }
      } else {
        // Use the returnTo parameter otherwise
        console.log("Using returnTo parameter to navigate to:", returnTo);
        navigate(returnTo);
      }
    }
  }, [user, navigate, returnTo, redirect, registerMutation.isSuccess, location]);

  const navigateToHome = () => {
    navigate("/");
  };

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    // Clear previous error
    setErrorMessage(null);

    loginMutation.mutate(data, {
      onError: (error: Error) => {
        // Set error message to display to the user
        setErrorMessage(error.message || "Invalid username or password");
      }
    });
  };

  const handleRegister = (data: z.infer<typeof registerSchema>) => {
    // Clear previous error
    setErrorMessage(null);

    const { confirmPassword, ...registerData } = data;

    // Check if there's seller verification data in session storage
    try {
      const sellerVerificationData = sessionStorage.getItem('sellerVerificationData');
      if (sellerVerificationData) {
        // Parse the stored verification data
        const verificationData = JSON.parse(sellerVerificationData);

        // Check if the email matches (if verification has an email)
        if (verificationData.email && verificationData.email !== data.email) {
          setErrorMessage("Please use the same email address you entered in the seller verification form.");
          return;
        }

        // Add verification data to registration data
        (registerData as any).verificationData = verificationData;

        // Clear the session storage after successful registration
      }
    } catch (error) {
      console.error("Error processing seller verification data:", error);
      // We'll continue with regular registration
    }

    registerMutation.mutate(registerData, {
      onSuccess: () => {
        // Clear seller verification data from session storage after successful registration
        sessionStorage.removeItem('sellerVerificationData');
      },
      onError: (error: Error) => {
        // Set error message to display to the user
        setErrorMessage(error.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#E0E0E0] dark:bg-[#222222] flex flex-col">
      {/* Return Button */}
      <div className="p-4">
        <Button variant="outline" onClick={navigateToHome} className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Button>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 text-center border-b border-gray-200">
            <div className="flex justify-center mb-4">
              <DasWosLogo height={60} width="auto" />
            </div>
            <p className="text-gray-600 text-sm">
              The trusted search platform with verified sellers
            </p>
            {safeSphereRedirect && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <p className="font-medium">You need an account to access SafeSphere</p>
                <p className="mt-1">
                  Please sign in or create a new account to search in our verified marketplace.
                  You'll be redirected back to your SafeSphere search after authentication.
                </p>
              </div>
            )}
          </div>
          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                <p className="font-medium">{activeTab === 'login' ? 'Login Error' : 'Registration Error'}</p>
                <p>{errorMessage}</p>
                {errorMessage.includes('Email already in use') && (
                  <p className="mt-1">Please use a different email address or login with your existing account.</p>
                )}
                {errorMessage.includes('Username already exists') && (
                  <p className="mt-1">Please choose a different username.</p>
                )}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value: string) => {
              setActiveTab(value as "login" | "register");
              // Clear error message when switching tabs
              setErrorMessage(null);
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="rounded-md">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm
                  isLoading={loginMutation.isPending}
                  onSubmit={handleLogin}
                />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm
                  isLoading={registerMutation.isPending}
                  onSubmit={handleRegister}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ isLoading, onSubmit }: { isLoading: boolean, onSubmit: (data: z.infer<typeof loginSchema>) => void }) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div>
            <FormLabel htmlFor="username" className="block mb-2 font-medium">Username</FormLabel>
            <div className="relative">
              <Input
                id="username"
                placeholder="Your username or email"
                {...form.register("username")}
                className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
                </svg>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              You can use either your username or email to log in (case-insensitive)
            </div>
            {form.formState.errors.username && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div>
            <FormLabel htmlFor="password" className="block mb-2 font-medium">Password</FormLabel>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                {...form.register("password")}
                className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white rounded-md py-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
}