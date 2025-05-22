import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';

export function createOrderRoutes(storage: IStorage) {
  const router = Router();

  // Create a new order
  router.post('/', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create an order" });
      }

      const userId = req.user.id;
      const orderData = req.body;

      // Validate order data
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }

      // Create the order
      const order = await storage.createOrder({
        userId,
        totalAmount: orderData.totalAmount,
        status: "pending",
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentReference: orderData.paymentReference,
        notes: orderData.notes
      });

      // Create order items and track purchase history
      const orderItems = [];
      for (const item of orderData.items) {
        const orderItem = await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price,
          itemNameSnapshot: item.name,
          splitBuyId: item.splitBuyId
        });
        orderItems.push(orderItem);
        
        // Get product details to get category ID
        try {
          const product = await storage.getProductById(item.productId);
          if (product) {
            // Add to purchase history
            await storage.addUserPurchaseHistory(
              userId,
              item.productId,
              product.categoryId,
              item.price,
              item.quantity
            );
            
            // Update user preference for this category
            if (product.categoryId) {
              // Get current preference score
              const preferences = await storage.getUserProductPreferences(userId);
              const existingPreference = preferences.find(p => p.categoryId === product.categoryId);
              
              // Calculate new score (increase by 10 if exists, start at 10 if new)
              const newScore = existingPreference ? existingPreference.preferenceScore + 10 : 10;
              
              // Update preference
              await storage.updateUserProductPreference(userId, product.categoryId, newScore);
            }
            
            console.log(`Added purchase history for user ${userId}, product ${item.productId}, category ${product.categoryId || 'unknown'}`);
          }
        } catch (historyError) {
          console.error('Error tracking purchase history:', historyError);
          // Continue with the order creation even if history tracking fails
        }
      }

      // Clear the user's cart if requested
      if (orderData.clearCart) {
        await storage.clearUserCart(userId);
      }

      res.status(201).json({
        order,
        items: orderItems
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get user's orders
  router.get('/user', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your orders" });
      }

      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get order details
  router.get('/:id', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view order details" });
      }

      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the user is the owner of the order
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to view this order" });
      }

      // Get order items
      const items = await storage.getOrderItems(orderId);

      res.json({
        order,
        items
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  return router;
}
