import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, Package, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { apiRequest } from '@/lib/queryClient';

const formatPrice = (price: number) => {
  return `$${(price / 100).toFixed(2)}`;
};

const CartPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart items
  const {
    data: cartItems = [],
    isLoading: isCartLoading,
    refetch: refetchCart
  } = useQuery({
    queryKey: ['/api/user/cart'],
    queryFn: async () => {
      return apiRequest('/api/user/cart', {
        method: 'GET',
        credentials: 'include' // Include cookies for session consistency
      });
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

  // Handle quantity update
  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await fetch(`/api/user/cart/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });

      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Could not update item quantity. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: number) => {
    try {
      await fetch(`/api/user/cart/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      queryClient.invalidateQueries({ queryKey: ['/api/user/cart'] });

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
        duration: 2000
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Could not remove item. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
      </div>

      {isCartLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Button
            onClick={() => navigate('/search?type=shopping')}
            className="bg-primary hover:bg-primary/90 text-black dark:text-black font-medium"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold">Cart Items ({cartItems.length})</h2>
              </div>

              <div className="divide-y">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                    <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-4 sm:mb-0">
                      {item.imageUrl || (item.product && item.product.imageUrl) ? (
                        <img
                          src={item.imageUrl || (item.product && item.product.imageUrl)}
                          alt={item.name || (item.product && item.product.title) || "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-grow sm:ml-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="font-medium">
                            {item.name || (item.product && item.product.title) || "Product"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.source === 'ai_shopper' ? (
                              <span className="flex items-center">
                                <DasWosCoinIcon size={14} className="mr-1" />
                                {item.price || (item.product && item.product.price) || 0}
                              </span>
                            ) : (
                              formatPrice(item.price || (item.product && item.product.price) || 0)
                            )}
                          </p>
                          {item.source === 'ai_shopper' && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                              AI Shopper
                            </span>
                          )}
                          {item.source === 'ai_recommendation' && (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-1">
                              AI Recommended
                            </span>
                          )}
                        </div>

                        <div className="mt-4 sm:mt-0 flex items-center">
                          <div className="flex items-center border rounded mr-4">
                            <button
                              className="px-2 py-1 border-r"
                              disabled={item.quantity <= 1}
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3">{item.quantity}</span>
                            <button
                              className="px-2 py-1 border-l"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Regular Items Subtotal:</span>
                  <span>{formatPrice(regularTotal)}</span>
                </div>

                {coinsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">DasWos Coins Items:</span>
                    <span className="flex items-center">
                      <DasWosCoinIcon size={14} className="mr-1" />
                      {coinsTotal}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold mb-6">
                <span>Total:</span>
                <span>{formatPrice(regularTotal)}</span>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-black dark:text-black font-medium"
                onClick={handleCheckout}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  onClick={() => navigate('/search?type=shopping')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
