import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Lock, Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SimpleStripeFormProps {
  selectedPlan: 'limited' | 'unlimited' | 'individual' | 'family';
  billingCycle: 'monthly' | 'annual';
  onSuccess: () => void;
  onCancel: () => void;
}

export const SimpleStripeForm: React.FC<SimpleStripeFormProps> = ({
  selectedPlan,
  billingCycle,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const amount = selectedPlan === 'unlimited' ? (billingCycle === 'monthly' ? 5 : 50) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError('Please enter your name');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Processing test payment for', selectedPlan, 'plan with', billingCycle, 'billing cycle');

      // Generate test IDs for simulation
      const testPaymentIntentId = 'pi_test_' + Date.now();
      const testCustomerId = 'cus_test_' + Date.now();
      const testSubscriptionId = 'sub_test_' + Date.now();

      console.log('Generated test IDs:', {
        paymentIntentId: testPaymentIntentId,
        customerId: testCustomerId,
        subscriptionId: testSubscriptionId
      });

      // Directly update the user's subscription
      console.log('Updating user subscription in test mode...');
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedPlan,
          billingCycle,
          paymentIntentId: testPaymentIntentId,
          stripeCustomerId: testCustomerId,
          stripeSubscriptionId: testSubscriptionId,
          action: 'subscribe',
          testMode: true // Add flag to indicate this is a test mode subscription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }

      setSucceeded(true);
      onSuccess();
    } catch (err) {
      console.error('Subscription error:', err);
      setError('An unexpected error occurred. Please try again.');
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
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <Button
          type="submit"
          disabled={isProcessing}
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




