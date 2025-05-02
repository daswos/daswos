import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Lock, Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Load Stripe outside of the component to avoid recreating the Stripe object on every render
// Use a fallback empty string if the env variable is not defined
// Using type assertion to handle Vite environment variables
const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Define types for our payment process
interface SimpleStripeFormProps {
  selectedPlan: 'limited' | 'unlimited' | 'individual' | 'family';
  billingCycle: 'monthly' | 'annual';
  onSuccess: () => void;
  onCancel: () => void;
}

// Wrapper component that provides Stripe Elements context
export const SimpleStripeForm: React.FC<SimpleStripeFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

// The actual form component that uses Stripe hooks
const StripeCheckoutForm: React.FC<SimpleStripeFormProps> = ({
  selectedPlan,
  billingCycle,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  // Calculate amount based on plan and billing cycle
  const amount = selectedPlan === 'unlimited' ? (billingCycle === 'monthly' ? 5 : 50) : 0;

  // Create a payment intent when the component mounts
  const createPaymentIntent = async () => {
    try {
      setIsProcessing(true);

      // Skip payment intent creation for free plans
      if (amount === 0) {
        setPaymentInitialized(true);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedPlan,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setClientSecret(data.clientSecret);
      setPaymentInitialized(true);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Call createPaymentIntent when the component mounts
  useEffect(() => {
    createPaymentIntent();
  }, [selectedPlan, billingCycle]);

  // Update the user's subscription after payment
  const updateSubscription = async (paymentIntentId: string | null) => {
    try {
      const subscriptionResponse = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedPlan,
          billingCycle,
          paymentIntentId: paymentIntentId,
          action: 'subscribe',
          testMode: true // Use test mode for now
        }),
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }

      setSucceeded(true);
      onSuccess();
    } catch (err) {
      console.error('Subscription update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription. Please try again.');
      throw err; // Re-throw to handle in the calling function
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      setError('Please enter your name');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // For free plans, just update the subscription
      if (amount === 0) {
        await updateSubscription(null);
        return;
      }

      // For paid plans, process the payment first
      if (!stripe || !elements || !clientSecret) {
        throw new Error('Stripe has not been properly initialized');
      }

      // In a real implementation, we would use CardElement for payment
      // For test mode, we'll use a test token
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            token: 'tok_visa', // Use a test token for Stripe test mode
          },
          billing_details: {
            name: name,
            email: email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment successful, update user subscription
        await updateSubscription(paymentIntent.id);
      } else {
        throw new Error('Payment failed or was not completed');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <h3 className="font-medium text-blue-800 mb-2">Test Mode Payment</h3>
          <p className="text-sm text-blue-700 mb-2">
            This is a test mode payment for the {selectedPlan === 'unlimited' ? 'Daswos Unlimited' : 'Daswos Limited'} plan.
            No actual payment will be processed.
          </p>
          <p className="text-sm text-blue-700">
            In production, real payments would be securely processed through Stripe.
          </p>
        </div>

        <div>
          <Label htmlFor="cardName">Your Name</Label>
          <Input
            id="cardName"
            placeholder="John Smith"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            disabled={isProcessing || succeeded}
          />
        </div>

        <div>
          <Label htmlFor="cardEmail">Your Email</Label>
          <Input
            id="cardEmail"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={isProcessing || succeeded}
          />
        </div>

        {/* Show payment information for paid plans */}
        {amount > 0 && paymentInitialized && !succeeded && (
          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-2">Payment Information</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedPlan === 'unlimited' ? 'Daswos Unlimited' : 'Daswos Limited'} -
              {billingCycle === 'monthly' ? ' £5/month' : ' £50/year'}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              In test mode, no real payment will be processed. Click "Activate Plan" to simulate a successful payment.
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {succeeded && (
        <Alert variant="default" className="bg-green-50 my-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>Your subscription has been activated!</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        {!succeeded && (
          <Button
            type="submit"
            disabled={isProcessing || !paymentInitialized}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-4 w-4" />
                Processing...
              </>
            ) : (
              `Activate ${selectedPlan === 'unlimited' ? 'Unlimited' : 'Limited'} Plan (Test Mode)`
            )}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 sm:flex-initial"
        >
          {succeeded ? 'Close' : 'Cancel'}
        </Button>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p className="flex items-center">
          <Lock className="h-3 w-3 mr-1" />
          Your payment is secured with SSL encryption. We do not store your card details.
        </p>
        <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
          <p className="font-medium">Test Mode Active</p>
          <p>This is a simulated payment for testing purposes</p>
          <p>Your subscription will be updated immediately</p>
          <p>No actual payment will be processed</p>
        </div>
      </div>
    </form>
  );
};
