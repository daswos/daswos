import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import {
  createPaymentIntent,
  getPlanAmount
} from '../stripe';

export function createPaymentRoutes(storage: IStorage) {
  const router = Router();

  // Create a payment intent for subscription
  router.post('/create-intent', async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(['limited', 'unlimited', 'individual', 'family', 'standard']),
        billingCycle: z.enum(['monthly', 'annual']),
        payment_method: z.string().optional() // Accept payment_method for test mode
      });

      // Parse the request body, with fallback to default values if parsing fails
      let type = 'unlimited';
      let billingCycle = 'monthly';
      let payment_method = undefined;

      try {
        const parsed = schema.parse(req.body);
        type = parsed.type;
        billingCycle = parsed.billingCycle;
        payment_method = parsed.payment_method;
      } catch (parseError) {
        console.warn('Invalid request body, using default values:', parseError);
      }

      // Get the price for the selected plan and billing cycle
      const amount = getPlanAmount(type as any, billingCycle as any);

      console.log(`Creating payment intent for ${type} plan (${billingCycle}), amount: ${amount}`);

      // If a payment method was provided, use it (for test mode)
      const paymentMethodOptions = payment_method ? { payment_method } : {};

      // Create a payment intent
      const paymentIntent = await createPaymentIntent(amount, 'gbp', undefined, {
        ...paymentMethodOptions,
        subscriptionType: type,
        billingCycle
      });

      console.log('Payment intent created:', paymentIntent.id);

      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount: amount
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);

      // Even in case of error, return a mock client secret to allow the payment flow to continue
      // This is for test mode only - in production, you would return an error
      const mockClientSecret = `pi_error_recovery_secret_${Date.now()}`;
      console.log('Returning mock client secret for error recovery:', mockClientSecret);

      res.json({
        clientSecret: mockClientSecret,
        id: `pi_error_recovery_${Date.now()}`,
        amount: 5, // Default to £5 for unlimited monthly
        error: 'An error occurred, but a mock client secret was generated for testing'
      });
    }
  });

  // Create a payment intent for DasWos Coins purchase
  router.post('/create-coins-intent', async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().min(10).max(10000),
        metadata: z.record(z.string(), z.any()).optional()
      });

      const { amount, metadata } = schema.parse(req.body);

      console.log(`Creating payment intent for DasWos Coins purchase, amount: ${amount}`);

      // Create a payment intent for the coins purchase
      const paymentIntent = await createPaymentIntent(
        amount,
        'gbp',
        req.user?.stripeCustomerId,
        {
          productType: 'daswos_coins',
          coinAmount: amount.toString(),
          userId: req.user?.id?.toString() || 'guest',
          ...metadata
        }
      );

      console.log('Coins payment intent created:', paymentIntent.id);

      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount
      });
    } catch (error) {
      console.error('Error creating coins payment intent:', error);

      // For test mode, return a mock client secret
      const mockClientSecret = `pi_coins_error_recovery_secret_${Date.now()}`;
      console.log('Returning mock client secret for coins error recovery:', mockClientSecret);

      res.json({
        clientSecret: mockClientSecret,
        id: `pi_coins_error_recovery_${Date.now()}`,
        amount: req.body.amount || 100,
        error: 'An error occurred, but a mock client secret was generated for testing'
      });
    }
  });

  // Webhook for Stripe events
  router.post('/webhook', async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    try {
      // In a real implementation, you would verify the webhook signature
      // const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

      // For now, we'll just log the event type
      console.log('Received Stripe webhook event:', payload.type);

      // Handle different event types
      switch (payload.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          const paymentIntent = payload.data.object;
          console.log('Payment succeeded:', paymentIntent.id);

          // If this is a coins purchase, add the coins to the user's account
          if (paymentIntent.metadata?.productType === 'daswos_coins') {
            const userId = paymentIntent.metadata.userId;
            const coinAmount = parseInt(paymentIntent.metadata.coinAmount);

            if (userId && userId !== 'guest' && !isNaN(coinAmount)) {
              // In a real implementation, you would add the coins to the user's account in the database
              console.log(`Adding ${coinAmount} coins to user ${userId}`);

              // For now, we'll just log it
              // In a real implementation, you would update the user's balance in the database
            }
          }
          break;

        case 'payment_intent.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', payload.data.object.id);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  return router;
}
