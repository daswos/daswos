import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { formatDasWosCoins, formatCurrency } from '@/lib/utils';
import { ChevronRight, Coins, CreditCard, History, RefreshCcw, ArrowLeft } from 'lucide-react';
import DasWosCoinsPaymentForm from '@/components/daswos-coins-payment-form';
import { useLocation } from 'wouter';

// Local storage key for guest user coins
const GUEST_COINS_STORAGE_KEY = 'daswos_guest_coins';
const GUEST_TRANSACTIONS_STORAGE_KEY = 'daswos_guest_transactions';

const DaswosCoinsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
  const [swapAmount, setSwapAmount] = useState<number>(100);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [guestCoins, setGuestCoins] = useState<number>(0);

  // Check URL for success parameter (for redirect after payment)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const amount = params.get('amount');

    if (success === 'true' && amount) {
      toast({
        title: 'Payment Successful',
        description: `Successfully purchased ${formatDasWosCoins(parseInt(amount))} DasWos Coins`,
      });

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Refresh the balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/transactions'] });
    }
  }, []);

  // Load guest coins from localStorage if user is not authenticated
  useEffect(() => {
    if (!user) {
      const storedCoins = localStorage.getItem(GUEST_COINS_STORAGE_KEY);
      if (storedCoins) {
        setGuestCoins(parseInt(storedCoins));
      }
    }
  }, [user]);

  // Fetch user's coins balance
  const { data: coinsData, isLoading: loadingCoins } = useQuery({
    queryKey: ['/api/user/daswos-coins/balance'],
    queryFn: async () => {
      // For authenticated users, fetch from API
      if (user) {
        return apiRequest('/api/user/daswos-coins/balance', {
          method: 'GET',
          credentials: 'include'
        });
      }

      // For non-authenticated users, use localStorage
      return { balance: guestCoins, isAuthenticated: false };
    },
    // Always enabled, even for non-authenticated users
    staleTime: 60000, // 1 minute
  });

  // Fetch transaction history
  const { data: transactionsData = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['/api/user/daswos-coins/transactions'],
    queryFn: async () => {
      // For authenticated users, fetch from API
      if (user) {
        return apiRequest('/api/user/daswos-coins/transactions', {
          method: 'GET',
          credentials: 'include'
        });
      }

      // For non-authenticated users, use localStorage
      const storedTransactions = localStorage.getItem(GUEST_TRANSACTIONS_STORAGE_KEY);
      return storedTransactions ? JSON.parse(storedTransactions) : [];
    },
    // Always enabled, even for non-authenticated users
    staleTime: 60000, // 1 minute
  });

  // Purchase coins mutation (for free coins or after payment is processed)
  const purchaseMutation = useMutation({
    mutationFn: async (amount: number) => {
      // For authenticated users, use the API
      if (user) {
        return apiRequest('/api/user/daswos-coins/purchase', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            metadata: {
              packageName: `${amount} DasWos Coins`,
              purchaseTimestamp: new Date().toISOString()
            }
          }),
        });
      }

      // For non-authenticated users, update localStorage
      const newBalance = guestCoins + amount;
      localStorage.setItem(GUEST_COINS_STORAGE_KEY, newBalance.toString());

      // Add to transaction history
      const transaction = {
        id: Date.now(),
        amount: amount,
        type: 'purchase',
        description: `Added ${amount} DasWos Coins`,
        status: 'completed',
        metadata: {
          timestamp: new Date().toISOString()
        },
        createdAt: new Date()
      };

      const storedTransactions = localStorage.getItem(GUEST_TRANSACTIONS_STORAGE_KEY);
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      transactions.unshift(transaction);
      localStorage.setItem(GUEST_TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));

      // Return mock response
      return {
        success: true,
        message: "Successfully added DasWos Coins",
        amount,
        balance: newBalance,
        isGuest: true
      };
    },
    onSuccess: (data) => {
      // Update guest coins state if this is a guest user
      if (!user && data.isGuest) {
        setGuestCoins(data.balance);
      }

      toast({
        title: 'Coins Purchased',
        description: `Successfully purchased ${formatDasWosCoins(purchaseAmount)} DasWos Coins`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase coins. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Swap coins for cash mutation
  const swapMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest('/api/user/daswos-coins/swap', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Coins Swapped',
        description: `Successfully swapped ${formatDasWosCoins(swapAmount)} DasWos Coins for ${formatCurrency(swapAmount)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Swap Failed',
        description: error.message || 'Failed to swap coins. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handlePurchase = () => {
    if (purchaseAmount < 10) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum purchase amount is 10 DasWos Coins',
        variant: 'destructive',
      });
      return;
    }

    // Show the payment form instead of immediately purchasing
    setShowPaymentForm(true);
  };

  // Handle payment success
  const handlePaymentSuccess = (data: any) => {
    // Update the balance
    if (!user && data.isGuest) {
      setGuestCoins(data.balance);
    }

    setShowPaymentForm(false);

    toast({
      title: 'Payment Successful',
      description: `Successfully purchased ${formatDasWosCoins(purchaseAmount)} DasWos Coins`,
    });

    // Refresh the data
    queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/balance'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/transactions'] });
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  const handleSwap = () => {
    if (!coinsData || swapAmount > coinsData.balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough DasWos Coins to swap',
        variant: 'destructive',
      });
      return;
    }

    if (swapAmount < 100) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum swap amount is 100 DasWos Coins',
        variant: 'destructive',
      });
      return;
    }

    swapMutation.mutate(swapAmount);
  };

  // Format transaction date
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">DasWos Coins Management</h1>

      {/* Balance Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DasWosCoinIcon size={24} />
            <span>Current Balance</span>
          </CardTitle>
          <CardDescription>Your available DasWos Coins balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="text-4xl font-bold flex items-center">
              <DasWosCoinIcon size={32} />
              <span className="ml-2">
                {loadingCoins ? "Loading..." : formatDasWosCoins(coinsData?.balance || 0)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          <p>DasWos Coins can be used for AI-powered shopping and special features</p>
        </CardFooter>
      </Card>

      {/* Tabs for different actions */}
      <Tabs defaultValue="purchase" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">Purchase Coins</TabsTrigger>
          <TabsTrigger value="swap">Swap for Cash</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        {/* Purchase Tab */}
        <TabsContent value="purchase">
          {showPaymentForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePaymentCancel}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Go back</span>
                  </Button>
                </div>
                <CardDescription>
                  Complete your purchase of {formatDasWosCoins(purchaseAmount)} DasWos Coins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DasWosCoinsPaymentForm
                  amount={purchaseAmount}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Purchase DasWos Coins</CardTitle>
                <CardDescription>
                  Buy DasWos Coins to use with AI shopping features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Purchase Amount
                    </label>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setPurchaseAmount(100)}
                        className={purchaseAmount === 100 ? "border-primary" : ""}
                      >
                        <DasWosCoinIcon className="mr-2" />
                        100
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPurchaseAmount(500)}
                        className={purchaseAmount === 500 ? "border-primary" : ""}
                      >
                        <DasWosCoinIcon className="mr-2" />
                        500
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPurchaseAmount(1000)}
                        className={purchaseAmount === 1000 ? "border-primary" : ""}
                      >
                        <DasWosCoinIcon className="mr-2" />
                        1,000
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Custom Amount
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="10"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <span className="flex items-center">DasWos Coins</span>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800">
                    <div className="flex justify-between mb-2">
                      <span>Cost:</span>
                      <span>${purchaseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>You'll Receive:</span>
                      <span className="flex items-center">
                        <DasWosCoinIcon className="mr-1" />
                        {formatDasWosCoins(purchaseAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending || purchaseAmount < 10}
                >
                  {purchaseMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase Coins
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Swap Tab */}
        <TabsContent value="swap">
          <Card>
            <CardHeader>
              <CardTitle>Swap Coins for Cash</CardTitle>
              <CardDescription>
                Exchange your DasWos Coins for real currency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Swap Amount
                  </label>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSwapAmount(100)}
                      className={swapAmount === 100 ? "border-primary" : ""}
                      disabled={!coinsData || coinsData.balance < 100}
                    >
                      <DasWosCoinIcon className="mr-2" />
                      100
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSwapAmount(500)}
                      className={swapAmount === 500 ? "border-primary" : ""}
                      disabled={!coinsData || coinsData.balance < 500}
                    >
                      <DasWosCoinIcon className="mr-2" />
                      500
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSwapAmount(1000)}
                      className={swapAmount === 1000 ? "border-primary" : ""}
                      disabled={!coinsData || coinsData.balance < 1000}
                    >
                      <DasWosCoinIcon className="mr-2" />
                      1,000
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Amount
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="100"
                      max={coinsData?.balance || 0}
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(parseInt(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <span className="flex items-center">DasWos Coins</span>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span>You'll Spend:</span>
                    <span className="flex items-center">
                      <DasWosCoinIcon className="mr-1" />
                      {formatDasWosCoins(swapAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>You'll Receive:</span>
                    <span>${swapAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSwap}
                disabled={
                  swapMutation.isPending ||
                  swapAmount < 100 ||
                  !coinsData ||
                  swapAmount > coinsData.balance
                }
              >
                {swapMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Swap for Cash
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your DasWos Coins transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : transactionsData.length === 0 ? (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactionsData.map((transaction: any) => (
                    <div key={transaction.id} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatTransactionDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="flex items-center">
                            {transaction.type === 'credit' ? '+ ' : '- '}
                            <DasWosCoinIcon className="mx-1" size={16} />
                            {formatDasWosCoins(transaction.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user/daswos-coins/transactions'] })}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DaswosCoinsPage;