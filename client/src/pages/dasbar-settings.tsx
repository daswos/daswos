import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DasbarSettings = () => {
  const [, navigate] = useLocation();

  // Redirect to the new User Settings page
  useEffect(() => {
    // Short delay to allow the page to render before redirecting
    const redirectTimer = setTimeout(() => {
      navigate('/user-settings');
    }, 1000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="flex justify-center w-full py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Redirecting to User Settings</h1>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col justify-center items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p>The DasBar settings have been moved to the User Settings page.</p>
              <p>Redirecting you now...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DasbarSettings;
