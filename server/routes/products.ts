import express from 'express';
import { IStorage } from '../storage';

function createProductRoutes(storage: IStorage) {
  const router = express.Router();

  // Get all products
  router.get('/', async (req, res) => {
    try {
      const sphere = req.query.sphere as string || 'safesphere';
      const query = req.query.query as string || '';
      
      const products = await storage.getProducts(sphere, query);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Get a product by ID
  router.get('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // Get related products
  router.get('/:id/related', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const relatedProducts = await storage.getRelatedProducts(product.tags, id);
      res.json(relatedProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
      res.status(500).json({ error: 'Failed to fetch related products' });
    }
  });

  // Get products by category
  router.get('/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products by category' });
    }
  });

  // Create a new product
  router.post('/', async (req, res) => {
    try {
      // Ensure user is authorized to create products
      if (!req.session?.passport?.user) {
        console.log('No user ID in session:', req.session);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = req.session.passport.user;
      console.log('Creating product for user ID:', userId);
      
      // Get the user to assign seller details
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('User not found in database:', userId);
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Create the product with seller information
      const productData = {
        ...req.body,
        sellerId: user.id,
        sellerName: user.fullName,
        sellerVerified: user.isSeller,
        trustScore: 70, // Default trust score, can be adjusted based on other factors
      };
      
      console.log('Creating product with data:', productData);
      
      const product = await storage.createProduct(productData);
      console.log('Product created successfully:', product);
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Get products by seller ID
  router.get('/seller/:sellerId', async (req, res) => {
    try {
      const sellerId = Number(req.params.sellerId);
      const products = await storage.getProductsBySellerId(sellerId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by seller:', error);
      res.status(500).json({ error: 'Failed to fetch products by seller' });
    }
  });

  return router;
}

export { createProductRoutes };