import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { optionalAuthentication } from '../middleware/optional-auth';
import Stripe from 'stripe';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        isAdmin?: boolean;
        isSeller?: boolean;
      };
    }
  }
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Import the DasWosCoinService
import DasWosCoinService from '../services/DasWosCoinService';

const router = express.Router();

// Get the current user's coin balance
router.get('/balance', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const balance = await DasWosCoinService.getUserBalance(req.user.id);
    res.json({ balance });
  } catch (error) {
    console.error('Error getting coin balance:', error);
    res.status(500).json({ error: 'Failed to get coin balance' });
  }
});

// Get the current user's transaction history
router.get('/transactions', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await DasWosCoinService.getUserTransactionHistory(req.user.id, limit, offset);
    res.json({ transactions });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
});

// Create a Stripe checkout session for coin purchase
router.post('/purchase', optionalAuthentication, async (req: express.Request, res: express.Response) => {
  try {
    const { amount, coinAmount } = req.body;

    if (!amount || !coinAmount) {
      return res.status(400).json({ error: 'Amount and coinAmount are required' });
    }

    // Calculate price in cents (Stripe uses smallest currency unit)
    const priceInCents = Math.round(parseFloat(amount) * 100);

    // Get the total supply to check if we have enough coins
    const supply = await DasWosCoinService.getTotalSupply();

    if (supply.minted + Number(coinAmount) > supply.total) {
      return res.status(400).json({ error: 'Not enough coins available for purchase' });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${coinAmount} DasWos Coins`,
              description: 'Digital currency for the DasWos platform',
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3003'}/daswos-coins/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3003'}/daswos-coins/cancel`,
      metadata: {
        coinAmount: coinAmount,
        userId: req.user ? req.user.id : null,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata
    const { coinAmount, userId } = session.metadata || {};

    if (!userId) {
      console.error('No user ID provided in session metadata');
      return res.status(400).json({ error: 'No user ID provided' });
    }

    try {
      // Process the coin purchase
      await DasWosCoinService.purchaseCoins(
        parseInt(userId),
        parseInt(coinAmount || '0'),
        session.payment_intent as string
      );

      console.log(`Successfully processed coin purchase for user ${userId}`);
    } catch (error) {
      console.error('Error processing coin purchase:', error);
      // Note: We still return a 200 response to Stripe to acknowledge receipt
      // but log the error for internal handling
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// Transfer coins to another user
router.post('/transfer', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const { toUserId, amount, description } = req.body;

    if (!toUserId || !amount) {
      return res.status(400).json({ error: 'Recipient ID and amount are required' });
    }

    const transaction = await DasWosCoinService.transferCoins(
      req.user.id,
      parseInt(toUserId),
      parseInt(amount),
      description || 'User transfer'
    );

    res.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Error transferring coins:', error);
    res.status(500).json({ error: error.message || 'Failed to transfer coins' });
  }
});

// Admin route to give coins to a user
router.post('/give', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'User ID and amount are required' });
    }

    const transaction = await DasWosCoinService.giveCoins(
      parseInt(userId),
      parseInt(amount),
      reason || 'Admin giveaway'
    );

    res.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Error giving coins:', error);
    res.status(500).json({ error: error.message || 'Failed to give coins' });
  }
});

// Export the router
export { router as default };
