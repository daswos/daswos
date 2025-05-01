import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../../storage/interface';

export function createSuperSafeRoutes(storage: IStorage) {
  const router = Router();

  // Get SuperSafe Mode status
  router.get('/supersafe', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Check if the user has SuperSafe settings
      const userId = req.user.id;
      
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        enabled: z.boolean(),
        settings: z.object({
          blockGambling: z.boolean(),
          blockAdultContent: z.boolean(),
          blockOpenSphere: z.boolean()
        })
      });

      const { enabled, settings } = schema.parse(req.body);
      const userId = req.user.id;

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

export default createSuperSafeRoutes;
