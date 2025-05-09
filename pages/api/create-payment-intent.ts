import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { amount, selectedPlan, billingCycle } = req.body;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects amounts in cents
        currency: 'gbp',
        // In production, you'd want to store this information
        metadata: { selectedPlan, billingCycle },
      });

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err instanceof Error ? err.message : 'An error occurred' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}