import { Express } from 'express';
import { Storage } from '../storage';
import { z } from 'zod';
import { getUserFromSession } from '../auth';
import { v4 as uuidv4 } from 'uuid';

// Define schemas for validation
const AutoShopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  estimatedPrice: z.number(),
  imageUrl: z.string().optional(),
  addedAt: z.string().optional(),
});

const AutoShopHistoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number(),
  imageUrl: z.string().optional(),
  purchasedAt: z.string().optional(),
});

export function setupAutoShopRoutes(app: Express, storage: Storage) {
  // Get AutoShop status
  app.get('/api/user/autoshop/status', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;

      // Check if AutoShop is active for this user
      const autoShopStatus = await storage.getAutoShopStatus(userId);

      return res.json(autoShopStatus || { active: false });
    } catch (error) {
      console.error('Error getting AutoShop status:', error);
      return res.status(500).json({ error: 'Failed to get AutoShop status' });
    }
  });

  // Start AutoShop
  app.post('/api/user/autoshop/start', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;

      // Get settings from localStorage on the client side
      const settings = await storage.getAutoShopSettings(userId) || {
        maxTotalCoins: 5000,
        minItemPrice: 5000,
        maxItemPrice: 25000,
        duration: {
          value: 30,
          unit: 'minutes'
        },
        categories: ['Electronics', 'Sports & Outdoors', 'Fashion'],
        customPrompt: '',
        useRandomMode: false,
        itemsPerMinute: 1
      };

      // Calculate end time
      const now = new Date();
      let endTime = new Date(now);

      switch (settings.duration.unit) {
        case 'minutes':
          endTime.setMinutes(now.getMinutes() + settings.duration.value);
          break;
        case 'hours':
          endTime.setHours(now.getHours() + settings.duration.value);
          break;
        case 'days':
          endTime.setDate(now.getDate() + settings.duration.value);
          break;
        default:
          endTime.setMinutes(now.getMinutes() + 30); // Default to 30 minutes
      }

      // Save AutoShop status
      await storage.setAutoShopStatus(userId, {
        active: true,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        settings
      });

      // Save AutoShop settings
      await storage.setAutoShopSettings(userId, settings);

      // Start AutoShop service
      if ((global as any).autoShopService) {
        await (global as any).autoShopService.startAutoShop(userId);
      }

      return res.json({ success: true, message: 'AutoShop started successfully' });
    } catch (error) {
      console.error('Error starting AutoShop:', error);
      return res.status(500).json({ error: 'Failed to start AutoShop' });
    }
  });

  // Stop AutoShop
  app.post('/api/user/autoshop/stop', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;

      // Update AutoShop status
      await storage.setAutoShopStatus(userId, { active: false });

      // Stop AutoShop service
      if ((global as any).autoShopService) {
        await (global as any).autoShopService.stopAutoShop(userId);
      }

      return res.json({ success: true, message: 'AutoShop stopped successfully' });
    } catch (error) {
      console.error('Error stopping AutoShop:', error);
      return res.status(500).json({ error: 'Failed to stop AutoShop' });
    }
  });

  // Cache for pending items to reduce database load
  const pendingItemsCache = new Map<string, { items: any[], timestamp: number }>();

  // Make the cache available globally for the AutoShop service to access
  (global as any).pendingItemsCache = pendingItemsCache;

  // Get pending items
  app.get('/api/user/autoshop/pending', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;
      const userIdStr = userId.toString();

      // Check if we have a recent cache entry (less than 5 seconds old)
      const now = Date.now();
      const cachedData = pendingItemsCache.get(userIdStr);

      if (cachedData && now - cachedData.timestamp < 5000) {
        // Use cached data
        return res.json(cachedData.items);
      }

      // Get pending items from storage
      const pendingItems = await storage.getAutoShopPendingItems(userId);

      // Update cache
      pendingItemsCache.set(userIdStr, {
        items: pendingItems || [],
        timestamp: now
      });

      return res.json(pendingItems || []);
    } catch (error) {
      console.error('Error getting pending items:', error);
      return res.status(500).json({ error: 'Failed to get pending items' });
    }
  });

  // Cache for order history to reduce database load
  const orderHistoryCache = new Map<string, { items: any[], timestamp: number }>();

  // Get order history
  app.get('/api/user/autoshop/history', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;
      const userIdStr = userId.toString();

      // Check if we have a recent cache entry (less than 10 seconds old)
      const now = Date.now();
      const cachedData = orderHistoryCache.get(userIdStr);

      if (cachedData && now - cachedData.timestamp < 10000) {
        // Use cached data
        return res.json(cachedData.items);
      }

      // Get order history from storage
      const orderHistory = await storage.getAutoShopOrderHistory(userId);

      // Update cache
      orderHistoryCache.set(userIdStr, {
        items: orderHistory || [],
        timestamp: now
      });

      return res.json(orderHistory || []);
    } catch (error) {
      console.error('Error getting order history:', error);
      return res.status(500).json({ error: 'Failed to get order history' });
    }
  });

  // Remove an item
  app.delete('/api/user/autoshop/item/:itemId', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;
      const userIdStr = userId.toString();
      const { itemId } = req.params;

      // Remove the item
      await storage.removeAutoShopItem(userId, itemId);

      // Invalidate cache
      pendingItemsCache.delete(userIdStr);

      return res.json({ success: true, message: 'Item removed successfully' });
    } catch (error) {
      console.error('Error removing item:', error);
      return res.status(500).json({ error: 'Failed to remove item' });
    }
  });

  // Clear all items
  app.post('/api/user/autoshop/clear', async (req, res) => {
    try {
      const user = await getUserFromSession(req, storage);
      const userId = user?.id || req.sessionID;
      const userIdStr = userId.toString();

      // Clear all items
      await storage.clearAutoShopItems(userId);

      // Invalidate cache
      pendingItemsCache.delete(userIdStr);

      return res.json({ success: true, message: 'Items cleared successfully' });
    } catch (error) {
      console.error('Error clearing items:', error);
      return res.status(500).json({ error: 'Failed to clear items' });
    }
  });
}
