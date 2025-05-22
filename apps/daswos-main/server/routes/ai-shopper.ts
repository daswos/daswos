import { Router, Express } from 'express';
import { IStorage } from '../storage';
import { z } from 'zod';

// Schema for generating recommendations
const generateRecommendationsSchema = z.object({
  categories: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  useRandomMode: z.boolean().optional(),
  useSafeSphere: z.boolean().optional()
});

export function setupAiShopperRoutes(app: Express, storage: IStorage): void {
  const router = Router();

  // Get AI shopper recommendations
  router.get('/recommendations', async (req, res) => {
    try {
      // Check if user is authenticated
      const userId = req.isAuthenticated() ? req.user.id : null;

      if (!userId) {
        // For anonymous users, return empty array
        console.log('Anonymous user tried to get recommendations - returning empty array');
        return res.json([]);
      }

      // Get recommendations from storage
      const recommendations = await storage.getAiShopperRecommendationsByUserId(userId);

      // For each recommendation, we need to ensure the product details are included
      const enhancedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          // If product is not already included
          if (!rec.product) {
            const product = await storage.getProductById(rec.productId);
            return {
              ...rec,
              product
            };
          }
          return rec;
        })
      );

      res.json(enhancedRecommendations);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      res.status(500).json({ error: 'Failed to retrieve recommendations' });
    }
  });

  // Generate new recommendations
  router.post('/generate', async (req, res) => {
    try {
      // Check if user is authenticated
      const userId = req.isAuthenticated() ? req.user.id : null;

      // Validate request body
      const { categories, minPrice, maxPrice, useRandomMode, useSafeSphere } = generateRecommendationsSchema.parse(req.body);

      console.log(`Generating AI recommendations for user ${userId || 'anonymous'}`);
      console.log(`Parameters: categories=${categories?.join(',') || 'none'}, price range=${minPrice || 0}-${maxPrice || 'unlimited'}, random=${useRandomMode || false}, safeSphere=${useSafeSphere || false}`);

      // Generate recommendations
      console.log('Calling generateAiRecommendations with params:', {
        userId,
        categories: categories || [],
        minPrice,
        maxPrice,
        useRandomMode,
        useSafeSphere
      });

      const recommendations = await storage.generateAiRecommendations(
        userId,
        categories || [],
        minPrice,
        maxPrice,
        useRandomMode,
        useSafeSphere
      );

      console.log(`Generated ${recommendations.length} recommendations`);
      if (recommendations.length === 0) {
        console.log('No recommendations were generated. Checking if categories exist...');

        // Check if the categories exist in the database
        if (categories && categories.length > 0) {
          const categoryIds = await storage.getCategoryIdsByNames(categories);
          console.log(`Found ${categoryIds.length} category IDs for categories: ${categories.join(', ')}`);

          // If no categories were found, try to get all products
          if (categoryIds.length === 0) {
            console.log('No matching categories found. Trying to get all products...');
            const allProducts = await storage.getProducts('safesphere');
            console.log(`Found ${allProducts.length} total products in the database`);
          }
        }
      }

      res.json(recommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }

      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // Get user purchase history
  router.get('/user-history/purchases', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to view your purchase history' });
      }

      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      // Get purchase history
      const history = await storage.getUserPurchaseHistory(userId, limit);

      // Enhance with product details
      const enhancedHistory = await Promise.all(
        history.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        })
      );

      res.json(enhancedHistory);
    } catch (error) {
      console.error('Error getting user purchase history:', error);
      res.status(500).json({ error: 'Failed to retrieve purchase history' });
    }
  });

  // Get user search history
  router.get('/user-history/searches', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to view your search history' });
      }

      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      // Get search history
      const history = await storage.getUserSearchHistory(userId, limit);

      res.json(history);
    } catch (error) {
      console.error('Error getting user search history:', error);
      res.status(500).json({ error: 'Failed to retrieve search history' });
    }
  });

  // Get user product preferences
  router.get('/user-history/preferences', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to view your product preferences' });
      }

      const userId = req.user.id;

      // Get product preferences
      const preferences = await storage.getUserProductPreferences(userId);

      res.json(preferences);
    } catch (error) {
      console.error('Error getting user product preferences:', error);
      res.status(500).json({ error: 'Failed to retrieve product preferences' });
    }
  });

  // Add recommendation to cart
  router.post('/recommendations/:id/add-to-cart', async (req, res) => {
    try {
      // Check if user is authenticated
      const userId = req.isAuthenticated() ? req.user.id : null;

      const recommendationId = parseInt(req.params.id);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ error: 'Invalid recommendation ID' });
      }

      // Add recommendation to cart
      const cartItem = await storage.addAiRecommendationToCart(userId, recommendationId);

      res.json(cartItem);
    } catch (error) {
      console.error('Error adding recommendation to cart:', error);
      res.status(500).json({ error: 'Failed to add recommendation to cart' });
    }
  });

  // Clear recommendations
  router.post('/recommendations/clear', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        // For anonymous users, just return success without doing anything
        console.log('Anonymous user tried to clear recommendations - returning success without action');
        return res.json({ success: true });
      }

      const userId = req.user.id;

      // Clear recommendations
      await storage.clearAiShopperRecommendations(userId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing recommendations:', error);
      res.status(500).json({ error: 'Failed to clear recommendations' });
    }
  });

  // Update recommendation status
  router.put('/recommendations/:id', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        // For anonymous users, just return success without doing anything
        console.log('Anonymous user tried to update recommendation status - returning success without action');
        return res.json({ success: true });
      }

      const recommendationId = parseInt(req.params.id);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ error: 'Invalid recommendation ID' });
      }

      const { status, reason, removeFromList } = req.body;
      if (!['pending', 'added_to_cart', 'purchased', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Update recommendation status
      const recommendation = await storage.updateAiShopperRecommendationStatus(
        recommendationId,
        status,
        reason,
        removeFromList
      );

      res.json(recommendation);
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      res.status(500).json({ error: 'Failed to update recommendation status' });
    }
  });

  // Register the router
  app.use('/api/ai-shopper', router);
}
