import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, Clock, Award } from 'lucide-react';
import { useLocation } from 'wouter';

interface InfoContentCardProps {
  content: {
    id: number;
    title: string;
    description: string;
    content: string;
    category: string;
    source?: string;
    trust_score?: number;
    created_at?: string;
    source_type?: string;
  };
}

const InfoContentCard: React.FC<InfoContentCardProps> = ({ content }) => {
  const [_, navigate] = useLocation();

  const handleNavigate = () => {
    navigate(`/information/${content.id}`);
  };

  // Format date - safely handle missing date
  const formattedDate = content.created_at 
    ? new Date(content.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown date';

  // Get trust score color
  const getTrustScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{content.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          {formattedDate}
          {content.category && (
            <>
              <span className="mx-2">•</span>
              <Badge variant="outline" className="text-xs font-normal">
                {content.category}
              </Badge>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-700 line-clamp-3 mb-3">{content.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {content.source_type && (
            <Badge variant="secondary" className="text-xs">
              {content.source_type}
            </Badge>
          )}
          {content.trust_score !== undefined && (
            <Badge variant="outline" className={`text-xs ${getTrustScoreColor(content.trust_score)}`}>
              <Award className="h-3 w-3 mr-1" />
              Trust Score: {content.trust_score}/100
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNavigate}
          className="w-full flex items-center justify-center"
        >
          <Info className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfoContentCard;