import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Share2, Calendar, Globe, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafeSphereContext } from '@/contexts/safe-sphere-context';
import TransparencyButton from '@/components/transparency-button';

// Interface for the database schema structure
interface InformationContent {
  id: number;
  title: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sourceVerified: boolean;
  sourceType: string;
  trustScore: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  verifiedSince?: string;
  warning?: string;
  createdAt: string;
  updatedAt?: string;
}

// Response from API might use snake_case
interface ApiInformationContent {
  id: number;
  title: string;
  content: string;
  summary: string;
  source_url: string;
  source_name: string;
  source_verified: boolean;
  source_type: string;
  trust_score: number;
  category: string;
  tags: string[];
  image_url?: string;
  verified_since?: string;
  warning?: string;
  created_at: string;
  updated_at?: string;
}

const InformationDetail = () => {
  const [, params] = useRoute<{ id: string }>('/information/:id');
  const [, navigate] = useLocation();
  const { isSafeSphere } = useSafeSphereContext();
  const id = params?.id;

  const informationQuery = useQuery({
    queryKey: ['/api/information', id],
    enabled: !!id
  });

  const handleBack = () => {
    navigate('/search?type=information');
  };

  // If loading
  if (informationQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back button removed - now using the one in the navigation bar */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex space-x-2 mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If error or not found
  if (informationQuery.error || !informationQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back button removed - now using the one in the navigation bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Information Not Found</CardTitle>
            <CardDescription>
              The information content you are looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-10">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <p className="text-center mb-6">
              This content might have been removed or the URL is incorrect.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleBack}>
                Return to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create default empty ApiInformationContent object to avoid type errors
  const defaultApiInfo: ApiInformationContent = {
    id: 0,
    title: '',
    content: '',
    summary: '',
    source_url: '',
    source_name: '',
    source_verified: false,
    source_type: '',
    trust_score: 0,
    category: '',
    tags: [],
    created_at: '',
  };

  // Parse the data as ApiInformationContent with safety fallback
  const apiInfo = informationQuery.data ? informationQuery.data as ApiInformationContent : defaultApiInfo;

  // Format creation date with safety check
  const formattedDate = apiInfo.created_at ? new Date(apiInfo.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown Date';

  // Get trust score color
  const getTrustScoreColor = (score: number | undefined) => {
    const safeScore = score || 0;
    if (safeScore >= 8) return 'bg-green-100 text-green-800';
    if (safeScore >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Process the content - this will be HTML content
  // If the content is a path, load from that path
  const renderContent = () => {
    // Make sure content exists
    if (!apiInfo.content) {
      return <div className="text-center p-8">No content available</div>;
    }

    // Check if it's a file path
    if (typeof apiInfo.content === 'string' && apiInfo.content.startsWith('/')) {
      // This is a path to HTML content
      return (
        <iframe
          src={apiInfo.content}
          className="w-full min-h-screen border-0"
          title={apiInfo.title}
        ></iframe>
      );
    } else {
      // This is direct HTML content
      return <div dangerouslySetInnerHTML={{ __html: apiInfo.content }} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button removed - now using the one in the navigation bar */}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{apiInfo.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">{apiInfo.category}</Badge>
                <Badge variant="outline" className={getTrustScoreColor(apiInfo.trust_score)}>
                  <Award className="h-3 w-3 mr-1" />
                  Trust Score: {apiInfo.trust_score}/100
                </Badge>
                {isSafeSphere && (apiInfo.trust_score || 0) >= 80 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    SafeSphere Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <CardDescription className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              Source: {apiInfo.source_name}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Summary</h3>
            <p className="text-gray-700">{apiInfo.summary}</p>
          </div>

          {/* Main Content Section */}
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
            {renderContent()}
          </div>

          {/* Transparency Button Section */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-center">
            <TransparencyButton
              info={{
                name: apiInfo.source_name || '',
                type: apiInfo.source_type || '',
                verifiedSince: apiInfo.verified_since,
                trustScore: apiInfo.trust_score || 0,
                sourceUrl: apiInfo.source_url,
                sourceVerified: apiInfo.source_verified,
                warning: apiInfo.warning
              }}
              sourceType="information"
              size="default"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InformationDetail;