import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, Gift, ArrowRight, Info } from 'lucide-react';
import DasWosCoinIcon from '@/components/daswos-coin-icon';
import { formatDate } from '@/lib/utils';
import { useLocation } from 'wouter';

// Coin package options
const coinPackages = [
  { id: 1, amount: 100, price: 0.99, popular: false },
  { id: 2, amount: 500, price: 4.49, popular: false },
  { id: 3, amount: 1000, price: 8.49, popular: true },
  { id: 4, amount: 2500, price: 19.99, popular: false },
  { id: 5, amount: 5000, price: 37.99, popular: false },
  { id: 6, amount: 10000, price: 69.99, popular: false },
];

// Transaction type icons
const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case 'giveaway':
      return <Gift className="h-4 w-4 text-green-500" />;
    case 'transfer':
      return <ArrowRight className="h-4 w-4 text-orange-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const DasWosCoinsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('buy');

  // Fetch user's coin balance
  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['/api/daswos-coins/balance'],
    queryFn: async () => {
      if (!user) return { balance: 0 };
      const response = await fetch('/api/daswos-coins/balance');
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch transaction history
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/daswos-coins/transactions'],
    queryFn: async () => {
      if (!user) return { transactions: [] };
      const response = await fetch('/api/daswos-coins/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!user && activeTab === 'history',
  });

  // Create Stripe checkout session
  const createCheckoutSession = useMutation({
    mutationFn: async ({ amount, coinAmount }: { amount: number; coinAmount: number }) => {
      const response = await fetch('/api/daswos-coins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, coinAmount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    },
  });

  // Handle purchase button click
  const handlePurchase = (packageId: number) => {
    const selectedPackage = coinPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) return;

    if (!user) {
      // Redirect to login page if not logged in
      toast({
        title: 'Login Required',
        description: 'Please log in to purchase DasWos Coins',
        variant: 'default',
      });
      navigate('/auth?redirect=/daswos-coins');
      return;
    }

    createCheckoutSession.mutate({
      amount: selectedPackage.price,
      coinAmount: selectedPackage.amount,
    });
  };

  // Check for successful purchase or quick purchase amount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const quickPurchaseAmount = urlParams.get('amount');

    if (sessionId) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, '/daswos-coins');

      // Show success message
      toast({
        title: 'Purchase Successful',
        description: 'Your DasWos Coins have been added to your account',
        variant: 'default',
      });

      // Refresh the balance
      queryClient.invalidateQueries({ queryKey: ['/api/daswos-coins/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daswos-coins/transactions'] });

      // Switch to history tab
      setActiveTab('history');
    } else if (quickPurchaseAmount) {
      // Handle quick purchase
      const amount = parseInt(quickPurchaseAmount);
      const selectedPackage = coinPackages.find(pkg => pkg.amount === amount);

      if (selectedPackage) {
        // Clear the URL parameters
        window.history.replaceState({}, document.title, '/daswos-coins');

        // Trigger purchase
        if (user) {
          createCheckoutSession.mutate({
            amount: selectedPackage.price,
            coinAmount: selectedPackage.amount,
          });
        } else {
          // If not logged in, show message
          toast({
            title: 'Login Required',
            description: 'Please log in to purchase DasWos Coins',
            variant: 'default',
          });
          navigate('/auth?redirect=/daswos-coins');
        }
      }
    }
  }, [toast, queryClient, user, navigate, createCheckoutSession]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">DasWos Coins</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Purchase and manage your DasWos Coins
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <DasWosCoinIcon size={24} className="mr-2" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Balance</p>
            {isBalanceLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-xl font-bold">{balanceData?.balance.toLocaleString() || 0}</p>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy Coins</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coinPackages.map((pkg) => (
              <Card key={pkg.id} className={pkg.popular ? 'border-blue-500' : ''}>
                {pkg.popular && (
                  <div className="bg-blue-500 text-white text-xs font-medium py-1 px-2 text-center">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DasWosCoinIcon size={20} className="mr-2" />
                    {pkg.amount.toLocaleString()} Coins
                  </CardTitle>
                  <CardDescription>
                    Best value for everyday purchases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${pkg.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ${(pkg.price / pkg.amount * 1000).toFixed(2)} per 1,000 coins
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={createCheckoutSession.isPending}
                  >
                    {createCheckoutSession.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Purchase'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">About DasWos Coins</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              DasWos Coins are the digital currency of the DasWos platform. Use them to purchase items from the shop,
              access premium features, and more. Coins are non-refundable and have no cash value.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {!user ? (
            <div className="text-center py-8">
              <p className="mb-4">Please log in to view your transaction history</p>
              <Button onClick={() => navigate('/auth?redirect=/daswos-coins')}>
                Log In
              </Button>
            </div>
          ) : isTransactionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : transactionsData?.transactions?.length === 0 ? (
            <div className="text-center py-8">
              <p>You don't have any transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsData?.transactions?.map((transaction: any) => (
                    <tr key={transaction.transaction_id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{formatDate(transaction.timestamp)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.transaction_type)}
                          <span className="ml-2 capitalize">{transaction.transaction_type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={transaction.to_user_id === user.id ? 'text-green-500' : 'text-red-500'}>
                          {transaction.to_user_id === user.id ? '+' : '-'}
                          {transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">{transaction.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DasWosCoinsPage;
