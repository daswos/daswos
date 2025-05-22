import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// This schema should match the one in your auth-page.tsx
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

export function RegisterForm({ isLoading, onSubmit }: { 
  isLoading: boolean, 
  onSubmit: (data: z.infer<typeof registerSchema>) => void 
}) {
  // Try to load verification data from session storage to pre-populate form
  const [verificationDataLoaded, setVerificationDataLoaded] = useState(false);
  const [hasVerificationData, setHasVerificationData] = useState(false);
  
  // Default form values
  const defaultValues = {
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  };
  
  // Register the form with React Hook Form
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });
  
  // Load verification data if available
  useEffect(() => {
    // Only attempt to load once
    if (verificationDataLoaded) return;
    
    try {
      const sellerVerificationData = sessionStorage.getItem('sellerVerificationData');
      if (sellerVerificationData) {
        const verificationData = JSON.parse(sellerVerificationData);
        setHasVerificationData(true);
        
        // Pre-fill form values from verification data if available
        if (verificationData.email) {
          form.setValue('email', verificationData.email);
        }
        
        if (verificationData.fullName) {
          form.setValue('fullName', verificationData.fullName);
          // Also suggest a username based on full name (lowercase, no spaces)
          const suggestedUsername = verificationData.fullName
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
          
          if (suggestedUsername) {
            form.setValue('username', suggestedUsername);
          }
        }
      }
      
      setVerificationDataLoaded(true);
    } catch (error) {
      console.error("Error loading verification data:", error);
      setVerificationDataLoaded(true);
    }
  }, [form, verificationDataLoaded]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        {hasVerificationData && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            <p className="font-medium">Seller Verification Data Detected</p>
            <p className="mt-1">
              We've pre-filled some information from your seller verification form. Please complete the registration to finish the verification process.
            </p>
          </div>
        )}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}