import React from 'react';
import { Split } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SplitBuy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Split className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">SplitBuy</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Share the cost with others and get bulk pricing without buying everything yourself.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>SplitBuy Dashboard</CardTitle>
            <CardDescription>
              View your active split buys and join others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>SplitBuy content will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SplitBuy;
