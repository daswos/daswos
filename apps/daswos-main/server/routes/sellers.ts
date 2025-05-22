import { Router } from 'express';
import { IStorage } from '../storage';

export function createSellerRoutes(storage: IStorage) {
  const router = Router();

  // Get all sellers
  router.get('/', async (req, res, next) => {
    try {
      const sellers = await storage.getAllSellerVerifications();
      res.json(sellers);
    } catch (error) {
      next(error);
    }
  });

  // Get seller by ID
  router.get('/:id', async (req, res, next) => {
    try {
      const sellerId = parseInt(req.params.id);
      const seller = await storage.getSellerById(sellerId);
      
      if (!seller) {
        return res.status(404).json({ error: 'Seller not found' });
      }
      
      res.json(seller);
    } catch (error) {
      next(error);
    }
  });

  // Create new seller
  router.post('/', async (req, res, next) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Must be logged in to create a seller profile' });
      }
      
      const sellerData = {
        ...req.body,
        userId: req.session.userId
      };
      
      const newSeller = await storage.createSeller(sellerData);
      res.status(201).json(newSeller);
    } catch (error) {
      next(error);
    }
  });

  // Update seller
  router.patch('/:id', async (req, res, next) => {
    try {
      const sellerId = parseInt(req.params.id);
      
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Must be logged in to update a seller profile' });
      }
      
      // Check if the seller belongs to the current user
      const seller = await storage.getSellerById(sellerId);
      if (!seller || seller.user_id !== req.session.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const updatedSeller = await storage.updateSeller(sellerId, req.body);
      res.json(updatedSeller);
    } catch (error) {
      next(error);
    }
  });

  // Get pending seller verifications
  router.get('/verifications/pending', async (req, res, next) => {
    try {
      // This endpoint should be protected for admins only
      const pendingVerifications = await storage.getPendingSellerVerifications();
      res.json(pendingVerifications);
    } catch (error) {
      next(error);
    }
  });

  return router;
}