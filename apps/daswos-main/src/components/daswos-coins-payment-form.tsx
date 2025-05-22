import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, CheckCircle, Lock, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DasWosCoinIcon } from '@/components/daswos-coin-icon';
import { formatDasWosCoins } from '@/lib/utils';

// Load Stripe outside of the component to avoid recreating the Stripe object on every render
// Hardcoded Stripe publishable key for development
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RJyu7H56GWeesIThVgLHAHXKv1GrWrhTNEEuZULBjjFMQlx4PWAKPCLI1ALjLwxYCRFQnpA40XwAjgcdeXWGXoa00XsoIA5oQ';
console.log('Using Stripe publishable key:', STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface DasWosCoinsPaymentFormProps {
  amount: number;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export const DasWosCoinsPaymentForm: React.FC<DasWosCoinsPaymentFormProps> = ({
  amount,
  onSuccess,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const createCheckoutSession = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/payment/create-coins-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            coinAmount: amount,
            metadata: {
              productType: 'daswos_coins'
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();

        // If we have a checkout URL, redirect to it
        if (data.url) {
          window.location.href = data.url;
          return;
        }

        // For backward compatibility
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No checkout URL or client secret returned');
        }
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        console.error('Error creating checkout session:', err);
      } finally {
        setLoading(false);
      }
    };

    createCheckoutSession();
  }, [amount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-center text-gray-600">
          Setting up your payment. Please wait...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onCancel} className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Unable to initialize payment. Please try again later.</AlertDescription>
        </Alert>
        <Button onClick={onCancel} className="w-full">
          Go Back
        </Button>
      </div>
    );
  }

  // Check if we're using a mock client secret (for development)
  if (clientSecret.startsWith('pi_mock')) {
    return (
      <div className="mt-4">
        <div className="space-y-6">
          <div className="bg-amber-50 p-3 rounded-md mb-4">
            <p className="text-sm font-medium text-amber-800">
              Development Mode: Using simulated payment
            </p>
            <p className="text-xs text-amber-700">
              In production, this would show a real Stripe payment form.
            </p>
          </div>

          <div className="space-y-4 p-4 border rounded">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Card Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value="4242 4242 4242 4242"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Expiry</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value="12/25"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">CVC</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value="123"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                // Simulate successful payment
                onSuccess({
                  success: true,
                  amount,
                  balance: amount,
                  isGuest: false
                });
              }}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Simulate Payment (${amount.toFixed(2)})
            </Button>

            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0073e6',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <div className="mt-4">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          amount={amount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

interface CheckoutFormProps {
  amount: number;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/daswos-coins?success=true&amount=${amount}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        console.error('Stripe payment error:', submitError);
        setError(submitError.message || 'An error occurred with your payment. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);

        // Call the purchase API to add coins to the user's account
        try {
          const purchaseResponse = await apiRequest('/api/user/daswos-coins/purchase', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount,
              paymentIntentId: paymentIntent.id,
              metadata: {
                packageName: `${amount} DasWos Coins`,
                purchaseTimestamp: new Date().toISOString()
              }
            }),
          });

          onSuccess(purchaseResponse);
        } catch (purchaseError) {
          console.error('Error adding coins after payment:', purchaseError);
          setError('Payment successful, but there was an issue adding coins to your account. Please contact support.');
        }
      } else {
        setError('Payment processing failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center p-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
        <p className="mb-4">
          You've successfully purchased {formatDasWosCoins(amount)} DasWos Coins.
        </p>
        <Button onClick={() => onSuccess({ success: true, amount })} className="w-full">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-start">
        <Lock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Secure Payment for DasWos Coins
          </p>
          <p className="text-xs text-blue-700 flex items-center">
            <span>You're purchasing </span>
            <DasWosCoinIcon className="mx-1" size={14} />
            <span>{formatDasWosCoins(amount)} for ${amount.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <span className="mr-2">Processing...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default DasWosCoinsPaymentForm;
