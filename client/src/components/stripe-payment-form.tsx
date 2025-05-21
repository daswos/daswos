import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions, Appearance } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Load the Stripe instance outside the component to avoid reloading it
// Hardcoded Stripe publishable key for development
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RJyu7H56GWeesIThVgLHAHXKv1GrWrhTNEEuZULBjjFMQlx4PWAKPCLI1ALjLwxYCRFQnpA40XwAjgcdeXWGXoa00XsoIA5oQ';
console.log('Using Stripe publishable key:', STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// User registration data interface
interface RegistrationData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

interface StripeWrapperProps {
  selectedPlan: 'limited' | 'unlimited' | 'individual' | 'family';
  billingCycle: 'monthly' | 'annual';
  registrationData?: RegistrationData; // Optional for existing users
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({
  selectedPlan,
  billingCycle,
  registrationData,
  onSuccess,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const createPaymentIntent = async () => {
      setLoading(true);
      try {
        // For free plans, we don't need to create a payment intent
        if (selectedPlan === 'limited') {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedPlan,
            billingCycle
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        console.error('Error creating payment intent:', err);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [selectedPlan, billingCycle]);

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
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={onCancel} className="mt-4 w-full">
          Go Back
        </Button>
      </Alert>
    );
  }

  // For free plans, we don't need a client secret
  if (!clientSecret && selectedPlan !== 'limited') {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to Initialize Payment</AlertTitle>
        <AlertDescription>
          We couldn't set up a secure payment session. Please try again later.
        </AlertDescription>
        <Button onClick={onCancel} className="mt-4 w-full">
          Go Back
        </Button>
      </Alert>
    );
  }

  // For free plans, show a simplified form
  if (selectedPlan === 'limited') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Daswos Limited (Free Plan)
            </p>
            <p className="text-xs text-blue-700">
              No payment required. Enjoy our free features!
            </p>
          </div>
        </div>

        <Button
          onClick={async () => {
            setLoading(true);
            try {
              if (registrationData) {
                // New user flow - register with free plan
                const response = await fetch('/api/register-with-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...registrationData,
                    type: 'limited',
                    billingCycle: 'monthly',
                    paymentIntentId: 'free_plan_no_payment'
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create account');
                }
              } else {
                // Existing user flow - update subscription to free plan
                const response = await fetch('/api/user/subscription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'limited',
                    billingCycle: 'monthly',
                    action: 'subscribe'
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to update subscription');
                }
              }

              onSuccess();
            } catch (err) {
              console.error('Error processing free plan:', err);
              setError('Failed to process your request. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <span className="mr-2">Processing...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            'Activate Free Plan'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    );
  }

  const options: StripeElementsOptions = {
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
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          registrationData={registrationData}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

interface CheckoutFormProps {
  amount: number;
  selectedPlan: 'limited' | 'unlimited' | 'individual' | 'family';
  billingCycle: 'monthly' | 'annual';
  registrationData?: RegistrationData; // Optional for existing users
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  selectedPlan,
  billingCycle,
  registrationData,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // First, create a Stripe customer if this is a new user
      if (registrationData) {
        try {
          const customerResponse = await fetch('/api/stripe/create-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: registrationData.email,
              name: registrationData.fullName
            }),
          });

          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            setStripeCustomerId(customerData.customerId);
          }
        } catch (err) {
          console.error('Error creating Stripe customer:', err);
          // Continue with payment even if customer creation fails
        }
      }

      // Confirm the payment with better error handling
      console.log('Confirming payment with Stripe...');
      try {
        const { error: submitError, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/safesphere-subscription?success=true`,
          },
          redirect: 'if_required',
        });

        console.log('Payment confirmation result:', submitError ? 'Error' : 'Success', paymentIntent?.status);

        if (submitError) {
          console.error('Stripe payment error:', submitError);
          setError(submitError.message || 'An error occurred with your payment. Please try again.');
          return; // Exit early on error
        }

        if (!paymentIntent) {
          console.error('No payment intent returned from Stripe');
          setError('Payment processing failed. Please try again.');
          return; // Exit early if no payment intent
        }

        if (paymentIntent.status === 'succeeded') {
        // Payment successful, now create a subscription in Stripe
        try {
          const paymentMethod = paymentIntent.payment_method;

          if (paymentMethod) {
            const subscriptionResponse = await fetch('/api/stripe/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: stripeCustomerId,
                paymentMethodId: paymentMethod,
                planType: selectedPlan,
                billingCycle
              }),
            });

            if (subscriptionResponse.ok) {
              const subscriptionData = await subscriptionResponse.json();
              setStripeSubscriptionId(subscriptionData.subscriptionId);
            }
          }
        } catch (err) {
          console.error('Error creating Stripe subscription:', err);
          // Continue with account creation even if subscription creation fails
        }

        // Now register the user or update subscription depending on context
        if (registrationData) {
          // New user flow - register with payment
          const response = await fetch('/api/register-with-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...registrationData,
              type: selectedPlan,
              billingCycle,
              paymentIntentId: paymentIntent.id,
              stripeCustomerId,
              stripeSubscriptionId
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create account after payment');
          }
        } else {
          // Existing user flow - update subscription
          const response = await fetch('/api/user/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: selectedPlan,
              billingCycle,
              paymentIntentId: paymentIntent.id,
              stripeCustomerId,
              stripeSubscriptionId,
              action: 'subscribe'
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update subscription');
          }
        }

        setSucceeded(true);
        onSuccess();

        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
      } catch (stripeError) {
        console.error('Error during Stripe payment confirmation:', stripeError);
        setError('Payment processing error. Please try again or use a different payment method.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-start">
        <Lock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Secure Payment for {
              selectedPlan === 'limited' ? 'Daswos Limited' :
              selectedPlan === 'unlimited' ? 'Daswos Unlimited' :
              selectedPlan === 'individual' ? 'Individual (Legacy)' : 'Family (Legacy)'
            } Plan
          </p>
          <p className="text-xs text-blue-700">
            {billingCycle === 'monthly'
              ? `Monthly billing at £${amount}`
              : `Annual billing at £${amount} (Save £${
                  selectedPlan === 'limited' ? '0' :
                  selectedPlan === 'unlimited' ? '19.98' :
                  selectedPlan === 'individual' ? '6' : '14'
                })`}
          </p>
        </div>
      </div>

      <PaymentElement />

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
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            `Pay £${amount}`
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 sm:flex-initial"
        >
          Cancel
        </Button>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p className="flex items-center">
          <Lock className="h-3 w-3 mr-1" />
          Your payment is secured with SSL encryption. We do not store your card details.
        </p>
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
            <p className="font-medium">Test Mode</p>
            <p>Use Stripe test card: 4242 4242 4242 4242</p>
            <p>Any future date, any 3 digits for CVC, any postal code</p>
          </div>
        )}
      </div>
    </form>
  );
};