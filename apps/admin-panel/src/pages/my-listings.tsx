import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Package,
  Plus,
  Store,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Edit,
  Trash,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrustScore } from '@/components/trust-score';
import { formatPrice } from '@/lib/utils';
import { Product } from '@shared/schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ProductStatus = 'draft' | 'active' | 'pending' | 'approved' | 'rejected' | 'all';

interface ExtendedProduct extends Product {
  status?: ProductStatus;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  approvedBy?: number;
  approvedAt?: string;
}

const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch the user's products
  const { data: products, isLoading, error, refetch } = useQuery<ExtendedProduct[]>({
    queryKey: ['/api/products/seller', user?.id],
    queryFn: () => fetch(`/api/products/seller/${user?.id}`).then(res => {
      if (!res.ok) {
        console.error('Error fetching listings:', res.status, res.statusText);
        throw new Error('Failed to fetch your listings');
      }
      return res.json();
    }),
    enabled: !!user?.id,
    retry: 1,
  });

  // Handle navigation to create a new listing
  const handleNewListing = () => {
    setLocation('/list-item');
  };

  // Handle navigation to the seller verification page
  const handleSellerVerification = () => {
    setLocation('/seller-verification');
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to log in to view your listings.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/auth?redirect=/my-listings')}>
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={handleNewListing}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Listing
        </Button>
      </div>

      {!user.isSeller && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Become a Trusted Seller
            </CardTitle>
            <CardDescription className="text-amber-700">
              Complete the seller verification process to earn trust points and gain buyer confidence.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={handleSellerVerification}>
              Start Verification Process
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your listings...</span>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Listings</CardTitle>
            <CardDescription className="text-red-700">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div>
          {products && products.length > 0 ? (
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <ProductGrid
                  products={products.map(p => ({
                    ...p,
                    // Use approvalStatus if available, otherwise fall back to status
                    status: p.approvalStatus || p.status || 'pending'
                  }))}
                  setLocation={setLocation}
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                <ProductGrid
                  products={products
                    .map(p => ({
                      ...p,
                      status: p.approvalStatus || p.status || 'pending'
                    }))
                    .filter(p => p.approvalStatus === 'approved')
                  }
                  setLocation={setLocation}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <ProductGrid
                  products={products
                    .map(p => ({
                      ...p,
                      status: p.approvalStatus || p.status || 'pending'
                    }))
                    .filter(p => p.approvalStatus === 'pending' || !p.approvalStatus)
                  }
                  setLocation={setLocation}
                />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <ProductGrid
                  products={products
                    .map(p => ({
                      ...p,
                      status: p.approvalStatus || p.status || 'pending'
                    }))
                    .filter(p => p.approvalStatus === 'rejected')
                  }
                  setLocation={setLocation}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle className="mb-2">No Listings Yet</CardTitle>
                <CardDescription>
                  You haven't created any product listings yet. Start selling by creating your first listing.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button onClick={handleNewListing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

interface ProductGridProps {
  products: ExtendedProduct[];
  setLocation: (path: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, setLocation }) => {
  // If no products match the filter
  if (products.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <CardTitle className="mb-2">No Listings Found</CardTitle>
          <CardDescription>
            No listings match the current filter.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = (product: ExtendedProduct) => {
    // First check for approval status
    if (product.approvalStatus) {
      switch(product.approvalStatus) {
        case 'approved':
          return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" /> Pending Approval</Badge>;
        case 'rejected':
          return <Badge className="bg-red-500 hover:bg-red-600 text-white"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      }
    }

    // Fall back to legacy status if no approval status
    switch(product.status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><AlertCircle className="h-3 w-3 mr-1" /> Pending Review</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" /> Pending Approval</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
              <TrustScore score={product.trustScore} />
            </div>
          </CardHeader>

          <CardContent className="flex-grow">
            {product.imageUrl && (
              <div className="relative h-40 mb-3 bg-slate-100 rounded-md overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-between mb-2">
              {getStatusBadge(product)}

              {product.isBulkBuy && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                  Bulk Buy
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {product.description}
            </p>

            {product.approvalStatus === 'rejected' && product.adminNotes && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Rejection Reason</AlertTitle>
                <AlertDescription className="text-xs">
                  {product.adminNotes}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-1 mb-2">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" /> {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t pt-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation(`/product/${product.id}`)}
            >
              <Package className="h-4 w-4 mr-2" />
              View Listing
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MyListingsPage;