import express from 'express';
import { IStorage } from '../../storage';
import { z } from 'zod';

// Schema for product approval/rejection
const productActionSchema = z.object({
  adminNotes: z.string().optional(),
});

// Schema for product update
const productUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  shipping: z.string().optional(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  adminNotes: z.string().optional(),
});

function createAdminProductRoutes(storage: IStorage) {
  const router = express.Router();

  // Middleware to check if user is admin
  const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check for admin authorization - from user object, session, or custom admin criteria
    const isAdmin = req.user?.isAdmin === true || req.session?.isAdmin === true || req.user?.username === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    next();
  };

  // Get products by approval status
  router.get('/:status', isAdmin, async (req, res) => {
    try {
      const { status } = req.params;
      
      // Validate status parameter
      if (!['pending', 'approved', 'rejected', 'all'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status parameter' });
      }

      const products = await storage.getProductsByApprovalStatus(status === 'all' ? undefined : status);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by approval status:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Get a specific product by ID
  router.get('/product/:id', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // Approve a product
  router.post('/approve/:id', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      // Validate request body
      const { adminNotes } = productActionSchema.parse(req.body);

      // Get the admin user ID
      const adminId = req.user?.id;

      // Update product approval status
      const updatedProduct = await storage.updateProductApprovalStatus(
        productId, 
        'approved', 
        adminId, 
        adminNotes
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        product: updatedProduct,
        message: 'Product approved successfully'
      });
    } catch (error) {
      console.error('Error approving product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to approve product' });
    }
  });

  // Reject a product
  router.post('/reject/:id', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      // Validate request body
      const { adminNotes } = productActionSchema.parse(req.body);

      if (!adminNotes) {
        return res.status(400).json({ error: 'Admin notes are required when rejecting a product' });
      }

      // Get the admin user ID
      const adminId = req.user?.id;

      // Update product approval status
      const updatedProduct = await storage.updateProductApprovalStatus(
        productId, 
        'rejected', 
        adminId, 
        adminNotes
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        product: updatedProduct,
        message: 'Product rejected successfully'
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to reject product' });
    }
  });

  // Update a product
  router.put('/update/:id', isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      // Validate request body
      const updateData = productUpdateSchema.parse(req.body);

      // Update product
      const updatedProduct = await storage.updateProduct(productId, updateData);

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  return router;
}

export { createAdminProductRoutes };
