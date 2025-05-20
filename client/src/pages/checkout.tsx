import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShoppingCart, CreditCard, DollarSign, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { apiRequest } from '@/lib/queryClient';
import { getLocalCartItems, clearLocalCart } from '@/lib/cart-storage';
import { useAuth } from '@/hooks/use-auth';
import { useDasWosCoins } from '@/hooks/use-daswos-coins';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckoutStripeForm from '@/components/checkout-stripe-form';

// Load the Stripe instance outside the component to avoid reloading it
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
console.log('Using Stripe publishable key:', STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const formatPrice = (price: number) => {
  return `$${(price / 100).toFixed(2)}`;
};

const CheckoutPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { balance: coinsBalance, refetch: refetchCoins } = useDasWosCoins();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'coins'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.fullName || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  // Fetch cart items with local storage fallback
  const {
    data: cartItems = [],
    isLoading: isCartLoading,
    refetch: refetchCart
  } = useQuery({
    queryKey: ['/api/user/cart'],
    queryFn: async () => {
      try {
        // Try to get cart from server
        const result = await apiRequest('/api/user/cart', {
          method: 'GET',
          credentials: 'include'
        });

        // If server returned empty cart but we have items in local storage
        if (result.length === 0) {
          const localItems = getLocalCartItems();
          if (localItems.length > 0) {
            return localItems;
          }
        }

        return result;
      } catch (error) {
        // Fallback to local storage if server request fails
        const localItems = getLocalCartItems();
        return localItems;
      }
    },
    staleTime: 30000, // 30 seconds
  });

  // Calculate totals
  const regularTotal = cartItems
    .filter((item: any) => item.source !== 'ai_shopper')
    .reduce((sum: number, item: any) => sum + ((item.price || 0) * item.quantity), 0);

  const coinsTotal = cartItems
    .filter((item: any) => item.source === 'ai_shopper')
    .reduce((sum: number, item: any) => sum + ((item.price || 0) * item.quantity), 0);

  // Check if user has enough coins
  const hasEnoughCoins = coinsBalance >= coinsTotal;

  // Create payment intent when payment method is selected
  useEffect(() => {
    if (paymentMethod === 'card' && regularTotal > 0 && !clientSecret) {
      createPaymentIntent();
    }
  }, [paymentMethod, regularTotal]);

  const createPaymentIntent = async () => {
    try {
      setIsProcessing(true);

      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: regularTotal,
          items: cartItems.filter((item: any) => item.source !== 'ai_shopper'),
          metadata: {
            userId: user?.id || 'guest'
          }
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Error",
        description: "Could not initialize payment. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayWithCoins = async () => {
    if (!hasEnoughCoins) {
      toast({
        title: "Insufficient coins",
        description: `You need ${coinsTotal} DasWos Coins to complete this purchase.`,
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process coin payment
      const response = await fetch('/api/checkout/pay-with-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems.filter((item: any) => item.source === 'ai_shopper'),
          shippingInfo
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh coins balance
        refetchCoins();

        // Clear cart
        clearLocalCart();
        queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });

        setOrderComplete(true);

        toast({
          title: "Payment successful",
          description: "Your order has been placed successfully.",
          duration: 3000
        });
      } else {
        toast({
          title: "Payment failed",
          description: data.error || "Could not process payment. Please try again.",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error processing coin payment:', error);
      toast({
        title: "Payment failed",
        description: "Could not process payment. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Order Complete!</CardTitle>
            <CardDescription className="text-center">
              Thank you for your purchase. Your order has been successfully placed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              You will receive a confirmation email shortly with your order details.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/search?type=shopping')}>
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout information...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>
              Add some items to your cart before proceeding to checkout.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/search?type=shopping')}>
              Start Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your items before completing your purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 py-2 border-b">
                    <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      {item.source === 'ai_shopper' ? (
                        <div className="flex items-center">
                          <DasWosCoinIcon size={14} className="mr-1" />
                          <span>{item.price}</span>
                        </div>
                      ) : (
                        <span>{formatPrice(item.price)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    value={shippingInfo.zip}
                    onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                    placeholder="United States"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={regularTotal > 0 ? "card" : "coins"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="card"
                    disabled={regularTotal === 0}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger
                    value="coins"
                    disabled={coinsTotal === 0}
                    onClick={() => setPaymentMethod('coins')}
                  >
                    <DasWosCoinIcon size={16} className="mr-2" />
                    DasWos Coins
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  {regularTotal > 0 ? (
                    <>
                      <div className="py-4">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span>{formatPrice(regularTotal)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Shipping:</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Tax:</span>
                          <span>$0.00</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatPrice(regularTotal)}</span>
                        </div>
                      </div>

                      {clientSecret ? (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret,
                            appearance: { theme: 'stripe' },
                          }}
                        >
                          <CheckoutStripeForm
                            clientSecret={clientSecret}
                            shippingInfo={shippingInfo}
                            onSuccess={() => {
                              setOrderComplete(true);
                              clearLocalCart();
                              queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No card payment needed</AlertTitle>
                      <AlertDescription>
                        Your cart only contains items that can be purchased with DasWos Coins.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="coins" className="space-y-4">
                  {coinsTotal > 0 ? (
                    <>
                      <div className="py-4">
                        <div className="flex justify-between mb-2">
                          <span>Your Balance:</span>
                          <div className="flex items-center">
                            <DasWosCoinIcon size={14} className="mr-1" />
                            <span>{coinsBalance}</span>
                          </div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Total Cost:</span>
                          <div className="flex items-center">
                            <DasWosCoinIcon size={14} className="mr-1" />
                            <span>{coinsTotal}</span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Remaining Balance:</span>
                          <div className="flex items-center">
                            <DasWosCoinIcon size={14} className="mr-1" />
                            <span>{coinsBalance - coinsTotal}</span>
                          </div>
                        </div>
                      </div>

                      {!hasEnoughCoins && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Insufficient coins</AlertTitle>
                          <AlertDescription>
                            You don't have enough DasWos Coins to complete this purchase.
                            <Button
                              variant="link"
                              className="p-0 h-auto text-white underline"
                              onClick={() => navigate('/daswos-coins')}
                            >
                              Purchase more coins
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        className="w-full"
                        disabled={!hasEnoughCoins || isProcessing}
                        onClick={handlePayWithCoins}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <DasWosCoinIcon size={16} className="mr-2" />
                            Pay with DasWos Coins
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No coin payment needed</AlertTitle>
                      <AlertDescription>
                        Your cart doesn't contain any items that can be purchased with DasWos Coins.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Use the imported CheckoutStripeForm component instead

export default CheckoutPage;
