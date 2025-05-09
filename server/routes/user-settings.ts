import express from 'express';
import { IStorage } from '../storage';
import { isAuthenticated } from '../middleware/auth';
import { z } from 'zod';

function createUserSettingsRoutes(storage: IStorage) {
  const router = express.Router();

  // Apply authentication middleware to all routes
  router.use(isAuthenticated);

  // Get DasBar settings
  router.get('/dasbar-settings', async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const settings = await storage.getDasbarSettings(userId);

      if (!settings) {
        // Return default settings if none exist
        return res.json({
          enabled: true,
          autoRefresh: false,
          refreshInterval: 30,
          notifications: true
        });
      }

      res.json(settings);
    } catch (error) {
      console.error('Error fetching DasBar settings:', error);
      res.status(500).json({ error: 'Failed to fetch DasBar settings' });
    }
  });

  // Update DasBar settings
  router.put('/dasbar-settings', async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { enabled, autoRefresh, refreshInterval, notifications } = req.body;

      // Validate input
      if (typeof enabled !== 'boolean' ||
          typeof autoRefresh !== 'boolean' ||
          typeof notifications !== 'boolean' ||
          (refreshInterval && (isNaN(refreshInterval) || refreshInterval < 10 || refreshInterval > 300))) {
        return res.status(400).json({ error: 'Invalid settings data' });
      }

      const settings = {
        userId,
        enabled,
        autoRefresh,
        refreshInterval: Math.max(10, Math.min(300, refreshInterval || 30)),
        notifications
      };

      await storage.updateDasbarSettings(settings);

      res.json(settings);
    } catch (error) {
      console.error('Error updating DasBar settings:', error);
      res.status(500).json({ error: 'Failed to update DasBar settings' });
    }
  });

  // Get SuperSafe Mode status
  router.get('/supersafe', async (req, res) => {
    try {
      // Check if the user has SuperSafe settings
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get the user's SuperSafe settings from the database
      const settings = await storage.getSuperSafeStatus(userId);

      // If no settings exist, return default settings
      if (!settings) {
        return res.json({
          enabled: false,
          settings: {
            blockGambling: true,
            blockAdultContent: true,
            blockOpenSphere: false
          }
        });
      }

      return res.json(settings);
    } catch (error) {
      console.error('Error fetching SuperSafe status:', error);
      res.status(500).json({ error: "Failed to fetch SuperSafe status" });
    }
  });

  // Update SuperSafe Mode status
  router.put('/supersafe', async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const schema = z.object({
        enabled: z.boolean(),
        settings: z.object({
          blockGambling: z.boolean(),
          blockAdultContent: z.boolean(),
          blockOpenSphere: z.boolean()
        })
      });

      const { enabled, settings } = schema.parse(req.body);

      // Update the user's SuperSafe settings in the database
      const success = await storage.updateSuperSafeStatus(userId, enabled, settings);

      if (success) {
        return res.json({
          success: true,
          message: "SuperSafe settings updated successfully"
        });
      } else {
        return res.status(500).json({ error: "Failed to update SuperSafe settings" });
      }
    } catch (error) {
      console.error('Error updating SuperSafe status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid SuperSafe settings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update SuperSafe settings" });
    }
  });

  return router;
}

export default createUserSettingsRoutes;
