import React from 'react';
import { List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DasList: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <List className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">das.list</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Create and manage your shopping lists and wishlists.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Your Lists</CardTitle>
            <CardDescription>
              View and manage your shopping lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>das.list content will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DasList;
