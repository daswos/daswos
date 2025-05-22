import express from 'express';
import reviewsRoutes from './reviews';
import { setupAutoShopRoutes } from './autoshop';
import { storage } from '../storage';
import { createCheckoutRoutes } from './checkout';
import { createStripeConnectRoutes } from './stripe-connect';
import dasWosCoinsRoutes from './dasWosCoinsRoutes';

const router = express.Router();

// Health check endpoint for Render
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register all routes
router.use('/reviews', reviewsRoutes);

// Setup AutoShop routes
setupAutoShopRoutes(router, storage);

// Setup Checkout routes
router.use('/checkout', createCheckoutRoutes(storage));

// Setup Stripe Connect routes
router.use('/stripe-connect', createStripeConnectRoutes(storage));

// Setup DasWos Coins routes
router.use('/daswos-coins', dasWosCoinsRoutes);

export default router;
