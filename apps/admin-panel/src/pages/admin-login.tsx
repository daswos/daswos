import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  // Clear any existing admin sessions on login page load
  useEffect(() => {
    const clearExistingSessions = async () => {
      console.log("Admin login page loaded - clearing any existing sessions");

      // Clear client-side admin session
      sessionStorage.removeItem("adminAuthenticated");
      sessionStorage.removeItem("adminUser");

      // Clear regular user authentication
      localStorage.removeItem("sessionToken");

      // Clear any query cache that might be keeping user data
      try {
        // Try to access the queryClient from window
        if (window.queryClient) {
          console.log("Clearing query client cache");
          window.queryClient.clear();
        }

        // Also try to clear specific user data queries
        if (window.queryClient?.removeQueries) {
          window.queryClient.removeQueries(["/api/user"]);
          window.queryClient.removeQueries(["/api/user/subscription"]);
        }
      } catch (e) {
        console.error("Error clearing query cache:", e);
      }

      // Clear all cookies that might be related to authentication
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      }

      // Call the regular logout endpoint first
      try {
        console.log("Calling regular logout endpoint");
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sessionToken: localStorage.getItem('sessionToken')
          })
        });
      } catch (error) {
        console.error("Error in regular logout:", error);
      }

      // Then call the server-side admin logout endpoint
      try {
        console.log("Calling admin logout endpoint from login page");
        const response = await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sessionToken: localStorage.getItem('sessionToken')
          })
        });

        // Wait for the response to be processed
        const result = await response.json();
        console.log("Admin logout response from login page:", result);

        // Add a small delay to ensure the server has time to process the logout
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error clearing admin session:", error);
      }
    };

    clearExistingSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Disable the login button to prevent multiple submissions
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";
    }

    try {
      setError("");

      console.log("Attempting admin login...");

      // Call the server-side admin login endpoint
      const response = await fetch("/api/admin/session-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important: include cookies for session authentication
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Admin login successful, setting session data");

        // Still set session storage for compatibility with existing code
        sessionStorage.setItem("adminAuthenticated", "true");

        // Also store user info if available
        if (data.user) {
          sessionStorage.setItem("adminUser", JSON.stringify(data.user));
        }

        // Add a small delay to ensure the server has time to process the login
        console.log("Waiting for server to process login...");
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log("Redirecting to admin panel...");
        setLocation("/admin");
      } else {
        const errorData = await response.json();
        console.error("Admin login failed:", errorData);
        setError(errorData.error || "Login failed");

        // Re-enable the login button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Login";
        }
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("An error occurred during login. Please try again.");

      // Re-enable the login button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Login";
      }
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">Login</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}