import express from 'express';
import reviewsRoutes from './reviews';
import { setupAutoShopRoutes } from './autoshop';
import { storage } from '../storage';

const router = express.Router();

// Register all routes
router.use('/reviews', reviewsRoutes);

// Setup AutoShop routes
setupAutoShopRoutes(router, storage);

export default router;
