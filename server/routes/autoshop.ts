import { Router, Express } from 'express';
import { IStorage } from '../storage';
import { z } from 'zod';

export function setupAutoShopRoutes(app: Express, storage: IStorage): void {
  const router = Router();

  // AutoShop settings endpoint
  router.post('/settings', async (req, res) => {
    try {
      // Allow non-authenticated users to access AutoShop
      const userId = req.isAuthenticated() ? req.user.id : null;

      // Validate settings
      const schema = z.object({
        maxTotalCoins: z.number().min(0).default(1000),
        minItemPrice: z.number().min(0).default(100),
        maxItemPrice: z.number().min(0).default(500),
        duration: z.object({
          value: z.number().min(1).default(30),
          unit: z.enum(['minutes', 'hours', 'days']).default('minutes')
        }),
        categories: z.array(z.string()).default([]),
        useRandomMode: z.boolean().default(false)
      });

      const settings = schema.parse(req.body);

      // Store settings in session
      req.session.autoShopSettings = settings;

      // Start AutoShop process
      if (!req.session.autoShopActive) {
        req.session.autoShopActive = true;
        req.session.autoShopStartTime = new Date().toISOString();

        // Calculate end time
        const endTime = new Date();
        if (settings.duration.unit === 'minutes') {
          endTime.setMinutes(endTime.getMinutes() + settings.duration.value);
        } else if (settings.duration.unit === 'hours') {
          endTime.setHours(endTime.getHours() + settings.duration.value);
        } else if (settings.duration.unit === 'days') {
          endTime.setDate(endTime.getDate() + settings.duration.value);
        }

        req.session.autoShopEndTime = endTime.toISOString();

        // Start the AutoShop process by selecting the first item
        await selectRandomProduct(req, storage);
      }

      res.json({
        success: true,
        message: 'AutoShop settings saved and process started',
        settings: req.session.autoShopSettings,
        endTime: req.session.autoShopEndTime
      });
    } catch (error) {
      console.error('Error saving AutoShop settings:', error);
      res.status(500).json({ error: 'Failed to save AutoShop settings' });
    }
  });

  // Helper function to select a random product for AutoShop
  async function selectRandomProduct(req: any, storage: IStorage) {
    try {
      // Check if AutoShop is active
      if (!req.session.autoShopActive) {
        return;
      }

      // Check if end time has passed
      const endTime = new Date(req.session.autoShopEndTime);
      if (new Date() > endTime) {
        req.session.autoShopActive = false;
        return;
      }

      // Check if user has enough coins
      if (!req.session.dasWosCoins) {
        req.session.dasWosCoins = 0;
      }

      const settings = req.session.autoShopSettings;
      if (req.session.dasWosCoins < settings.minItemPrice) {
        console.log('Not enough coins for AutoShop to continue');
        return;
      }

      // Get products based on settings
      const sphere = 'opensphere'; // Default to opensphere
      const products = await storage.getProducts(sphere);

      // Filter products by price range
      const filteredProducts = products.filter(product =>
        product.price >= settings.minItemPrice &&
        product.price <= settings.maxItemPrice &&
        product.price <= req.session.dasWosCoins
      );

      if (filteredProducts.length === 0) {
        console.log('No products found matching AutoShop criteria');
        return;
      }

      // Select a random product
      const randomIndex = Math.floor(Math.random() * filteredProducts.length);
      const selectedProduct = filteredProducts[randomIndex];

      // Create a recommendation
      const recommendation = {
        id: Date.now(),
        productId: selectedProduct.id,
        userId: req.isAuthenticated() ? req.user.id : null,
        reason: 'Selected by AutoShop',
        confidence: 0.9,
        status: 'pending',
        createdAt: new Date(),
        product: selectedProduct
      };

      // Add to session recommendations
      if (!req.session.autoShopRecommendations) {
        req.session.autoShopRecommendations = [];
      }

      req.session.autoShopRecommendations.unshift(recommendation);

      // Spend coins
      req.session.dasWosCoins -= selectedProduct.price;

      // Record the transaction
      if (!req.session.dasWosCoinsTransactions) {
        req.session.dasWosCoinsTransactions = [];
      }

      const transaction = {
        id: Date.now(),
        userId: req.isAuthenticated() ? req.user.id : null,
        amount: selectedProduct.price,
        type: 'spend',
        description: `AutoShop purchased: ${selectedProduct.title || selectedProduct.name}`,
        status: 'completed',
        metadata: {
          productId: selectedProduct.id,
          autoShop: true
        },
        createdAt: new Date()
      };

      req.session.dasWosCoinsTransactions.unshift(transaction);

      console.log(`AutoShop purchased ${selectedProduct.title || selectedProduct.name} for ${selectedProduct.price} coins`);

      // Schedule next product selection (1 minute interval)
      setTimeout(() => {
        selectRandomProduct(req, storage);
      }, 60000); // 1 minute
    } catch (error) {
      console.error('Error in AutoShop product selection:', error);
    }
  }

  // Get pending AutoShop purchases
  router.get('/pending', async (req, res) => {
    try {
      // Check if we have session recommendations
      if (req.session.autoShopRecommendations && req.session.autoShopRecommendations.length > 0) {
        // Return the session recommendations
        const pendingItems = req.session.autoShopRecommendations
          .filter(rec => rec.status === 'pending')
          .map(rec => {
            const product = rec.product || {};
            return {
              id: rec.id,
              productId: rec.productId,
              name: product.title || product.name || 'Unknown Product',
              description: product.description || 'No description available',
              estimatedPrice: product.price || 0,
              imageUrl: product.imageUrl || product.image_url,
              category: product.category || 'Uncategorized',
              addedAt: rec.createdAt,
              confidence: rec.confidence || 0
            };
          });

        return res.json(pendingItems);
      }

      // Fallback to database if no session recommendations
      const userId = req.isAuthenticated() ? req.user.id : null;

      // Get pending recommendations from AI shopper
      const recommendations = await storage.getAiShopperRecommendationsByUserId(userId);

      // For each recommendation, we need to ensure the product details are included
      const pendingItems = await Promise.all(
        recommendations
          .filter(rec => rec.status === 'pending')
          .map(async (rec) => {
            // If product is not already included
            if (!rec.product) {
              const product = await storage.getProductById(rec.productId);
              return {
                id: rec.id,
                productId: rec.productId,
                name: product?.name || product?.title || 'Unknown Product',
                description: product?.description || 'No description available',
                estimatedPrice: product?.price || 0,
                imageUrl: product?.imageUrl || product?.image_url,
                category: product?.category || 'Uncategorized',
                addedAt: rec.createdAt,
                confidence: rec.confidence || 0
              };
            }
            return {
              id: rec.id,
              productId: rec.productId,
              name: rec.product.name || rec.product.title,
              description: rec.product.description,
              estimatedPrice: rec.product.price,
              imageUrl: rec.product.imageUrl || rec.product.image_url,
              category: rec.product.category,
              addedAt: rec.createdAt,
              confidence: rec.confidence || 0
            };
          })
      );

      res.json(pendingItems);
    } catch (error) {
      console.error('Error getting pending purchases:', error);
      res.status(500).json({ error: 'Failed to retrieve pending purchases' });
    }
  });

  // Get AutoShop order history
  router.get('/history', async (req, res) => {
    try {
      // Check if we have session recommendations
      if (req.session.autoShopRecommendations && req.session.autoShopRecommendations.length > 0) {
        // Return the session recommendations
        const orderHistory = req.session.autoShopRecommendations
          .filter(rec => rec.status === 'purchased' || rec.status === 'added_to_cart')
          .map(rec => {
            const product = rec.product || {};
            return {
              id: rec.id,
              productId: rec.productId,
              name: product.title || product.name || 'Unknown Product',
              description: product.description || 'No description available',
              price: product.price || 0,
              imageUrl: product.imageUrl || product.image_url,
              category: product.category || 'Uncategorized',
              purchasedAt: rec.updatedAt || rec.createdAt,
              status: rec.status
            };
          });

        return res.json(orderHistory);
      }

      // Fallback to database if no session recommendations
      const userId = req.isAuthenticated() ? req.user.id : null;

      // Get recommendations from AI shopper
      const recommendations = await storage.getAiShopperRecommendationsByUserId(userId);

      // For each recommendation, we need to ensure the product details are included
      const orderHistory = await Promise.all(
        recommendations
          .filter(rec => rec.status === 'purchased' || rec.status === 'added_to_cart')
          .map(async (rec) => {
            // If product is not already included
            if (!rec.product) {
              const product = await storage.getProductById(rec.productId);
              return {
                id: rec.id,
                productId: rec.productId,
                name: product?.name || product?.title || 'Unknown Product',
                description: product?.description || 'No description available',
                price: product?.price || 0,
                imageUrl: product?.imageUrl || product?.image_url,
                category: product?.category || 'Uncategorized',
                purchasedAt: rec.updatedAt || rec.createdAt,
                status: rec.status
              };
            }
            return {
              id: rec.id,
              productId: rec.productId,
              name: rec.product.name || rec.product.title,
              description: rec.product.description,
              price: rec.product.price,
              imageUrl: rec.product.imageUrl || rec.product.image_url,
              category: rec.product.category,
              purchasedAt: rec.updatedAt || rec.createdAt,
              status: rec.status
            };
          })
      );

      res.json(orderHistory);
    } catch (error) {
      console.error('Error getting order history:', error);
      res.status(500).json({ error: 'Failed to retrieve order history' });
    }
  });

  // Start AutoShop
  router.post('/start', async (req, res) => {
    try {
      // Check if user has DasWos coins
      if (!req.session.dasWosCoins) {
        req.session.dasWosCoins = 0;
      }

      if (req.session.dasWosCoins <= 0) {
        return res.status(400).json({
          error: 'Insufficient DasWos Coins',
          message: 'You need DasWos Coins to use AutoShop. Please purchase some coins first.'
        });
      }

      // Use default settings if none provided
      const settings = {
        maxTotalCoins: 1000,
        minItemPrice: 100,
        maxItemPrice: 500,
        duration: {
          value: 30,
          unit: 'minutes'
        },
        categories: [],
        useRandomMode: true
      };

      // Store settings in session
      req.session.autoShopSettings = settings;

      // Start AutoShop process
      req.session.autoShopActive = true;
      req.session.autoShopStartTime = new Date().toISOString();

      // Calculate end time
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + settings.duration.value);
      req.session.autoShopEndTime = endTime.toISOString();

      // Initialize recommendations array if it doesn't exist
      if (!req.session.autoShopRecommendations) {
        req.session.autoShopRecommendations = [];
      }

      // Start the AutoShop process by selecting the first item
      await selectRandomProduct(req, storage);

      res.json({
        success: true,
        message: 'AutoShop started successfully',
        settings: req.session.autoShopSettings,
        endTime: req.session.autoShopEndTime
      });
    } catch (error) {
      console.error('Error starting AutoShop:', error);
      res.status(500).json({ error: 'Failed to start AutoShop' });
    }
  });

  // Stop AutoShop
  router.post('/stop', async (req, res) => {
    try {
      req.session.autoShopActive = false;

      res.json({
        success: true,
        message: 'AutoShop stopped successfully'
      });
    } catch (error) {
      console.error('Error stopping AutoShop:', error);
      res.status(500).json({ error: 'Failed to stop AutoShop' });
    }
  });

  // Get AutoShop status
  router.get('/status', async (req, res) => {
    try {
      const active = req.session.autoShopActive || false;
      const startTime = req.session.autoShopStartTime ? new Date(req.session.autoShopStartTime) : null;
      const endTime = req.session.autoShopEndTime ? new Date(req.session.autoShopEndTime) : null;
      const settings = req.session.autoShopSettings || null;

      res.json({
        active,
        startTime,
        endTime,
        settings,
        pendingCount: req.session.autoShopRecommendations ?
          req.session.autoShopRecommendations.filter(rec => rec.status === 'pending').length : 0,
        historyCount: req.session.autoShopRecommendations ?
          req.session.autoShopRecommendations.filter(rec => rec.status === 'purchased' || rec.status === 'added_to_cart').length : 0
      });
    } catch (error) {
      console.error('Error getting AutoShop status:', error);
      res.status(500).json({ error: 'Failed to get AutoShop status' });
    }
  });

  // Register the router
  app.use('/api/user/autoshop', router);
}
