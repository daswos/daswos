import express from 'express';
import { IStorage } from '../storage';

/**
 * Create routes for information content
 */
export function createInformationRoutes(storage: IStorage) {
  const router = express.Router();

  // Get information content based on query and category
  router.get('/search', async (req, res) => {
    try {
      const { q, category } = req.query;
      const query = q ? String(q) : undefined;
      const categoryFilter = category ? String(category) : undefined;

      const results = await storage.getInformationContent(query, categoryFilter);
      
      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error searching information content:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while searching for information content'
      });
    }
  });

  // Get information content by ID
  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }

      const content = await storage.getInformationContentById(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Information content not found'
        });
      }

      res.json({
        success: true,
        content
      });
    } catch (error) {
      console.error('Error getting information content by ID:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving information content'
      });
    }
  });

  // Get information content by category
  router.get('/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      
      const results = await storage.getInformationContentByCategory(category);
      
      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error getting information content by category:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving information content by category'
      });
    }
  });

  return router;
}

export default createInformationRoutes;
