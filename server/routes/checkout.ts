import { Router } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the Stripe secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

export function createCheckoutRoutes(storage: IStorage) {
  const router = Router();

  // Create a payment intent for DasWos coins purchase
  router.post('/create-coin-payment-intent', async (req, res) => {
    try {
      const schema = z.object({
        packageId: z.string(),
        amount: z.number().min(1),
        coins: z.number().min(1),
        metadata: z.record(z.string(), z.any()).optional()
      });

      const { packageId, amount, coins, metadata } = schema.parse(req.body);

      console.log(`Creating payment intent for DasWos coins purchase, amount: ${amount}, coins: ${coins}`);

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          ...metadata,
          type: 'daswos_coins',
          package_id: packageId,
          coins: coins.toString()
        }
      });

      console.log('Coins payment intent created:', paymentIntent.id);

      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error('Error creating payment intent for coins purchase:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid checkout data", details: error.errors });
      }

      // For development, return a mock client secret
      if (process.env.NODE_ENV === 'development') {
        const mockClientSecret = `pi_mock_${Date.now()}_secret_${Date.now()}`;
        return res.json({
          clientSecret: mockClientSecret,
          isMock: true
        });
      }

      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Create a payment intent for checkout
  router.post('/create-payment-intent', async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().min(1),
        items: z.array(z.object({
          id: z.number(),
          productId: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          source: z.string(),
          imageUrl: z.string().optional(),
          createdAt: z.string()
        })),
        metadata: z.record(z.string(), z.any()).optional()
      });

      const { amount, items, metadata } = schema.parse(req.body);

      console.log(`Creating payment intent for checkout, amount: ${amount}`);

      // Get seller information for each item
      const sellerIds = new Set<number>();
      const itemsBySeller: Record<number, any[]> = {};

      for (const item of items) {
        try {
          const product = await storage.getProductById(item.productId);
          if (product && product.sellerId) {
            sellerIds.add(product.sellerId);

            if (!itemsBySeller[product.sellerId]) {
              itemsBySeller[product.sellerId] = [];
            }

            itemsBySeller[product.sellerId].push({
              ...item,
              sellerId: product.sellerId,
              sellerName: product.sellerName
            });
          }
        } catch (error) {
          console.error(`Error getting product ${item.productId}:`, error);
        }
      }

      // Create transfer group ID for this order
      const transferGroup = `order_${Date.now()}`;

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
        transfer_group: transferGroup,
        metadata: {
          ...metadata,
          order_id: `order_${Date.now()}`,
          transfer_group: transferGroup,
          seller_ids: Array.from(sellerIds).join(','),
          items_json: JSON.stringify(items.map(item => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })))
        }
      });

      // Store order information in database
      const order = await storage.createOrder({
        userId: req.user?.id || null,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          sellerId: itemsBySeller[item.productId]?.sellerId || null
        })),
        totalAmount: amount,
        paymentIntentId: paymentIntent.id,
        transferGroup,
        status: 'pending',
        metadata: {
          ...metadata,
          sellerIds: Array.from(sellerIds)
        }
      });

      console.log('Order created:', order.id);
      console.log('Payment intent created:', paymentIntent.id);

      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      console.error('Error creating payment intent for checkout:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid checkout data", details: error.errors });
      }

      // For development, return a mock client secret
      if (process.env.NODE_ENV === 'development') {
        const mockClientSecret = `pi_mock_${Date.now()}_secret_${Date.now()}`;
        return res.json({
          clientSecret: mockClientSecret,
          orderId: `order_mock_${Date.now()}`,
          isMock: true
        });
      }

      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Process payment with DasWos coins
  router.post('/pay-with-coins', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to make a purchase with DasWos Coins" });
      }

      const schema = z.object({
        items: z.array(z.object({
          id: z.number(),
          productId: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          source: z.string(),
          imageUrl: z.string().optional(),
          createdAt: z.string()
        })),
        shippingInfo: z.object({
          name: z.string(),
          address: z.string(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string()
        })
      });

      const { items, shippingInfo } = schema.parse(req.body);

      // Calculate total coins needed
      const totalCoins = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Check if user has enough coins
      const userCoins = await storage.getDasWosCoinsBalance(req.user.id);
      if (userCoins < totalCoins) {
        return res.status(400).json({
          error: "Insufficient DasWos Coins",
          required: totalCoins,
          available: userCoins
        });
      }

      // Get seller information for each item
      const sellerIds = new Set<number>();
      const itemsBySeller: Record<number, any[]> = {};

      for (const item of items) {
        try {
          const product = await storage.getProductById(item.productId);
          if (product && product.sellerId) {
            sellerIds.add(product.sellerId);

            if (!itemsBySeller[product.sellerId]) {
              itemsBySeller[product.sellerId] = [];
            }

            itemsBySeller[product.sellerId].push({
              ...item,
              sellerId: product.sellerId,
              sellerName: product.sellerName
            });
          }
        } catch (error) {
          console.error(`Error getting product ${item.productId}:`, error);
        }
      }

      // Create order in database
      const order = await storage.createOrder({
        userId: req.user.id,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          sellerId: itemsBySeller[item.productId]?.sellerId || null
        })),
        totalAmount: totalCoins,
        paymentMethod: 'daswos_coins',
        status: 'completed',
        shippingInfo
      });

      // Deduct coins from user's balance
      await storage.updateDasWosCoinsBalance(req.user.id, -totalCoins, 'purchase', {
        orderId: order.id,
        items: items.map(item => item.name).join(', ')
      });

      // Credit coins to sellers immediately
      for (const sellerId of sellerIds) {
        const sellerItems = itemsBySeller[sellerId] || [];
        const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (sellerTotal > 0) {
          // Get seller user ID
          const seller = await storage.getSellerById(sellerId);
          if (seller && seller.userId) {
            // Credit coins to seller
            await storage.updateDasWosCoinsBalance(seller.userId, sellerTotal, 'sale', {
              orderId: order.id,
              items: sellerItems.map(item => item.name).join(', ')
            });

            console.log(`Credited ${sellerTotal} coins to seller ${sellerId} (user ${seller.userId})`);
          }
        }
      }

      // Clear cart
      if (req.session.cart) {
        req.session.cart = [];
        await new Promise<void>((resolve, reject) => {
          req.session.save(err => {
            if (err) {
              console.error('Error saving session after coin purchase:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      res.json({
        success: true,
        orderId: order.id,
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error('Error processing coin payment:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment data", details: error.errors });
      }

      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // Webhook for Stripe events
  router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        // For development, just parse the JSON
        event = req.body;
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent.id);

        // Check the type of payment
        if (paymentIntent.metadata?.type === 'daswos_coins') {
          console.log('Processing DasWos coins purchase payment');
        } else {
          console.log('Processing regular product purchase payment');
        }

        // Process the successful payment
        await handleSuccessfulPayment(paymentIntent, storage);
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;

      case 'charge.succeeded':
        console.log('Charge succeeded:', event.data.object.id);
        // If needed, we can handle successful charges here
        break;

      case 'charge.failed':
        console.log('Charge failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  });

  return router;
}

// Helper function to handle successful payments
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent, storage: IStorage) {
  try {
    // Check if this is a DasWos coins purchase
    if (paymentIntent.metadata?.type === 'daswos_coins') {
      await handleDasWosCoinsPayment(paymentIntent, storage);
      return;
    }

    // Handle regular product purchase
    // Get the transfer group from the payment intent
    const transferGroup = paymentIntent.transfer_group;
    if (!transferGroup) {
      console.error('No transfer group found in payment intent:', paymentIntent.id);
      return;
    }

    // Get the order from the database
    const order = await storage.getOrderByTransferGroup(transferGroup);
    if (!order) {
      console.error('Order not found for transfer group:', transferGroup);
      return;
    }

    // Update order status
    await storage.updateOrderStatus(order.id, 'completed');

    // Process transfers to sellers
    const sellerIds = paymentIntent.metadata?.seller_ids?.split(',').map(id => parseInt(id)) || [];
    const items = JSON.parse(paymentIntent.metadata?.items_json || '[]');

    // Group items by seller
    const itemsBySeller: Record<number, any[]> = {};
    for (const item of items) {
      const product = await storage.getProductById(item.productId);
      if (product && product.sellerId) {
        if (!itemsBySeller[product.sellerId]) {
          itemsBySeller[product.sellerId] = [];
        }

        itemsBySeller[product.sellerId].push({
          ...item,
          sellerId: product.sellerId
        });
      }
    }

    // Create transfers to sellers
    for (const sellerId of sellerIds) {
      const sellerItems = itemsBySeller[sellerId] || [];
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (sellerTotal > 0) {
        // Get seller's Stripe account ID
        const seller = await storage.getSellerById(sellerId);
        if (seller && seller.stripeAccountId) {
          // Create a transfer to the seller
          const transfer = await stripe.transfers.create({
            amount: sellerTotal * 100, // Convert to cents
            currency: 'usd',
            destination: seller.stripeAccountId,
            transfer_group: transferGroup,
            source_transaction: paymentIntent.id,
            metadata: {
              order_id: order.id,
              seller_id: sellerId,
              items: sellerItems.map(item => item.name).join(', ')
            }
          });

          console.log(`Created transfer to seller ${sellerId}:`, transfer.id);
        } else {
          console.error(`Seller ${sellerId} does not have a Stripe account ID`);

          // Record pending payout for manual processing
          await storage.createPendingPayout({
            sellerId,
            orderId: order.id,
            amount: sellerTotal,
            status: 'pending',
            metadata: {
              items: sellerItems.map(item => item.name).join(', ')
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Helper function to handle DasWos coins purchases
async function handleDasWosCoinsPayment(paymentIntent: Stripe.PaymentIntent, storage: IStorage) {
  try {
    const userId = parseInt(paymentIntent.metadata?.userId || '0');
    const coins = parseInt(paymentIntent.metadata?.coins || '0');
    const packageId = paymentIntent.metadata?.package_id;

    if (!userId || !coins) {
      console.error('Invalid user ID or coins amount in payment intent:', paymentIntent.id);
      return;
    }

    console.log(`Processing DasWos coins purchase: ${coins} coins for user ${userId}`);

    // Add coins to user's balance
    await storage.updateDasWosCoinsBalance(userId, coins, 'purchase', {
      paymentIntentId: paymentIntent.id,
      packageId
    });

    console.log(`Added ${coins} DasWos coins to user ${userId}`);
  } catch (error) {
    console.error('Error handling DasWos coins payment:', error);
  }
}
