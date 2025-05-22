import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Check, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { clearLocalCart } from '@/lib/cart-storage';

const OrderConfirmationPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Extract order ID and payment intent ID from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdParam = searchParams.get('order_id');
    const paymentIntentParam = searchParams.get('payment_intent');
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    
    if (paymentIntentParam) {
      setPaymentIntentId(paymentIntentParam);
    }
    
    // Clear cart on successful order
    clearLocalCart();
  }, []);

  // Fetch order details if we have an order ID
  const {
    data: orderDetails,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      if (!orderId) return null;
      
      try {
        return await apiRequest(`/api/orders/${orderId}`, {
          method: 'GET',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
        return null;
      }
    },
    enabled: !!orderId,
    staleTime: Infinity // Order details won't change
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading order information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading your order information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again or contact customer support if the problem persists.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/search?type=shopping')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
            <Button onClick={() => navigate('/account/orders')}>
              View My Orders
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
          {orderId && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{orderId}</p>
            </div>
          )}
          
          {orderDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">
                  {new Date(orderDetails.orderDate).toLocaleDateString()} at {new Date(orderDetails.orderDate).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="font-medium capitalize">{orderDetails.status}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">
                  {orderDetails.paymentMethod === 'daswos_coins' ? 'DasWos Coins' : 'Credit Card'}
                </p>
              </div>
              
              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h3 className="font-medium">Order Items</h3>
                  </div>
                  <div className="divide-y">
                    {orderDetails.items.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden mr-4">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.price / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <p className="text-center mt-6">
            You will receive a confirmation email shortly with your order details.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/search?type=shopping')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <Button onClick={() => navigate('/account/orders')}>
            View My Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;
