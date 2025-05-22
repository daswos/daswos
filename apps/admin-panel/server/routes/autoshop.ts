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

  // Helper function to finalize AutoShop purchases when timer completes
  async function finalizeAutoShopPurchases(req: any) {
    try {
      // Get all pending recommendations
      const pendingRecommendations = req.session.autoShopRecommendations
        ? req.session.autoShopRecommendations.filter(rec => rec.status === 'pending')
        : [];

      console.log(`AutoShop timer completed: Finalizing ${pendingRecommendations.length} pending purchases`);

      // Process each pending recommendation
      for (const rec of pendingRecommendations) {
        // Update the recommendation status to 'purchased'
        rec.status = 'purchased';
        rec.updatedAt = new Date();

        // Find the corresponding transaction
        const transactionIndex = req.session.dasWosCoinsTransactions.findIndex(
          (t: any) => t.metadata && t.metadata.recommendationId === rec.id
        );

        if (transactionIndex !== -1) {
          // Update the transaction status to 'completed'
          const transaction = req.session.dasWosCoinsTransactions[transactionIndex];
          transaction.status = 'completed';
          transaction.type = 'spend';
          transaction.description = transaction.description.replace('reserved', 'purchased');

          req.session.dasWosCoinsTransactions[transactionIndex] = transaction;
        }

        console.log(`AutoShop finalized purchase: ${rec.product.title || rec.product.name} for ${rec.product.price} coins`);
      }
    } catch (error) {
      console.error('Error finalizing AutoShop purchases:', error);
    }
  }

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
        // AutoShop timer has completed, finalize purchases
        await finalizeAutoShopPurchases(req);
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

      // Reserve coins (not actually spent until purchase is confirmed)
      // We still deduct from the available balance to prevent overspending
      req.session.dasWosCoins -= selectedProduct.price;

      // Record the transaction as 'reserved' instead of 'spend'
      if (!req.session.dasWosCoinsTransactions) {
        req.session.dasWosCoinsTransactions = [];
      }

      const transaction = {
        id: Date.now(),
        userId: req.isAuthenticated() ? req.user.id : null,
        amount: selectedProduct.price,
        type: 'reserve',  // Changed from 'spend' to 'reserve'
        description: `AutoShop reserved: ${selectedProduct.title || selectedProduct.name}`,
        status: 'pending', // Changed from 'completed' to 'pending'
        metadata: {
          productId: selectedProduct.id,
          autoShop: true,
          recommendationId: recommendation.id // Link to the recommendation
        },
        createdAt: new Date()
      };

      req.session.dasWosCoinsTransactions.unshift(transaction);

      // Store the transaction ID in the recommendation for reference
      recommendation.transactionId = transaction.id;

      console.log(`AutoShop reserved ${selectedProduct.title || selectedProduct.name} for ${selectedProduct.price} coins`);

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

      // Fallback to empty array if no session recommendations
      // We're not using database fallback since the function doesn't exist
      const pendingItems = [];

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

      // Fallback to empty array if no session recommendations
      // We're not using database fallback since the function doesn't exist
      const orderHistory = [];

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
      // Get the pending recommendations before stopping
      const pendingRecommendations = req.session.autoShopRecommendations
        ? req.session.autoShopRecommendations.filter(rec => rec.status === 'pending')
        : [];

      // Calculate total coins to refund
      let coinsToRefund = 0;
      for (const rec of pendingRecommendations) {
        if (rec.product && rec.product.price) {
          coinsToRefund += rec.product.price;
        }
      }

      // Refund the coins
      if (coinsToRefund > 0) {
        // Add the coins back to the user's balance
        if (!req.session.dasWosCoins) {
          req.session.dasWosCoins = 0;
        }
        req.session.dasWosCoins += coinsToRefund;

        // Record the refund transaction
        if (!req.session.dasWosCoinsTransactions) {
          req.session.dasWosCoinsTransactions = [];
        }

        const refundTransaction = {
          id: Date.now(),
          userId: req.isAuthenticated() ? req.user.id : null,
          amount: coinsToRefund,
          type: 'refund',
          description: `AutoShop cancelled: Refunded ${coinsToRefund} coins for ${pendingRecommendations.length} pending items`,
          status: 'completed',
          metadata: {
            autoShop: true,
            refundReason: 'cancelled'
          },
          createdAt: new Date()
        };

        req.session.dasWosCoinsTransactions.unshift(refundTransaction);

        console.log(`AutoShop cancelled: Refunded ${coinsToRefund} coins for ${pendingRecommendations.length} pending items`);
      }

      // Mark AutoShop as inactive
      req.session.autoShopActive = false;

      res.json({
        success: true,
        message: 'AutoShop stopped successfully',
        coinsRefunded: coinsToRefund
      });
    } catch (error) {
      console.error('Error stopping AutoShop:', error);
      res.status(500).json({ error: 'Failed to stop AutoShop' });
    }
  });

  // Clear all pending items
  router.post('/clear', async (req, res) => {
    try {
      // Get the pending recommendations before clearing
      const pendingRecommendations = req.session.autoShopRecommendations
        ? req.session.autoShopRecommendations.filter(rec => rec.status === 'pending')
        : [];

      // Calculate total coins to refund
      let coinsToRefund = 0;
      for (const rec of pendingRecommendations) {
        if (rec.product && rec.product.price) {
          coinsToRefund += rec.product.price;
        }
      }

      // Refund the coins
      if (coinsToRefund > 0) {
        // Add the coins back to the user's balance
        if (!req.session.dasWosCoins) {
          req.session.dasWosCoins = 0;
        }
        req.session.dasWosCoins += coinsToRefund;

        // Record the refund transaction
        if (!req.session.dasWosCoinsTransactions) {
          req.session.dasWosCoinsTransactions = [];
        }

        const refundTransaction = {
          id: Date.now(),
          userId: req.isAuthenticated() ? req.user.id : null,
          amount: coinsToRefund,
          type: 'refund',
          description: `AutoShop cleared: Refunded ${coinsToRefund} coins for ${pendingRecommendations.length} pending items`,
          status: 'completed',
          metadata: {
            autoShop: true,
            refundReason: 'cleared'
          },
          createdAt: new Date()
        };

        req.session.dasWosCoinsTransactions.unshift(refundTransaction);

        console.log(`AutoShop cleared: Refunded ${coinsToRefund} coins for ${pendingRecommendations.length} pending items`);
      }

      // Clear all pending recommendations
      if (req.session.autoShopRecommendations) {
        req.session.autoShopRecommendations = req.session.autoShopRecommendations.filter(
          rec => rec.status !== 'pending'
        );
      }

      // Also clear from database if user is authenticated
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        await storage.clearAiShopperRecommendations(userId);
      }

      res.json({
        success: true,
        message: 'All pending items cleared successfully',
        coinsRefunded: coinsToRefund
      });
    } catch (error) {
      console.error('Error clearing pending items:', error);
      res.status(500).json({ error: 'Failed to clear pending items' });
    }
  });

  // Remove a single item
  router.delete('/item/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);

      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      // Find the item to be removed
      let removedItem = null;
      if (req.session.autoShopRecommendations) {
        removedItem = req.session.autoShopRecommendations.find(rec => rec.id === itemId && rec.status === 'pending');
      }

      // Refund coins if the item was found and is in pending status
      let coinsRefunded = 0;
      if (removedItem && removedItem.product && removedItem.product.price) {
        coinsRefunded = removedItem.product.price;

        // Add the coins back to the user's balance
        if (!req.session.dasWosCoins) {
          req.session.dasWosCoins = 0;
        }
        req.session.dasWosCoins += coinsRefunded;

        // Record the refund transaction
        if (!req.session.dasWosCoinsTransactions) {
          req.session.dasWosCoinsTransactions = [];
        }

        const refundTransaction = {
          id: Date.now(),
          userId: req.isAuthenticated() ? req.user.id : null,
          amount: coinsRefunded,
          type: 'refund',
          description: `AutoShop item removed: Refunded ${coinsRefunded} coins for ${removedItem.product.title || removedItem.product.name}`,
          status: 'completed',
          metadata: {
            autoShop: true,
            refundReason: 'item_removed',
            productId: removedItem.product.id
          },
          createdAt: new Date()
        };

        req.session.dasWosCoinsTransactions.unshift(refundTransaction);

        console.log(`AutoShop item removed: Refunded ${coinsRefunded} coins for ${removedItem.product.title || removedItem.product.name}`);
      }

      // Remove from session recommendations
      if (req.session.autoShopRecommendations) {
        req.session.autoShopRecommendations = req.session.autoShopRecommendations.filter(
          rec => rec.id !== itemId
        );
      }

      // Also remove from database if user is authenticated
      if (req.isAuthenticated()) {
        await storage.updateAiShopperRecommendationStatus(itemId, 'rejected', 'Removed by user', true);
      }

      res.json({
        success: true,
        message: 'Item removed successfully',
        coinsRefunded
      });
    } catch (error) {
      console.error('Error removing item:', error);
      res.status(500).json({ error: 'Failed to remove item' });
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
