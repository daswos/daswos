import { Router, Request, Response } from 'express';
import { IStorage } from '../storage';

export function setupCategorySearchRoutes(router: Router, storage: IStorage) {
  
  // Get information content filtered by category
  router.get('/api/information', async (req: Request, res: Response) => {
    try {
      const { query, category } = req.query;
      
      let content;
      if (category) {
        content = await storage.getInformationContentByCategory(category as string);
      } else if (query) {
        content = await storage.getInformationContent(query as string);
      } else {
        // Default to getting all content with a reasonable limit
        content = await storage.getInformationContent('', category as string);
      }
      
      res.json(content);
    } catch (error) {
      console.error('Error fetching information content:', error);
      res.status(500).json({ error: 'Failed to fetch information content' });
    }
  });

  // Get products filtered by category
  router.get('/api/products/category/:category', async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error fetching category products:', error);
      res.status(500).json({ error: 'Failed to fetch category products' });
    }
  });
  
  // Search products with category filter
  router.get('/api/search', async (req: Request, res: Response) => {
    try {
      const { q, category, ai } = req.query;
      
      // Save search query for analytics
      if (q) {
        await storage.saveSearchQuery({
          query: q as string,
          timestamp: new Date(),
          isAiAssisted: ai === 'true',
          categoryFilter: category as string || null,
          userId: req.session.userId || null
        });
      }
      
      // For now, use the regular product search but filter results by category later
      // In a real implementation, you would modify the storage method to handle category filtering
      const products = await storage.getProducts();
      
      // Filter products by category if provided
      const filteredProducts = category 
        ? products.filter(product => {
            // Case-insensitive match for category in tags or category field
            const categoryLower = (category as string).toLowerCase();
            const hasCategoryTag = product.tags?.some(tag => tag.toLowerCase().includes(categoryLower));
            const matchesCategory = product.category?.toLowerCase().includes(categoryLower);
            return hasCategoryTag || matchesCategory;
          })
        : products;
      
      res.json(filteredProducts);
      
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  });
}