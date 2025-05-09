import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SuperSafeSettings from '@/components/super-safe-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Search, History } from 'lucide-react';

const SuperSafeSettingsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>SuperSafe Settings</CardTitle>
            <CardDescription>Please log in to access your settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">SuperSafe Settings</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span>Search Filters</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span>Search History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SuperSafeSettings />
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>
                Configure how SuperSafe Mode affects your search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                When SuperSafe Mode is enabled, your search results will be filtered according to your settings.
                This helps protect you from potentially harmful or inappropriate content.
              </p>
              
              {/* Future enhancement: Add more granular search filter settings here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Search History</CardTitle>
              <CardDescription>
                View and manage your search history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your recent searches are shown below. You can clear individual items or your entire search history.
              </p>
              
              {/* Future enhancement: Add search history display and management here */}
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Your search history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperSafeSettingsPage;
