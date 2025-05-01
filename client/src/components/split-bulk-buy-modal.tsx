import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, ShieldCheck, Check, X, UserPlus, UserCheck } from 'lucide-react';
import SplitBuyIcon from '@/components/icons/split-buy-icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface SplitBulkBuyModalProps {
  product: Product;
  buttonClassName?: string;
}

// Mock data for existing split offers
interface SplitOffer {
  id: string;
  productId: number;
  organizerName: string;
  organizerEmail: string;
  targetParticipants: number;
  currentParticipants: number;
  pricePerPerson: number;
  negotiationFee: number;
  expiresAt: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  message?: string;
}

// Sample split offers data
const MOCK_SPLIT_OFFERS: SplitOffer[] = [
  {
    id: "spl-001",
    productId: 5,
    organizerName: "Alex",
    organizerEmail: "alex@example.com",
    targetParticipants: 3,
    currentParticipants: 1,
    pricePerPerson: 433.30,
    negotiationFee: 13.00,
    expiresAt: "2025-04-10",
    status: 'pending',
    message: "Let's get these premium shoes together! Great deal."
  },
  {
    id: "spl-002",
    productId: 5,
    organizerName: "Jordan",
    organizerEmail: "jordan@example.com",
    targetParticipants: 5,
    currentParticipants: 2,
    pricePerPerson: 259.98,
    negotiationFee: 7.80,
    expiresAt: "2025-04-08",
    status: 'active',
    message: "Group buy for the entire team."
  },
  {
    id: "spl-003",
    productId: 5,
    organizerName: "Taylor",
    organizerEmail: "taylor@example.com",
    targetParticipants: 2,
    currentParticipants: 1,
    pricePerPerson: 649.95,
    negotiationFee: 19.50,
    expiresAt: "2025-04-07",
    status: 'pending',
    message: "Need one more person to complete this deal."
  }
];

const SplitBulkBuyModal: React.FC<SplitBulkBuyModalProps> = ({
  product,
  buttonClassName = ""
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [participants, setParticipants] = useState("2");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Filter offers for current product
  const [availableOffers, setAvailableOffers] = useState<SplitOffer[]>([]);

  useEffect(() => {
    // In a real app, we would fetch this from API
    // Filtering offers for the current product
    setAvailableOffers(MOCK_SPLIT_OFFERS.filter(offer => offer.productId === product.id));
  }, [product.id]);

  const minQuantity = product.bulkMinimumQuantity || 10;
  const discountRate = product.bulkDiscountRate || 15;
  const perPersonPrice = (product.price * minQuantity) / parseInt(participants);
  const negotiationFee = perPersonPrice * 0.03; // 3% negotiation fee
  const totalPerPerson = perPersonPrice + negotiationFee;

  const handleCreateSplit = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to invite participants.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);

      toast({
        title: "Split Bulk Buy initiated!",
        description: "We've created your group buy. Invitations have been sent to potential participants.",
      });
    }, 1500);
  };

  const handleJoinSplit = (offerId: string) => {
    setSelectedOfferId(offerId);
    setIsJoining(true);

    // Simulate API call
    setTimeout(() => {
      setIsJoining(false);
      setOpen(false);

      toast({
        title: "Successfully joined group buy!",
        description: "You've joined the split purchase. We'll notify you when the group is complete.",
      });
    }, 1500);
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Gets initials from name
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center ${buttonClassName}`}
        >
          <SplitBuyIcon className="w-4 h-4 mr-2" />
          Split Bulk Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">Split Buy - {product.title}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Share the cost with others and get bulk pricing without buying everything yourself.
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Split</TabsTrigger>
            <TabsTrigger value="join" className="relative">
              Join Existing
              {availableOffers.length > 0 && (
                <Badge className="absolute -top-1 -right-1 text-xs h-5 min-w-5 flex items-center justify-center">
                  {availableOffers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Create New Split Tab */}
          <TabsContent value="create" className="space-y-3 mt-3">
            <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-xs sm:text-sm">
              <h4 className="font-medium flex items-center mb-1">
                <Users className="h-4 w-4 mr-1" />
                Group Buy Details
              </h4>
              <p className="mb-2 text-xs line-clamp-2">Splitting cost of {minQuantity} items of "{product.title}"</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div>Original price per item:</div>
                <div className="text-right font-medium">{formatPrice(product.price)}</div>

                <div>Minimum quantity:</div>
                <div className="text-right font-medium">{minQuantity} items</div>

                <div>Bulk discount:</div>
                <div className="text-right font-medium text-green-600">-{discountRate}%</div>

                <div className="text-blue-900">Number of participants:</div>
                <div className="text-right font-medium text-blue-900">{participants} people</div>

                <div className="border-t border-blue-200 pt-1 font-medium">Cost per participant:</div>
                <div className="border-t border-blue-200 pt-1 text-right font-medium">{formatPrice(perPersonPrice)}</div>

                <div className="text-xs font-medium">Negotiation fee (3%):</div>
                <div className="text-right text-xs font-medium">{formatPrice(negotiationFee)}</div>

                <div className="text-blue-900 font-bold">Total per person:</div>
                <div className="text-right text-blue-900 font-bold">{formatPrice(totalPerPerson)}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="participants" className="text-xs sm:text-sm">Number of participants</Label>
              <Select
                value={participants}
                onValueChange={setParticipants}
              >
                <SelectTrigger id="participants" className="text-xs sm:text-sm h-8 sm:h-10">
                  <SelectValue placeholder="Select participants" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="text-xs sm:text-sm">
                      {num} participants
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs sm:text-sm">Your email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs sm:text-sm">Message to participants (optional)</Label>
              <Input
                id="message"
                placeholder="Let others know why they should join"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>

            <div className="bg-green-50 p-2 rounded-md text-xs sm:text-sm text-green-800 flex items-start">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Secure Payment Protection</span>
                <p className="mt-0.5 text-xs leading-tight">Funds are only collected if enough participants join. No payment is processed until the target is reached.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="text-xs">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateSplit} disabled={isLoading} size="sm" className="text-xs">
                {isLoading ? "Creating..." : "Create Split Buy"}
              </Button>
            </div>
          </TabsContent>

          {/* Join Existing Split Tab */}
          <TabsContent value="join" className="mt-4">
            {availableOffers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-1">No active split offers</h3>
                <p className="text-gray-500 text-sm mb-4">Be the first to start a split buy for this product!</p>
                <Button onClick={() => setActiveTab("create")}>
                  Create New Split
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  These users are looking for others to join their bulk buy. Join them to split the cost!
                </p>

                <div className="space-y-3">
                  {availableOffers.map((offer) => (
                    <Card key={offer.id} className={`border ${selectedOfferId === offer.id ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}>
                      <CardHeader className="pb-2 px-3 py-2">
                        <div className="flex flex-wrap justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-7 w-7 mr-2">
                              <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                {getInitials(offer.organizerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-sm">{offer.organizerName}'s Split</CardTitle>
                              <CardDescription className="text-xs">
                                Expires: {formatDate(offer.expiresAt)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={offer.status === 'active' ? 'default' : 'outline'} className="text-xs mt-1">
                            {offer.currentParticipants}/{offer.targetParticipants} joined
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2 pt-0 px-3">
                        <div className="text-sm">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                            <div className="text-gray-500">Price per person:</div>
                            <div className="text-right font-semibold">{formatPrice(offer.pricePerPerson)}</div>

                            <div className="text-gray-500">Negotiation fee:</div>
                            <div className="text-right">{formatPrice(offer.negotiationFee)}</div>

                            <div className="text-gray-500 font-semibold">Total cost:</div>
                            <div className="text-right font-semibold">{formatPrice(offer.pricePerPerson + offer.negotiationFee)}</div>
                          </div>

                          {offer.message && (
                            <div className="mt-2 text-xs italic text-gray-600 border-t pt-2">
                              "{offer.message}"
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 px-3 pb-3">
                        <Button
                          onClick={() => handleJoinSplit(offer.id)}
                          disabled={isJoining && selectedOfferId === offer.id}
                          className="w-full text-xs sm:text-sm"
                          variant={selectedOfferId === offer.id ? "default" : "outline"}
                          size="sm"
                        >
                          {isJoining && selectedOfferId === offer.id ? (
                            "Joining..."
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" />
                              Join This Split
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("create")}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Your Own Split Instead
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SplitBulkBuyModal;