import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface CollaborativeSearchCardProps {
  className?: string;
  linkTo: string;
}

const CollaborativeSearchCard: React.FC<CollaborativeSearchCardProps> = ({ 
  className = "", 
  linkTo 
}) => {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-purple-600" />
          <div>
            <h3 className="text-sm font-medium text-purple-900">Collaborative Research</h3>
            <p className="text-xs text-gray-600">
              Find research partners and share insights on similar topics through our collaborative search feature
            </p>
          </div>
        </div>
        <Link href={linkTo}>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs whitespace-nowrap"
            size="sm"
          >
            Collaborative Search
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default CollaborativeSearchCard;