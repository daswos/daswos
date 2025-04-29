import React, { useState } from 'react';
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
import { ChevronRight, Coins, CreditCard, History, RefreshCcw } from 'lucide-react';

const DaswosCoinsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
  const [swapAmount, setSwapAmount] = useState<number>(100);

  // Fetch user's coins balance
  const { data: coinsData, isLoading: loadingCoins } = useQuery({
    queryKey: ['/api/user/daswos-coins/balance'],
    queryFn: async () => {
      return apiRequest('/api/user/daswos-coins/balance', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Fetch transaction history
  const { data: transactionsData = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['/api/user/daswos-coins/transactions'],
    queryFn: async () => {
      return apiRequest('/api/user/daswos-coins/transactions', {
        method: 'GET',
        credentials: 'include'
      });
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Purchase coins mutation
  const purchaseMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest('/api/user/daswos-coins/purchase', {
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
        description: `Successfully swapped ${formatDasWosCoins(swapAmount)} DasWos Coins for ${formatCurrency(swapAmount / 100)}`,
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
    purchaseMutation.mutate(purchaseAmount);
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

                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span>Cost:</span>
                    <span>${(purchaseAmount / 100).toFixed(2)}</span>
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
                    <span>${(swapAmount / 100).toFixed(2)}</span>
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