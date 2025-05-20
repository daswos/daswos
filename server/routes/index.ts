import express from 'express';
import reviewsRoutes from './reviews';
import { setupAutoShopRoutes } from './autoshop';
import { storage } from '../storage';
import { createCheckoutRoutes } from './checkout';

const router = express.Router();

// Register all routes
router.use('/reviews', reviewsRoutes);

// Setup AutoShop routes
setupAutoShopRoutes(router, storage);

// Setup Checkout routes
router.use('/checkout', createCheckoutRoutes(storage));

export default router;
