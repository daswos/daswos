import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import { 
  createPaymentIntent,
  getPlanAmount
} from '../stripe';

export function createPaymentRoutes(storage: IStorage) {
  const router = Router();

  // Create a payment intent
  router.post('/create-intent', async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(['limited', 'unlimited', 'individual', 'family']),
        billingCycle: z.enum(['monthly', 'annual']),
        payment_method: z.string().optional() // Accept payment_method for test mode
      });
      
      const { type, billingCycle, payment_method } = schema.parse(req.body);
      
      // Get the price for the selected plan and billing cycle
      const amount = getPlanAmount(type, billingCycle);
      
      console.log(`Creating payment intent for ${type} plan (${billingCycle}), amount: ${amount}`);
      
      // If a payment method was provided, use it (for test mode)
      const paymentMethodOptions = payment_method ? { payment_method } : {};
      
      // Create a payment intent
      const paymentIntent = await createPaymentIntent(amount, undefined, undefined, paymentMethodOptions);
      
      console.log('Payment intent created:', paymentIntent.id);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount: amount
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  return router;
}
