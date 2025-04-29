import express from 'express';
import reviewsRoutes from './reviews';

const router = express.Router();

// Register all routes
router.use('/reviews', reviewsRoutes);

export default router;
