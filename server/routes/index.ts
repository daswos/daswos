import express from 'express';
import reviewsRoutes from './reviews';
import { setupAutoShopRoutes } from './autoshop';
import { storage } from '../storage';
import { createCheckoutRoutes } from './checkout';
import { createStripeConnectRoutes } from './stripe-connect';
import dasWosCoinsRoutes from './dasWosCoinsRoutes';

const router = express.Router();

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
