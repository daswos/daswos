import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import { 
  createCustomer, 
  createSubscription, 
  getPriceId 
} from '../stripe';

export function createStripeRoutes(storage: IStorage) {
  const router = Router();

  // Create a Stripe customer
  router.post('/create-customer', async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        name: z.string()
      });

      const { email, name } = schema.parse(req.body);

      // Create a customer in Stripe
      const customerId = await createCustomer(email, name);

      res.json({ 
        success: true, 
        customerId 
      });
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid customer data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create Stripe customer" });
    }
  });

  // Create a Stripe subscription
  router.post('/create-subscription', async (req, res) => {
    try {
      const schema = z.object({
        customerId: z.string(),
        paymentMethodId: z.string(),
        planType: z.enum(['limited', 'unlimited', 'individual', 'family', 'standard']),
        billingCycle: z.enum(['monthly', 'annual'])
      });

      const { customerId, paymentMethodId, planType, billingCycle } = schema.parse(req.body);

      // For free plans, we don't need to create a subscription
      if (planType === 'limited' || planType === 'standard') {
        return res.json({
          success: true,
          subscriptionId: 'free_plan_no_subscription'
        });
      }

      // Get the price ID for the plan
      const priceId = getPriceId(planType, billingCycle);

      // Create metadata for the subscription
      const metadata = {
        planType,
        billingCycle
      };

      // Create a subscription in Stripe
      const subscription = await createSubscription(
        customerId,
        priceId,
        paymentMethodId,
        metadata
      );

      res.json({
        success: true,
        subscriptionId: subscription.id
      });
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create Stripe subscription" });
    }
  });

  // Stripe webhook handler
  router.post('/webhook', async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    try {
      // TODO: Implement webhook verification and handling
      // This would handle events like subscription.updated, subscription.deleted, etc.

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  });

  return router;
}
