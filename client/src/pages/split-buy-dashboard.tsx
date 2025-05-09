import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Clock, Users, UserX, UserPlus, ShoppingBag, Package, ChevronLeft, Home } from 'lucide-react';
import SplitBuyIcon from '@/components/icons/split-buy-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Mock data for testing
interface SplitBuyRequest {
  id: string;
  productId: number;
  productTitle: string;
  productImageUrl: string;
  price: number;
  totalItems: number;
  totalPrice: number;
  pricePerPerson: number;
  negotiationFee: number;
  expiresAt: string;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'cancelled';
  participants: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    status: 'joined' | 'invited' | 'declined';
  }[];
  targetParticipants: number;
  message?: string;
  isOrganizer: boolean;
}

const MOCK_SPLIT_REQUESTS: SplitBuyRequest[] = [
  {
    id: 'sb-123',
    productId: 5,
    productTitle: 'Premium Running Shoes',
    productImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    price: 129.99,
    totalItems: 10,
    totalPrice: 1169.91, // After bulk discount
    pricePerPerson: 584.95,
    negotiationFee: 17.55,
    expiresAt: '2025-04-10',
    status: 'pending',
    participants: [
      {
        id: 'u-1',
        name: 'You',
        email: 'you@example.com',
        joinedAt: '2025-04-03',
        status: 'joined'
      },
      {
        id: 'u-2',
        name: 'Jordan Smith',
        email: 'jordan@example.com',
        joinedAt: '2025-04-03',
        status: 'invited'
      }
    ],
    targetParticipants: 2,
    message: 'Looking to split the cost of these running shoes. Great deal!',
    isOrganizer: true
  },
  {
    id: 'sb-456',
    productId: 1,
    productTitle: 'Ergonomic Office Chair',
    productImageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    price: 249.99,
    totalItems: 12,
    totalPrice: 2549.90, // After bulk discount
    pricePerPerson: 849.97,
    negotiationFee: 25.50,
    expiresAt: '2025-04-15',
    status: 'active',
    participants: [
      {
        id: 'u-3',
        name: 'Taylor Wong',
        email: 'taylor@example.com',
        joinedAt: '2025-04-01',
        status: 'joined'
      },
      {
        id: 'u-1',
        name: 'You',
        email: 'you@example.com',
        joinedAt: '2025-04-02',
        status: 'joined'
      },
      {
        id: 'u-4',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        joinedAt: '2025-04-02',
        status: 'joined'
      }
    ],
    targetParticipants: 3,
    message: 'Office chairs for our team. Join if interested!',
    isOrganizer: false
  },
  {
    id: 'sb-789',
    productId: 3,
    productTitle: 'Wireless Noise Cancelling Headphones',
    productImageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90',
    price: 199.99,
    totalItems: 5,
    totalPrice: 849.96, // After bulk discount
    pricePerPerson: 424.98,
    negotiationFee: 12.75,
    expiresAt: '2025-04-05',
    status: 'expired',
    participants: [
      {
        id: 'u-1',
        name: 'You',
        email: 'you@example.com',
        joinedAt: '2025-03-25',
        status: 'joined'
      },
    ],
    targetParticipants: 2,
    message: 'Great headphones at bulk rate. Need one more person!',
    isOrganizer: true
  }
];

const SplitBuyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [splitRequests, setSplitRequests] = useState<SplitBuyRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed' | 'all'>('active');

  useEffect(() => {
    // In a real application, we would fetch the data from the API
    setSplitRequests(MOCK_SPLIT_REQUESTS);
  }, []);

  // Filter requests based on active tab
  const filteredRequests = splitRequests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return request.status === 'active';
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'completed') return ['completed', 'expired', 'cancelled'].includes(request.status);
    return true;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-300">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get participant initials
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Check if there are any pending invitations for organizer
  const hasPendingInvitations = (request: SplitBuyRequest) => {
    return request.isOrganizer && request.participants.some(p => p.status === 'invited');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to sign in to view your Split Buy dashboard.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-black flex items-center"
          onClick={() => navigate('/bulk-buy')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          BulkBuy
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center">
          <SplitBuyIcon className="mr-2 h-6 w-6" />
          Your Split Buy Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your group purchases and split requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="active" className="relative">
            Active
            {splitRequests.filter(r => r.status === 'active').length > 0 && (
              <Badge className="absolute -top-1 -right-1 text-xs h-5 min-w-5 flex items-center justify-center">
                {splitRequests.filter(r => r.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {splitRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="absolute -top-1 -right-1 text-xs h-5 min-w-5 flex items-center justify-center">
                {splitRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No split requests found</h3>
              <p className="text-gray-500 text-sm mb-4">
                {activeTab === 'all'
                  ? "You haven't participated in any split buys yet."
                  : `You don't have any ${activeTab} split buys.`}
              </p>
              <Button onClick={() => navigate('/bulk-buy')}>
                <Package className="mr-2 h-4 w-4" />
                Browse BulkBuy Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className={`border ${request.status === 'active' ? 'border-green-200' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-12 w-12 mr-3 rounded-md overflow-hidden">
                          <img
                            src={request.productImageUrl}
                            alt={request.productTitle}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{request.productTitle}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            {request.totalItems} items · {getStatusBadge(request.status)}
                            {request.isOrganizer && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200 text-xs">
                                Organizer
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(request.pricePerPerson + request.negotiationFee)}</div>
                        <div className="text-xs text-gray-500">
                          per person (inc. {formatPrice(request.negotiationFee)} fee)
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left column - Participants */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Participants ({request.participants.length}/{request.targetParticipants})
                        </h4>
                        <div className="space-y-2">
                          {request.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <Avatar className="h-7 w-7 mr-2">
                                  <AvatarFallback className={participant.name === 'You' ? 'bg-primary/20 text-primary' : 'bg-gray-100'}>
                                    {getInitials(participant.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{participant.name}</div>
                                  <div className="text-xs text-gray-500">Joined {formatDate(participant.joinedAt)}</div>
                                </div>
                              </div>
                              {participant.status === 'invited' && (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                  Invited
                                </Badge>
                              )}
                              {participant.status === 'joined' && (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  <Check className="h-3 w-3 mr-1" />
                                  Joined
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right column - Details */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Split Buy Details</h4>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <div className="text-gray-500">Total value:</div>
                          <div className="text-right">{formatPrice(request.totalPrice)}</div>

                          <div className="text-gray-500">Expires on:</div>
                          <div className="text-right">{formatDate(request.expiresAt)}</div>
                        </div>

                        {request.message && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm italic text-gray-600">
                            "{request.message}"
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4 flex-wrap gap-2">
                    {request.status === 'pending' && request.isOrganizer && (
                      <Button
                        variant="default"
                        size="sm"
                        className="mr-auto"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite More People
                      </Button>
                    )}

                    {request.status === 'pending' && !request.isOrganizer && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mr-auto"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Leave Group
                      </Button>
                    )}

                    {request.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {request.isOrganizer ? 'Cancel Split Buy' : 'Check Status'}
                      </Button>
                    )}

                    {request.status === 'active' && (
                      <Button
                        variant="default"
                        size="sm"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Order Details
                      </Button>
                    )}

                    {(request.status === 'expired' || request.status === 'completed') && (
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {request.status === 'expired' ? 'Try Again' : 'View Details'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default SplitBuyDashboard;