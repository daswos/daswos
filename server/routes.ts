import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertSearchQuerySchema,
  Product,
  insertCartItemSchema,
  CartItemWithProduct,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import 'express-session';
import { createSellerRoutes } from './routes/sellers';
import { createProductRoutes } from './routes/products';
import { createDaswosAiRoutes } from './routes/daswos-ai';
import { setupAiSearchRoutes } from './routes/ai-search';
import { setupSellerAiRoutes } from './routes/seller-ai';
import { setupAutoShopRoutes } from './routes/autoshop';
import { setupCategorySearchRoutes } from './routes/category-search';
import createUserSettingsRoutes from './routes/user-settings';
import { createStripeRoutes } from './routes/stripe';
import { createPaymentRoutes } from './routes/payment';
import { createInformationRoutes } from './routes/information-routes';
import { setupAiShopperRoutes } from './routes/ai-shopper';
import { createOrderRoutes } from './routes/order';
import {
  createPaymentIntent,
  createCustomer,
  createSubscription,
  getPlanAmount,
  getPriceId
} from './stripe';

// Stripe payment functions are imported from ./stripe.ts

// Extend Express Session type to include our cart property
declare module 'express-session' {
  interface SessionData {
    cart?: Array<{
      id: number;
      productId: number;
      name: string;
      price: number;
      imageUrl?: string;
      quantity: number;
      source: string;
      createdAt: string;
      recommendationId?: number; // Optional field to link to AI recommendations
    }>;
  }
}

// Authentication functions are imported at the top of the file

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Set up only the AI search routes
  setupAiSearchRoutes(app, storage);

  // Set up AI shopper routes
  setupAiShopperRoutes(app, storage);

  // Set up AutoShop routes
  setupAutoShopRoutes(app, storage);

  // Health check endpoint for Docker
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // API routes with /api prefix

  // Get products
  app.get("/api/products", async (req, res) => {
    try {
      const sphere = req.query.sphere as string || "safesphere";
      const query = req.query.q as string || "";
      const isBulkBuy = req.query.bulk === 'true';
      const categoryName = req.query.category as string;

      // SuperSafe Mode parameters
      const superSafeEnabled = req.query.superSafeEnabled === 'true';
      const blockGambling = req.query.blockGambling === 'true';
      const blockAdultContent = req.query.blockAdultContent === 'true';

      // If SuperSafe Mode is enabled and OpenSphere is blocked, force SafeSphere
      let effectiveSphere = sphere;
      if (superSafeEnabled && req.query.blockOpenSphere === 'true' && sphere === 'opensphere') {
        effectiveSphere = 'safesphere';
        console.log('SuperSafe Mode: Forcing SafeSphere due to OpenSphere blocking');
      }

      // If bulkBuy is requested, modify the sphere to include bulkbuy filter
      if (isBulkBuy) {
        effectiveSphere = effectiveSphere === 'safesphere' ? 'bulkbuy-safe' : 'bulkbuy-open';
      }

      console.log(`Products API request - sphere: ${sphere}, query: "${query}", bulkBuy: ${isBulkBuy}, effectiveSphere: ${effectiveSphere}, superSafeEnabled: ${superSafeEnabled}, category: ${categoryName || 'none'}`);

      // Get products based on the effective sphere and category
      let products;
      if (categoryName) {
        // If a category is specified, get products by category
        products = await storage.getProductsByCategory(categoryName);
      } else {
        // Otherwise get by general query
        products = await storage.getProducts(effectiveSphere, query);
      }

      // Apply SuperSafe Mode filters if enabled
      if (superSafeEnabled) {
        // Filter out gambling-related products if blockGambling is enabled
        if (blockGambling) {
          const gamblingKeywords = ['gambling', 'casino', 'poker', 'betting', 'lottery', 'slot', 'roulette'];
          products = products.filter(product => {
            const title = product.title.toLowerCase();
            const description = product.description.toLowerCase();
            const tags = product.tags.map(tag => tag.toLowerCase());

            // Check if any gambling keywords are in the title, description, or tags
            return !gamblingKeywords.some(keyword =>
              title.includes(keyword) ||
              description.includes(keyword) ||
              tags.includes(keyword)
            );
          });
          console.log(`SuperSafe Mode: Filtered out gambling-related products, ${products.length} remaining`);
        }

        // Filter out adult content if blockAdultContent is enabled
        if (blockAdultContent) {
          const adultKeywords = ['adult', 'mature', 'xxx', 'nsfw', 'explicit', 'erotic'];
          products = products.filter(product => {
            const title = product.title.toLowerCase();
            const description = product.description.toLowerCase();
            const tags = product.tags.map(tag => tag.toLowerCase());

            // Check if any adult keywords are in the title, description, or tags
            return !adultKeywords.some(keyword =>
              title.includes(keyword) ||
              description.includes(keyword) ||
              tags.includes(keyword)
            );
          });
          console.log(`SuperSafe Mode: Filtered out adult content, ${products.length} remaining`);
        }
      }

      // Track search history if user is authenticated
      if (req.isAuthenticated() && query) {
        try {
          // Get category ID if category name is provided
          let categoryId = null;
          if (categoryName) {
            const categories = await storage.getCategoryIdsByNames([categoryName]);
            if (categories.length > 0) {
              categoryId = categories[0];
            }
          }

          // Add to search history
          await storage.addUserSearchHistory(req.user.id, query, categoryId);
          console.log(`Added search query "${query}" to user ${req.user.id}'s history`);
        } catch (historyError) {
          console.error('Error tracking search history:', historyError);
          // Continue with the response even if history tracking fails
        }
      }

      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get information content
  app.get("/api/information", async (req, res) => {
    try {
      const sphere = req.query.sphere as string || "safesphere";
      const query = req.query.q as string || "";
      const category = req.query.category as string;

      // If a specific category is provided, get information by category
      if (category) {
        const information = await storage.getInformationContentByCategory(category);
        return res.json(information);
      }

      // Otherwise get by general query
      const information = await storage.getInformationContent(query, undefined);
      res.json(information);
    } catch (error) {
      console.error('Error fetching information content:', error);
      res.status(500).json({ message: "Failed to fetch information content" });
    }
  });

  // Get information content by ID
  app.get("/api/information/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }

      const content = await storage.getInformationContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "Information content not found" });
      }

      res.json(content);
    } catch (error) {
      console.error('Error fetching information content by ID:', error);
      res.status(500).json({ message: "Failed to fetch information content" });
    }
  });

  // Get bulk buy products
  app.get("/api/bulk-buy", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const sphere = req.query.sphere as string || "safesphere";

      // SuperSafe Mode parameters
      const superSafeEnabled = req.query.superSafeEnabled === 'true';
      const blockGambling = req.query.blockGambling === 'true';
      const blockAdultContent = req.query.blockAdultContent === 'true';

      // If SuperSafe Mode is enabled and OpenSphere is blocked, force SafeSphere
      let effectiveSphere = sphere;
      if (superSafeEnabled && req.query.blockOpenSphere === 'true' && sphere === 'opensphere') {
        effectiveSphere = 'safesphere';
        console.log('SuperSafe Mode: Forcing SafeSphere due to OpenSphere blocking');
      }

      console.log(`BulkBuy API Request - Query: "${query}", Sphere: "${sphere}", SuperSafe: ${superSafeEnabled}`);

      // Create a special sphere type that combines bulkbuy with the safesphere/opensphere filter
      const bulkbuySphere = effectiveSphere === "safesphere" ? "bulkbuy-safe" : "bulkbuy-open";
      console.log(`Using combined sphere filter: "${bulkbuySphere}"`);

      // Get products based on the effective sphere
      let bulkBuyProducts = await storage.getProducts(bulkbuySphere, query);

      // Apply SuperSafe Mode filters if enabled
      if (superSafeEnabled) {
        // Filter out gambling-related products if blockGambling is enabled
        if (blockGambling) {
          const gamblingKeywords = ['gambling', 'casino', 'poker', 'betting', 'lottery', 'slot', 'roulette'];
          bulkBuyProducts = bulkBuyProducts.filter(product => {
            const title = product.title.toLowerCase();
            const description = product.description.toLowerCase();
            const tags = product.tags.map(tag => tag.toLowerCase());

            // Check if any gambling keywords are in the title, description, or tags
            return !gamblingKeywords.some(keyword =>
              title.includes(keyword) ||
              description.includes(keyword) ||
              tags.includes(keyword)
            );
          });
          console.log(`SuperSafe Mode: Filtered out gambling-related products, ${bulkBuyProducts.length} remaining`);
        }

        // Filter out adult content if blockAdultContent is enabled
        if (blockAdultContent) {
          const adultKeywords = ['adult', 'mature', 'xxx', 'nsfw', 'explicit', 'erotic'];
          bulkBuyProducts = bulkBuyProducts.filter(product => {
            const title = product.title.toLowerCase();
            const description = product.description.toLowerCase();
            const tags = product.tags.map(tag => tag.toLowerCase());

            // Check if any adult keywords are in the title, description, or tags
            return !adultKeywords.some(keyword =>
              title.includes(keyword) ||
              description.includes(keyword) ||
              tags.includes(keyword)
            );
          });
          console.log(`SuperSafe Mode: Filtered out adult content, ${bulkBuyProducts.length} remaining`);
        }
      }

      console.log(`BulkBuy API Response - Found ${bulkBuyProducts.length} products`);
      res.json(bulkBuyProducts);
    } catch (error) {
      console.error('BulkBuy API Error:', error);
      res.status(500).json({ message: "Failed to fetch bulk buy products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Track product click in search history if user is authenticated
      if (req.isAuthenticated()) {
        try {
          // Get the most recent search query for this user
          const searchHistory = await storage.getUserSearchHistory(req.user.id, 1);

          if (searchHistory.length > 0) {
            const latestSearch = searchHistory[0];

            // Update the search history with the clicked product
            await storage.addUserSearchHistory(
              req.user.id,
              latestSearch.searchQuery,
              product.categoryId,
              productId
            );

            console.log(`Updated search history for user ${req.user.id} with clicked product ${productId}`);
          }
        } catch (historyError) {
          console.error('Error tracking product click:', historyError);
          // Continue with the response even if history tracking fails
        }
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get products by seller ID
  app.get("/api/sellers/:id/products", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.id);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }

      const products = await storage.getProductsBySellerId(sellerId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller products" });
    }
  });

  // Save search query
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, selectedPlan, billingCycle } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: 'usd',
      // Add any additional Stripe options here
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});
  // Get recent searches
  app.get("/api/searches/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentSearches = await storage.getRecentSearches(limit);
      res.json(recentSearches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent searches" });
    }
  });

  // Seller verification routes

  // Submit verification request
  app.post("/api/seller-verification", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to submit a verification request" });
      }

      const userId = req.user.id;

      // Include userId in the verification data
      const verificationData = {
        ...req.body,
        userId,
        status: 'pending' // Default status is pending
      };

      const verification = await storage.createSellerVerification(verificationData);
      res.status(201).json(verification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid verification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit verification request" });
    }
  });

  // Get user's verification requests
  app.get("/api/seller-verification", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view verification requests" });
      }

      const userId = req.user.id;
      const verifications = await storage.getSellerVerificationsByUserId(userId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verification requests" });
    }
  });

  // Update verification status (admin only)
  app.patch("/api/seller-verification/:id", async (req, res) => {
    try {
      // In a real app, we would check if the user is an admin
      // For demo purposes, we'll allow this operation

      const verificationId = parseInt(req.params.id);
      if (isNaN(verificationId)) {
        return res.status(400).json({ message: "Invalid verification ID" });
      }

      const { status, comments } = req.body;
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const verification = await storage.updateSellerVerificationStatus(verificationId, status, comments);
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  // Get user info with subscription details
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Get user dasbar preferences
  app.get("/api/user/dasbar-preferences", async (req, res) => {
    try {
      // For non-authenticated users, return default preferences
      if (!req.isAuthenticated()) {
        return res.json({
          items: [
            // Home is now fixed in the navigation bar and not part of customizable items
            { id: 'bulkbuy', label: 'BulkBuy', path: '/bulk-buy', icon: 'BulkBuyIcon' },
            { id: 'splitbuy', label: 'SplitBuy', path: '/split-buy', icon: 'SplitBuyIcon' },
            { id: 'daslist', label: 'das.list', path: '/d-list', icon: 'List' },
            { id: 'jobs', label: 'Jobs', path: '/browse-jobs', icon: 'Briefcase' },
            { id: 'ai-assistant', label: 'AI Assistant', path: '/ai-assistant', icon: 'Bot' },
            { id: 'autoshop', label: 'AutoShop', path: '/autoshop-dashboard', icon: 'AutoShopIcon' },
            { id: 'cart', label: 'Cart', path: '/cart', icon: 'ShoppingCart' },
            { id: 'daswos-coins', label: 'DasWos Coins', path: '/daswos-coins', icon: 'Coins' }
          ]
        });
      }

      // Get preferences for authenticated user
      const preferences = await storage.getUserDasbarPreferences(req.user.id);

      if (preferences) {
        return res.json({
          items: preferences.items,
          maxVisibleItems: preferences.maxVisibleItems
        });
      } else {
        // Return default preferences if none are saved
        return res.json({
          items: [
            // Home is now fixed in the navigation bar and not part of customizable items
            { id: 'bulkbuy', label: 'BulkBuy', path: '/bulk-buy', icon: 'BulkBuyIcon' },
            { id: 'splitbuy', label: 'SplitBuy', path: '/split-buy', icon: 'SplitBuyIcon' },
            { id: 'daslist', label: 'das.list', path: '/d-list', icon: 'List' },
            { id: 'jobs', label: 'Jobs', path: '/browse-jobs', icon: 'Briefcase' },
            { id: 'ai-assistant', label: 'AI Assistant', path: '/ai-assistant', icon: 'Bot' },
            { id: 'cart', label: 'Cart', path: '/cart', icon: 'ShoppingCart' },
            { id: 'daswos-coins', label: 'DasWos Coins', path: '/daswos-coins', icon: 'Coins' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dasbar preferences:', error);
      res.status(500).json({ error: "Failed to fetch dasbar preferences" });
    }
  });

  // Save user dasbar preferences
  app.post("/api/user/dasbar-preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        items: z.array(z.object({
          id: z.string(),
          label: z.string(),
          path: z.string(),
          icon: z.string(),
          isDefault: z.boolean().optional(),
          showInCollapsed: z.boolean().optional()
        }))
      });

      const { items } = schema.parse(req.body);

      const preferences = await storage.saveUserDasbarPreferences(req.user.id, items);

      res.json({
        success: true,
        message: "Dasbar preferences saved successfully",
        preferences
      });
    } catch (error) {
      console.error('Error saving dasbar preferences:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid dasbar preferences data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save dasbar preferences" });
    }
  });

  // Get user subscription details
  app.get("/api/user/subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Check if subscription dev mode is enabled
      let subscriptionDevMode = false;
      try {
        const settings = await storage.getAppSettings('subscriptionDevMode');
        subscriptionDevMode = settings === true;
      } catch (error) {
        console.error('Error checking subscription dev mode settings:', error);
      }

      // If subscription dev mode is enabled, return a simulated subscription
      if (subscriptionDevMode) {
        return res.json({
          hasSubscription: true,
          type: "individual",
          billingCycle: "monthly",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          devMode: true
        });
      }

      const subscription = await storage.getUserSubscriptionDetails(req.user.id);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription details" });
    }
  });

  // Check if user has active subscription
  app.get("/api/user/subscription/check", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Check if subscription dev mode is enabled
      let subscriptionDevMode = false;
      try {
        const settings = await storage.getAppSettings('subscriptionDevMode');
        subscriptionDevMode = settings === true;
      } catch (error) {
        console.error('Error checking subscription dev mode settings:', error);
      }

      // If subscription dev mode is enabled, return true for subscription check
      if (subscriptionDevMode) {
        return res.json({
          hasSubscription: true,
          devMode: true
        });
      }

      const hasSubscription = await storage.checkUserHasSubscription(req.user.id);
      res.json({ hasSubscription });
    } catch (error) {
      res.status(500).json({ error: "Failed to check subscription status" });
    }
  });

  // Create a payment intent for subscription
  // This endpoint doesn't require authentication to support the register-and-pay flow
  app.post("/api/payment/create-intent", async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(["limited", "unlimited", "individual", "family", "standard"]),
        billingCycle: z.enum(["monthly", "annual"]),
        customerId: z.string().optional()
      });

      const { type, billingCycle, customerId } = schema.parse(req.body);

      // Get the appropriate amount based on plan and billing cycle
      const amount = getPlanAmount(type, billingCycle);

      // For free plans, return a mock payment intent
      if (amount === 0) {
        return res.json({
          clientSecret: `pi_free_secret_${Date.now()}`,
          amount: 0,
          currency: 'gbp',
          id: `pi_free_${Date.now()}`
        });
      }

      // Create metadata for the payment intent
      const metadata = {
        subscriptionType: type,
        billingCycle: billingCycle
      };

      // Create a payment intent
      const paymentIntent = await createPaymentIntent(
        amount,
        'gbp',
        customerId,
        metadata
      );

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount,
        priceId: getPriceId(type, billingCycle)
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Register and subscribe user after successful payment
  app.post("/api/register-with-payment", async (req, res) => {
    try {
      const schema = z.object({
        // User data
        username: z.string().min(3),
        email: z.string().email(),
        fullName: z.string(),
        password: z.string().min(6),

        // Subscription data
        type: z.enum(["limited", "unlimited", "individual", "family", "standard"]), // Keep legacy types for backward compatibility
        billingCycle: z.enum(["monthly", "annual"]),
        paymentIntentId: z.string(),
        stripeCustomerId: z.string().optional(),
        stripeSubscriptionId: z.string().optional()
      });

      const userData = schema.parse(req.body);

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Create the user
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        password: hashedPassword,
      });

      // Set the subscription
      const durationMonths = userData.billingCycle === 'monthly' ? 1 : 12;
      const updatedUser = await storage.updateUserSubscription(
        user.id,
        userData.type,
        durationMonths
      );

      // If we have Stripe subscription information, store it with billing cycle
      if (userData.stripeCustomerId && userData.stripeSubscriptionId && userData.type !== 'limited') {
        console.log(`Creating Stripe subscription for user ${user.id} with billing cycle ${userData.billingCycle}`);
        await storage.createStripeSubscription(
          user.id,
          userData.stripeCustomerId,
          userData.stripeSubscriptionId,
          userData.type,
          userData.billingCycle // This ensures the billing cycle is stored in the user_subscriptions table
        );
      }

      // Log the user in
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log in after registration" });
        }

        const userToReturn = { ...updatedUser } as any;
        delete userToReturn.password; // Don't send password back

        res.status(201).json(userToReturn);
      });

    } catch (error) {
      console.error('Error in register-with-payment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user or payment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to register user with payment" });
    }
  });

  // Process subscription payment and activate subscription
  app.post("/api/user/subscription", async (req, res) => {
    // Check if this is a test mode request
    const isTestMode = req.body.testMode === true;

    // Check if this includes registration data
    const hasRegistrationData = req.body.registrationData &&
                               req.body.registrationData.username &&
                               req.body.registrationData.email &&
                               req.body.registrationData.password;

    // For non-test mode requests without registration data, we require authentication
    if (!isTestMode && !hasRegistrationData && !req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // If registration data is provided, create a new user first
    if (hasRegistrationData) {
      try {
        const { username, email, fullName, password } = req.body.registrationData;

        // Check if username or email already exists
        const existingUserByUsername = await storage.getUserByUsername(username);
        if (existingUserByUsername) {
          return res.status(400).json({ error: "Username already taken" });
        }

        const existingUserByEmail = await storage.getUserByEmail(email);
        if (existingUserByEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await storage.createUser({
          username,
          email,
          fullName,
          password: hashedPassword
        });

        // Set the user as authenticated
        req.user = user;

        // Log the user in
        req.login(user, (err) => {
          if (err) {
            console.error("Error logging in new user:", err);
            // Continue anyway since we have the user object
          }
        });

        console.log(`Created and authenticated new user: ${username} (${user.id})`);
      } catch (error) {
        console.error('Error creating user during subscription:', error);
        return res.status(500).json({ error: "Failed to create user account" });
      }
    }

    // For test mode requests, we'll update the database with the subscription
    if (isTestMode) {
      console.log('Using test mode - updating user subscription in database');

      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated after registration" });
      }

      try {
        // Update the user's subscription in the database
        const subscriptionType = req.body.type || "unlimited";

        // Use duration in months instead of timestamp
        const durationMonths = req.body.billingCycle === 'annual' ? 12 : 1;

        // Update the user's subscription status
        const updatedUser = await storage.updateUserSubscription(
          req.user.id,
          subscriptionType,
          durationMonths
        );

        // Update the user object in the session to reflect the new subscription status
        if (req.user) {
          req.user.hasSubscription = true;
          req.user.subscriptionType = subscriptionType;
          req.user.subscriptionExpiresAt = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000);
        }

        console.log(`Updated subscription for user ${req.user.id} to ${subscriptionType}`);

        // Calculate expiration date for display purposes
        const billingCycle = req.body.billingCycle || "monthly";
        console.log(`Using billing cycle: ${billingCycle} for user ${req.user.id}`);
        const expirationDate = new Date();
        if (billingCycle === 'annual') {
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        } else {
          expirationDate.setMonth(expirationDate.getMonth() + 1);
        }

        // Return success response with user and subscription details
        return res.json({
          success: true,
          message: "Subscription processed successfully",
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            fullName: req.user.fullName,
            hasSubscription: true,
            subscriptionType: subscriptionType
          },
          subscription: {
            type: subscriptionType,
            billingCycle: billingCycle,
            expiresAt: expirationDate
          }
        });
      } catch (error) {
        console.error('Error updating user subscription:', error);
        return res.status(500).json({ error: "Failed to update subscription" });
      }
    }

    // Check if subscription dev mode is enabled
    let subscriptionDevMode = false;
    try {
      const settings = await storage.getAppSettings('subscriptionDevMode');
      subscriptionDevMode = settings === true;
    } catch (error) {
      console.error('Error checking subscription dev mode settings:', error);
    }

    try {
      const schema = z.object({
        type: z.enum(["limited", "unlimited", "individual", "family", "admin"]),
        billingCycle: z.enum(["monthly", "annual"]),
        paymentMethodId: z.string().optional(),
        paymentIntentId: z.string().optional(),
        stripeCustomerId: z.string().optional(),
        stripeSubscriptionId: z.string().optional(),
        action: z.enum(["subscribe", "switch", "cancel"]).default("subscribe"),
        testMode: z.boolean().optional() // Add test mode flag
      });

      const {
        type,
        billingCycle,
        paymentMethodId,
        paymentIntentId,
        stripeCustomerId,
        stripeSubscriptionId,
        action,
        testMode
      } = schema.parse(req.body);

      // Check if user already has an active subscription of the same type
      // Only do this check for new subscriptions, not for switches or cancellations
      if (action === "subscribe" && type === "unlimited") {
        const currentSubscription = await storage.getUserSubscriptionDetails(req.user.id);

        if (currentSubscription.hasSubscription && currentSubscription.type === "unlimited") {
          return res.status(400).json({
            success: false,
            message: "You already have an active Daswos Unlimited subscription",
            subscription: currentSubscription
          });
        }
      }

      // If subscription dev mode is enabled or testMode flag is set, return success without processing payment
      if (subscriptionDevMode || testMode) {
        console.log(`Processing subscription in ${testMode ? 'test mode' : 'dev mode'}`);

        // Set duration based on billing cycle
        const durationMonths = billingCycle === "annual" ? 12 : 1;

        // Update the user's subscription in our database
        const user = await storage.updateUserSubscription(req.user.id, type, durationMonths);

        // If we have Stripe subscription information, store it
        if (stripeCustomerId && stripeSubscriptionId && type !== 'limited') {
          await storage.createStripeSubscription(
            req.user.id,
            stripeCustomerId,
            stripeSubscriptionId,
            type,
            billingCycle
          );
        }

        return res.json({
          success: true,
          message: `Subscription processed successfully (${testMode ? 'test mode' : 'dev mode'})`,
          subscription: {
            type: type,
            billingCycle: billingCycle,
            expiresAt: user.subscriptionExpiresAt
          }
        });
      }

      // Handle subscription cancellation
      if (action === "cancel") {
        // Get the user's Stripe subscription
        const stripeSubscription = await storage.getStripeSubscription(req.user.id);

        if (stripeSubscription?.stripeSubscriptionId) {
          // Cancel the subscription in Stripe
          await storage.updateStripeSubscription(
            req.user.id,
            stripeSubscription.stripeSubscriptionId,
            'canceled'
          );
        }

        // Clear the user's subscription in our database
        const user = await storage.updateUserSubscription(req.user.id, "limited", 0);

        // Update the user object in the session to reflect the new subscription status
        if (req.user) {
          req.user.hasSubscription = false;
          req.user.subscriptionType = "limited";
          req.user.subscriptionExpiresAt = null;
        }

        return res.json({
          success: true,
          message: "Subscription canceled successfully",
          subscription: null
        });
      }

      // For free tier, just update the user subscription without payment
      if (type === "limited") {
        const user = await storage.updateUserSubscription(req.user.id, type, 0);

        // Update the user object in the session to reflect the new subscription status
        if (req.user) {
          req.user.hasSubscription = false;
          req.user.subscriptionType = "limited";
          req.user.subscriptionExpiresAt = null;
        }

        return res.json({
          success: true,
          message: "Free subscription activated successfully",
          subscription: {
            type,
            billingCycle: "monthly",
            expiresAt: null
          }
        });
      }

      // For paid subscriptions, we need payment information
      if (!stripeCustomerId && !paymentMethodId) {
        return res.status(400).json({
          error: "Payment information is required for paid subscriptions"
        });
      }

      // Set duration based on billing cycle
      const durationMonths = billingCycle === "annual" ? 12 : 1;

      // If we have a Stripe subscription ID, store it
      if (stripeSubscriptionId && stripeCustomerId) {
        // Create or update the Stripe subscription record
        await storage.createStripeSubscription(
          req.user.id,
          stripeCustomerId,
          stripeSubscriptionId,
          type,
          billingCycle
        );
      }

      // Update the user's subscription in our database
      const user = await storage.updateUserSubscription(req.user.id, type, durationMonths);

      // Update the user object in the session to reflect the new subscription status
      if (req.user) {
        req.user.hasSubscription = true;
        req.user.subscriptionType = type;
        req.user.subscriptionExpiresAt = new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000);
      }

      const actionMessage = action === "switch" ? "changed" : "activated";

      res.json({
        success: true,
        message: `Subscription ${actionMessage} successfully`,
        subscription: {
          type,
          billingCycle,
          expiresAt: user.subscriptionExpiresAt
        }
      });
    } catch (error) {
      console.error('Error processing subscription:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process subscription" });
    }
  });

  // Family account management endpoints

  // Create family invitation code
  app.post("/api/family/invitation", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Check if user has a family subscription
      const subscription = await storage.getUserSubscriptionDetails(req.user.id);
      if (!subscription.hasSubscription ||
          (subscription.type !== "unlimited" && subscription.type !== "family")) {
        return res.status(403).json({
          error: "Family account features require Daswos Unlimited subscription"
        });
      }

      // Check if user is a family owner
      const isOwner = await storage.isFamilyOwner(req.user.id);
      if (!isOwner) {
        return res.status(403).json({
          error: "Only family account owners can create invitation codes"
        });
      }

      // Get existing family members
      const members = await storage.getFamilyMembers(req.user.id);

      // Check if family member limit is reached (max 5 accounts including owner)
      if (members.length >= 4) { // 4 additional members + 1 owner = 5 total
        return res.status(403).json({
          error: "Family account limit reached (maximum 5 accounts)"
        });
      }

      // Create invitation code
      const { email, expiresInDays } = req.body;
      const invitation = await storage.createFamilyInvitationCode(
        req.user.id,
        email,
        expiresInDays || 7
      );

      res.json({
        success: true,
        invitation: {
          code: invitation.code,
          email: invitation.email,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (error) {
      console.error("Error creating family invitation:", error);
      res.status(500).json({ error: "Failed to create family invitation" });
    }
  });

  // Get family invitation codes
  app.get("/api/family/invitations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Check if user is a family owner
      const isOwner = await storage.isFamilyOwner(req.user.id);
      if (!isOwner) {
        return res.status(403).json({
          error: "Only family account owners can view invitation codes"
        });
      }

      // Get invitation codes
      const invitations = await storage.getFamilyInvitationsByOwner(req.user.id);

      res.json({
        success: true,
        invitations: invitations.map(inv => ({
          code: inv.code,
          email: inv.email,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
          isUsed: inv.isUsed,
          usedByUserId: inv.usedByUserId
        }))
      });
    } catch (error) {
      console.error("Error getting family invitations:", error);
      res.status(500).json({ error: "Failed to get family invitations" });
    }
  });

  // Join family with invitation code
  app.post("/api/family/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Invitation code is required" });
      }

      // Get invitation by code
      const invitation = await storage.getFamilyInvitationByCode(code);

      if (!invitation) {
        return res.status(404).json({ error: "Invalid invitation code" });
      }

      // Check if invitation is expired
      if (invitation.expiresAt < new Date()) {
        return res.status(403).json({ error: "Invitation code has expired" });
      }

      // Check if invitation is already used
      if (invitation.isUsed) {
        return res.status(403).json({ error: "Invitation code has already been used" });
      }

      // Get the family owner
      const owner = await storage.getUser(invitation.ownerUserId);
      if (!owner) {
        return res.status(404).json({ error: "Family owner account not found" });
      }

      // Check if owner still has a valid family subscription
      const ownerSubscription = await storage.getUserSubscriptionDetails(owner.id);
      if (!ownerSubscription.hasSubscription ||
          (ownerSubscription.type !== "unlimited" && ownerSubscription.type !== "family")) {
        return res.status(403).json({
          error: "Family owner no longer has an active family subscription"
        });
      }

      // Update user to be part of the family
      await db.update(users)
        .set({
          familyOwnerId: invitation.ownerUserId
        })
        .where(eq(users.id, req.user.id));

      // Mark invitation as used
      await storage.markFamilyInvitationAsUsed(code, req.user.id);

      res.json({
        success: true,
        message: "Successfully joined family account"
      });
    } catch (error) {
      console.error("Error joining family account:", error);
      res.status(500).json({ error: "Failed to join family account" });
    }
  });

  // Get family members
  app.get("/api/family/members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Check if user is a family owner
      const isFamilyOwner = await storage.isFamilyOwner(req.user.id);
      console.log(`User ID ${req.user.id}: isFamilyOwner = ${isFamilyOwner}`);

      if (!isFamilyOwner) {
        return res.status(403).json({ error: "You must be a family account owner to access this" });
      }

      const members = await storage.getFamilyMembers(req.user.id);
      console.log(`Retrieved ${members.length} family members for user ID ${req.user.id}`);

      res.json(members);
    } catch (error) {
      console.error('Error fetching family members:', error);
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });

  // Add family member
  app.post("/api/family/members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        email: z.string().email()
      });

      const { email } = schema.parse(req.body);

      const result = await storage.addFamilyMember(req.user.id, email);

      if (result.success) {
        res.status(201).json({ message: result.message });
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add family member" });
    }
  });

  // Remove family member
  app.delete("/api/family/members/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const memberId = parseInt(req.params.id);
      if (isNaN(memberId)) {
        return res.status(400).json({ error: "Invalid member ID" });
      }

      // First verify the user is a family owner
      const isFamilyOwner = await storage.isFamilyOwner(req.user.id);
      if (!isFamilyOwner) {
        return res.status(403).json({ error: "You must be a family account owner to remove members" });
      }

      // Get family members to verify the member belongs to this family
      const members = await storage.getFamilyMembers(req.user.id);
      const isMember = members.some(member => member.id === memberId);

      if (!isMember) {
        return res.status(404).json({ error: "Member not found in your family account" });
      }

      const success = await storage.removeFamilyMember(memberId);

      if (success) {
        res.json({ message: "Family member removed successfully" });
      } else {
        res.status(400).json({ error: "Failed to remove family member" });
      }
    } catch (error) {
      console.error('Error removing family member:', error);
      res.status(500).json({ error: "Failed to remove family member" });
    }
  });

  // SuperSafe mode endpoints

  // Get SuperSafe status
  app.get("/api/user/supersafe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const status = await storage.getSuperSafeStatus(req.user.id);
      res.json(status);
    } catch (error) {
      console.error('Error fetching SuperSafe status:', error);
      res.status(500).json({ error: "Failed to fetch SuperSafe status" });
    }
  });

  // Update SuperSafe status
  app.put("/api/user/supersafe", async (req, res) => {
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
        }).optional()
      });

      const { enabled, settings } = schema.parse(req.body);

      const success = await storage.updateSuperSafeStatus(req.user.id, enabled, settings);

      if (success) {
        res.json({ message: "SuperSafe settings updated successfully" });
      } else {
        res.status(400).json({ error: "Failed to update SuperSafe settings" });
      }
    } catch (error) {
      console.error('Error updating SuperSafe status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid SuperSafe settings", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update SuperSafe settings" });
    }
  });

  // AI Shopper endpoints

  // Get AI Shopper status
  app.get("/api/user/ai-shopper", async (req, res) => {
    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // Check for development mode message
    let devMessage = null;
    try {
      const aiDevMode = await storage.getAppSettings('aiShopperDevMode');
      if (aiDevMode === true) {
        devMessage = "Development mode: Daswos AI Shopper is collecting data through opensphere to improve recommendations.";
      }
    } catch (error) {
      console.error('Error checking AI development mode:', error);
    }

    // If paid features are disabled, provide free access
    if (paidFeaturesDisabled) {
      return res.json({
        enabled: true,
        freeAccess: true,
        devMessage,
        settings: {
          autoPurchase: false,  // Use autoPurchase instead of autoPurchaseEnabled to match frontend expectations
          budgetLimit: 5000,    // Use budgetLimit to match frontend expectations
          preferredCategories: ["all"],
          avoidTags: [],
          minimumTrustScore: 85
        }
      });
    }

    // Normal authentication check
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const status = await storage.getAiShopperStatus(req.user.id);

      // Add dev message if needed
      const responseData = {
        ...status,
        devMessage: devMessage || undefined
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching AI Shopper status:', error);
      res.status(500).json({ error: "Failed to fetch AI Shopper status" });
    }
  });

  // Update AI Shopper status
  app.put("/api/user/ai-shopper", async (req, res) => {
    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // If paid features are disabled, we accept all requests without authentication
    if (paidFeaturesDisabled) {
      try {
        const schema = z.object({
          enabled: z.boolean(),
          settings: z.object({
            autoPurchase: z.boolean().optional(),
            budgetLimit: z.number().min(0).optional(),
            preferredCategories: z.array(z.string()).optional(),
            avoidTags: z.array(z.string()).optional(),
            minimumTrustScore: z.number().min(0).max(100).optional()
          }).optional()
        });

        schema.parse(req.body); // Just validate but don't store

        // Return success without doing anything since everyone has access in free mode
        return res.json({
          message: "AI Shopper settings acknowledged (free access mode)",
          freeAccess: true
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: "Invalid AI Shopper settings", details: error.errors });
        }
        return res.status(500).json({ error: "Failed to process AI Shopper settings" });
      }
    }

    // Normal authentication check
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        enabled: z.boolean(),
        settings: z.object({
          autoPurchase: z.boolean().optional(),
          budgetLimit: z.number().optional(),
          preferredCategories: z.array(z.string()).optional(),
          avoidTags: z.array(z.string()).optional(),
          minimumTrustScore: z.number().optional()
        }).optional()
      });

      const { enabled, settings } = schema.parse(req.body);

      const success = await storage.updateAiShopperStatus(req.user.id, enabled, settings);

      if (success) {
        res.json({ message: "AI Shopper settings updated successfully" });
      } else {
        res.status(400).json({ error: "Failed to update AI Shopper settings" });
      }
    } catch (error) {
      console.error('Error updating AI Shopper status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid AI Shopper settings", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update AI Shopper settings" });
    }
  });

  // Get AI Shopper recommendations
  app.get("/api/user/ai-shopper/recommendations", async (req, res) => {
    // Require authentication for Super Shopper functionality
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // If paid features are disabled, provide actual recommendations using demo user
    if (paidFeaturesDisabled) {
      try {
        // Use a fixed demo user ID for free mode
        const demoUserId = 1;

        // Get real recommendations for the demo user
        const recommendations = await storage.getAiShopperRecommendationsByUserId(demoUserId);

        // If no recommendations exist yet for the demo user, return an empty array
        if (!recommendations || recommendations.length === 0) {
          return res.json([]);
        }

        // For each recommendation, we need to ensure the product details are included
        const enhancedRecommendations = await Promise.all(
          recommendations.map(async (rec) => {
            // Cast to extended type to help TypeScript understand we're adding a product property
            const extendedRec = rec as AiShopperRecommendationWithProduct;
            if (!extendedRec.product) {  // If product is not already included
              const product = await storage.getProductById(rec.productId);
              return {
                ...extendedRec,
                product
              };
            }
            return extendedRec;
          })
        );

        return res.json(enhancedRecommendations);
      } catch (error) {
        console.error('Error getting AI recommendations in free mode:', error);
        return res.json([]);  // Return empty array on error in free mode
      }
    }

    try {
      const recommendations = await storage.getAiShopperRecommendationsByUserId(req.user.id);

      // For each recommendation, we need to ensure the product details are included
      const enhancedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          // Cast to extended type to help TypeScript understand we're adding a product property
          const extendedRec = rec as AiShopperRecommendationWithProduct;
          if (!extendedRec.product) {  // If product is not already included
            const product = await storage.getProductById(rec.productId);
            return {
              ...extendedRec,
              product
            };
          }
          return extendedRec;
        })
      );

      res.json(enhancedRecommendations);
    } catch (error) {
      console.error('Error fetching AI Shopper recommendations:', error);
      res.status(500).json({ error: "Failed to fetch AI Shopper recommendations" });
    }
  });

  // Clear all AI Shopper recommendations
  app.post("/api/user/ai-shopper/recommendations/clear", async (req, res) => {
    // Require authentication for Super Shopper functionality
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    try {
      let userId;

      if (paidFeaturesDisabled) {
        // In demo mode, clear recommendations for demo user
        userId = 1;
      } else {
        userId = req.user.id;
      }

      // Clear all recommendations for the user
      await storage.clearAiShopperRecommendations(userId);

      res.json({ success: true, message: "All recommendations have been cleared" });
    } catch (error) {
      console.error('Error clearing AI Shopper recommendations:', error);
      res.status(500).json({ error: "Failed to clear recommendations" });
    }
  });

  // Create a new AI Shopper recommendation
  app.post("/api/user/ai-shopper/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        productId: z.number(),
        reason: z.string(),
        confidence: z.number().min(0).max(100)
      });

      const data = schema.parse(req.body);

      // Add the user ID to the request
      const recommendationData = {
        ...data,
        userId: req.user.id
      };

      const recommendation = await storage.createAiShopperRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error('Error creating AI Shopper recommendation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid recommendation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create AI Shopper recommendation" });
    }
  });

  // Update AI Shopper recommendation status
  app.put("/api/user/ai-shopper/recommendations/:id", async (req, res) => {
    // Require authentication for Super Shopper functionality
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid recommendation ID" });
      }

      const schema = z.object({
        status: z.enum(["pending", "added_to_cart", "purchased", "rejected"]),
        reason: z.string().optional(),
        removeFromList: z.boolean().optional() // Add new parameter for complete removal
      });

      const { status, reason, removeFromList } = schema.parse(req.body);

      const recommendation = await storage.updateAiShopperRecommendationStatus(id, status, reason, removeFromList);
      res.json(recommendation);
    } catch (error) {
      console.error('Error updating AI Shopper recommendation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update recommendation status" });
    }
  });

  // Generate Super Shopper recommendations
  app.post("/api/user/ai-shopper/generate", async (req, res) => {
    // Require authentication for Super Shopper functionality
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // Check for development mode message
    let devMessage = null;
    try {
      const aiDevMode = await storage.getAppSettings('aiShopperDevMode');
      if (aiDevMode === true) {
        devMessage = "Development mode: Daswos Super Shopper is collecting data through opensphere to improve recommendations.";
      }
    } catch (error) {
      console.error('Error checking Super Shopper development mode:', error);
    }

    // If paid features are disabled, provide full-featured demo response
    if (paidFeaturesDisabled) {
      try {
        // Extract search query from request body
        const { searchQuery, bulkBuy = false } = req.body;
        console.log(`Free mode AI Search query: "${searchQuery}", Bulk Buy: ${bulkBuy}`);

        // Actually call the generateAiRecommendations function, but with default user ID 1 (demo user)
        // This ensures all filters are properly applied, including trust score
        const demoUserId = 1; // Use the demo user for free mode
        const emptySearchHistory: string[] = [];
        const emptyShoppingList = "";
        const result = await storage.generateAiRecommendations(demoUserId, searchQuery, bulkBuy, emptySearchHistory, emptyShoppingList);

        // Add additional context for free mode
        return res.json({
          ...result,
          message: result.success
            ? "Generated recommendations successfully" + (devMessage ? ` (${devMessage})` : "")
            : result.message,
          freeAccess: true
        });
      } catch (error) {
        console.error('Error handling free mode AI generation:', error);
        return res.status(500).json({
          error: "Failed to process AI request",
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Handle authenticated users
    const userId = req.user.id;
    let searchHistory: string[] = [];
    let shoppingList = "";

    try {
      // Extract search query and bulk buy option from request body
      const { searchQuery = "", bulkBuy = false, shoppingList: userShoppingList = "" } = req.body;

      // For authenticated users, get their actual data
      shoppingList = userShoppingList;

      // Get user's recent search history (last 5 searches)
      const recentSearches = await storage.getRecentSearches(5);
      const userSearches = recentSearches.filter(search => search.userId === userId);
      searchHistory = userSearches.map(search => search.query);

      console.log(`Authenticated AI Search query: "${searchQuery}", Bulk Buy: ${bulkBuy}, User ID: ${userId}`);
      console.log('Using search history for recommendations:', searchHistory);

      // Pass all parameters to storage
      const result = await storage.generateAiRecommendations(
        userId,
        searchQuery,
        bulkBuy,
        searchHistory,
        shoppingList
      );

      // Save this search query for future recommendations (only for authenticated users)
      if (searchQuery && searchQuery.trim() !== '' && req.isAuthenticated() && req.user) {
        await storage.saveSearchQuery({
          userId: req.user.id,
          query: searchQuery.trim(),
          sphere: bulkBuy ? 'bulkbuy' : 'safesphere'
        });
      }

      // Create response object with dev message if needed
      const response = {
        ...result,
        devMessage: devMessage || undefined
      };

      res.json(response);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      res.status(500).json({
        error: "Failed to generate AI recommendations",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Process auto-purchase for a recommendation
  app.post("/api/user/ai-shopper/recommendations/:id/purchase", async (req, res) => {
    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // If paid features are disabled, provide simplified demo response
    if (paidFeaturesDisabled) {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ error: "Invalid recommendation ID" });
        }

        // Simulate purchase process in free mode
        return res.json({
          success: true,
          message: "Purchase processed in free access mode",
          freeAccess: true,
          recommendationId: id,
          purchaseStatus: "completed"
        });
      } catch (error) {
        console.error('Error handling free mode purchase:', error);
        return res.status(500).json({
          error: "Failed to process purchase",
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Normal authentication check
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid recommendation ID" });
      }

      const result = await storage.processAutoPurchase(id);
      res.json(result);
    } catch (error) {
      console.error('Error processing auto-purchase:', error);
      res.status(500).json({
        error: "Failed to process purchase",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get SafeSphere status
  app.get("/api/user/safesphere", async (req, res) => {
    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // If paid features are disabled, don't require authentication
    if (paidFeaturesDisabled) {
      return res.json({ active: true, freeAccess: true });
    }

    // Normal authentication check
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const active = await storage.getSafeSphereStatus(req.user.id);
      res.json({ active });
    } catch (error) {
      console.error('Error fetching SafeSphere status:', error);
      res.status(500).json({ error: "Failed to fetch SafeSphere status" });
    }
  });

  // Update SafeSphere status
  app.put("/api/user/safesphere", async (req, res) => {
    // Check if paid features are disabled
    let paidFeaturesDisabled = false;
    try {
      const settings = await storage.getAppSettings('paidFeaturesDisabled');
      paidFeaturesDisabled = settings === true;
    } catch (error) {
      console.error('Error checking paid features settings:', error);
    }

    // If paid features are disabled, we accept all requests without authentication
    if (paidFeaturesDisabled) {
      try {
        const schema = z.object({
          active: z.boolean()
        });

        schema.parse(req.body); // Just validate but don't store

        // Return success without doing anything since everyone has access in free mode
        return res.json({
          message: "SafeSphere setting acknowledged (free access mode)",
          freeAccess: true
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: "Invalid SafeSphere setting", details: error.errors });
        }
        return res.status(500).json({ error: "Failed to process SafeSphere setting" });
      }
    }

    // Normal authentication check for paid mode
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        active: z.boolean()
      });

      const { active } = schema.parse(req.body);

      const success = await storage.updateSafeSphereStatus(req.user.id, active);

      if (success) {
        res.json({ message: "SafeSphere setting updated successfully" });
      } else {
        res.status(400).json({ error: "Failed to update SafeSphere setting" });
      }
    } catch (error) {
      console.error('Error updating SafeSphere status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid SafeSphere setting", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update SafeSphere setting" });
    }
  });

  // Create a child account
  app.post("/api/family/children", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        childName: z.string().min(2).max(50)
      });

      const { childName } = schema.parse(req.body);

      console.log(`Creating child account for owner ID ${req.user.id}, child name: ${childName}`);

      // First verify the user is a family owner
      const isFamilyOwner = await storage.isFamilyOwner(req.user.id);
      if (!isFamilyOwner) {
        return res.status(403).json({ error: "You must be a family account owner to create child accounts" });
      }

      const result = await storage.createChildAccount(req.user.id, childName);

      if (result.success) {
        res.status(201).json({
          message: result.message,
          account: result.account
        });
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error('Error creating child account:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid child account data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create child account" });
    }
  });

  // Update child account username
  app.put("/api/family/children/:id/username", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const childId = parseInt(req.params.id);
      if (isNaN(childId)) {
        return res.status(400).json({ error: "Invalid child account ID" });
      }

      const schema = z.object({
        newUsername: z.string().min(3).max(30)
      });

      const { newUsername } = schema.parse(req.body);

      // First verify the user is a family owner
      const isFamilyOwner = await storage.isFamilyOwner(req.user.id);
      if (!isFamilyOwner) {
        return res.status(403).json({ error: "You must be a family account owner to manage child accounts" });
      }

      // Get family members to verify the child belongs to this family
      const members = await storage.getFamilyMembers(req.user.id);
      const isChild = members.some(member => member.id === childId && member.isChildAccount);

      if (!isChild) {
        return res.status(404).json({ error: "Child not found in your family account" });
      }

      // In actual implementation, update the username
      console.log(`Updating username for child ID ${childId} to: ${newUsername}`);

      // Here we would call a storage method
      // const success = await storage.updateChildAccountUsername(childId, newUsername);

      // For now, simulate success
      res.json({
        success: true,
        message: "Child account username updated successfully"
      });
    } catch (error) {
      console.error('Error updating child username:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid username", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update child account username" });
    }
  });

  // Update child account password
  app.put("/api/family/children/:id/password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const childId = parseInt(req.params.id);
      if (isNaN(childId)) {
        return res.status(400).json({ error: "Invalid child account ID" });
      }

      const schema = z.object({
        newPassword: z.string().min(6)
      });

      const { newPassword } = schema.parse(req.body);

      // First verify the user is a family owner
      const isFamilyOwner = await storage.isFamilyOwner(req.user.id);
      if (!isFamilyOwner) {
        return res.status(403).json({ error: "You must be a family account owner to manage child accounts" });
      }

      // Get family members to verify the child belongs to this family
      const members = await storage.getFamilyMembers(req.user.id);
      const isChild = members.some(member => member.id === childId && member.isChildAccount);

      if (!isChild) {
        return res.status(404).json({ error: "Child not found in your family account" });
      }

      // Update the password
      const success = await storage.updateChildAccountPassword(childId, newPassword);

      if (success) {
        res.json({
          success: true,
          message: "Child account password updated successfully"
        });
      } else {
        res.status(400).json({ error: "Failed to update child account password" });
      }
    } catch (error) {
      console.error('Error updating child password:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid password", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update child account password" });
    }
  });

  // Update family member SuperSafe status (family owner only)
  app.put("/api/family/members/:id/supersafe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const memberId = parseInt(req.params.id);
      if (isNaN(memberId)) {
        return res.status(400).json({ error: "Invalid member ID" });
      }

      const schema = z.object({
        enabled: z.boolean(),
        settings: z.object({
          blockGambling: z.boolean(),
          blockAdultContent: z.boolean(),
          blockOpenSphere: z.boolean()
        }).optional()
      });

      const { enabled, settings } = schema.parse(req.body);

      const success = await storage.updateFamilyMemberSuperSafeStatus(req.user.id, memberId, enabled, settings);

      if (success) {
        res.json({ message: "Family member SuperSafe settings updated successfully" });
      } else {
        res.status(403).json({ error: "You don't have permission to update this member's settings or the member doesn't exist" });
      }
    } catch (error) {
      console.error('Error updating family member SuperSafe status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid SuperSafe settings", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update family member SuperSafe settings" });
    }
  });

  // Child account endpoints - already added above

  // Payment Methods routes

  // Get user's payment methods
  app.get("/api/user/payment-methods", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const paymentMethods = await storage.getUserPaymentMethods(req.user.id);
      return res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Add a new payment method
  app.post("/api/user/payment-methods", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const schema = z.object({
        stripeCustomerId: z.string(),
        stripePaymentMethodId: z.string(),
        last4: z.string().length(4),
        cardType: z.string(),
        expiryMonth: z.number(),
        expiryYear: z.number(),
        isDefault: z.boolean().optional()
      });

      const validatedData = schema.parse(req.body);

      // Add the payment method to our database
      const paymentMethod = await storage.addUserPaymentMethod({
        userId: req.user.id,
        ...validatedData
      });

      // If this is the first payment method or is set as default,
      // check if the user has an active subscription and update it in Stripe
      if (validatedData.isDefault || paymentMethod.isDefault) {
        const stripeSubscription = await storage.getStripeSubscription(req.user.id);

        if (stripeSubscription?.stripeSubscriptionId) {
          // In a real implementation, we would update the payment method in Stripe
          // await stripe.subscriptions.update(stripeSubscription.stripeSubscriptionId, {
          //   default_payment_method: validatedData.stripePaymentMethodId
          // });
          console.log(`Updated default payment method for subscription ${stripeSubscription.stripeSubscriptionId}`);
        }
      }

      return res.json(paymentMethod);
    } catch (error) {
      console.error('Error adding payment method:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment method data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to add payment method" });
    }
  });

  // Set default payment method
  app.put("/api/user/payment-methods/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment method ID" });
      }

      const success = await storage.setDefaultPaymentMethod(id, req.user.id);

      if (!success) {
        return res.status(404).json({ error: "Payment method not found or doesn't belong to user" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return res.status(500).json({ error: "Failed to set default payment method" });
    }
  });

  // Delete payment method
  app.delete("/api/user/payment-methods/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment method ID" });
      }

      const success = await storage.deletePaymentMethod(id);

      if (!success) {
        return res.status(404).json({ error: "Payment method not found" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return res.status(500).json({ error: "Failed to delete payment method" });
    }
  });

  // Bulk Buy Agent Request API
  app.post("/api/bulk-buy/requests", async (req, res) => {
    // Check if user is logged in
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const requestData = req.body;

      if (!requestData) {
        return res.status(400).json({ error: "Missing request data" });
      }

      // Make sure we have a valid user
      const userId = req.user.id;

      // Validate request data using Zod schema
      const validatedData = insertBulkBuyRequestSchema.parse({
        ...requestData,
        userId
      });

      // Store the bulk buy request
      const bulkBuyRequest = await storage.createBulkBuyRequest(validatedData);

      return res.status(201).json(bulkBuyRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors
        });
      }

      console.error("Error creating bulk buy request:", error);
      return res.status(500).json({ error: "Failed to create bulk buy request" });
    }
  });

  // Get user's bulk buy requests
  app.get("/api/bulk-buy/requests", async (req, res) => {
    // Check if user is logged in
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = req.user.id;
      const requests = await storage.getBulkBuyRequestsByUserId(userId);
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching bulk buy requests:", error);
      return res.status(500).json({ error: "Failed to fetch bulk buy requests" });
    }
  });

  // Get a specific bulk buy request
  app.get("/api/bulk-buy/requests/:id", async (req, res) => {
    // Check if user is logged in
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      const bulkBuyRequest = await storage.getBulkBuyRequestById(requestId);

      if (!bulkBuyRequest) {
        return res.status(404).json({ error: "Bulk buy request not found" });
      }

      // Make sure the user has access to this request
      if (bulkBuyRequest.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      return res.json(bulkBuyRequest);
    } catch (error) {
      console.error("Error fetching bulk buy request:", error);
      return res.status(500).json({ error: "Failed to fetch bulk buy request" });
    }
  });

  // Create standard (free) account
  app.post("/api/register/standard", async (req, res) => {
    try {
      const { username, email, fullName, password } = req.body;

      // Validate required fields
      if (!username || !email || !fullName || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with standard subscription
      const user = await storage.createUser({
        username,
        email,
        fullName,
        password: hashedPassword
      });

      // Set the user as having a standard subscription
      await storage.updateUserSubscription(user.id, "standard", 0); // No expiration for standard accounts

      // Authenticate the user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after standard registration:", err);
          return res.status(500).json({ error: "Error during authentication after registration" });
        }

        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          subscriptionType: "standard",
          hasSubscription: true
        });
      });
    } catch (error) {
      console.error("Error during standard registration:", error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  // App settings routes
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAllAppSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ error: "Failed to fetch app settings" });
    }
  });

  // Admin logout endpoint - clear server-side session
  app.post("/api/admin/logout", async (req, res) => {
    console.log("Admin logout requested");

    // Get the session token from the request if available
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                         req.body?.sessionToken;

    // Special handling for the hardcoded admin user (ID 999999)
    const isHardcodedAdmin = req.isAuthenticated() && req.user?.id === 999999;
    if (isHardcodedAdmin) {
      console.log("Logging out hardcoded admin user (ID 999999)");
    }

    // If we have a session token, deactivate it in the database
    if (sessionToken) {
      try {
        console.log("Deactivating user session token:", sessionToken);
        await storage.deactivateSession(sessionToken);
      } catch (error) {
        console.error("Error deactivating session token:", error);
      }
    }

    // If the user is authenticated, also deactivate all their sessions
    if (req.isAuthenticated() && req.user?.id) {
      try {
        console.log("Deactivating all sessions for user ID:", req.user.id);
        await storage.deactivateAllUserSessions(req.user.id);
      } catch (error) {
        console.error("Error deactivating all user sessions:", error);
      }
    }

    // Also try to deactivate sessions for the admin user by username
    try {
      const adminUser = await storage.getUserByUsername('admin');
      if (adminUser) {
        console.log("Found admin user in database, deactivating all sessions for user ID:", adminUser.id);
        await storage.deactivateAllUserSessions(adminUser.id);
      }
    } catch (error) {
      console.error("Error deactivating admin user sessions:", error);
    }

    // Create a promise-based wrapper for the logout process
    const logoutPromise = new Promise<void>((resolve) => {
      // Force logout the user from passport
      if (req.isAuthenticated()) {
        console.log("Logging out authenticated user:", req.user?.username);
        req.logout((err) => {
          if (err) {
            console.error("Error in passport logout:", err);
          }
          resolve(); // Resolve regardless of error
        });
      } else {
        resolve(); // No authenticated user to logout
      }
    });

    // Handle the session destruction
    logoutPromise.then(() => {
      if (!req.session) {
        console.log("No session to destroy");
        return res.json({ success: true });
      }

      // Clear all session data
      req.session.isAdmin = false;
      req.session.adminUser = null;

      // Create a promise for session regeneration
      const regeneratePromise = new Promise<void>((resolve) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Error regenerating session:", err);
          }
          resolve(); // Resolve regardless of error
        });
      });

      // After regeneration, destroy the session
      regeneratePromise.then(() => {
        // Create a promise for session destruction
        const destroyPromise = new Promise<void>((resolve) => {
          if (!req.session) {
            resolve();
            return;
          }

          req.session.destroy((err) => {
            if (err) {
              console.error("Error destroying admin session:", err);
            }
            resolve(); // Resolve regardless of error
          });
        });

        // After destruction, clear cookies and send response
        destroyPromise.then(() => {
          // Clear all possible cookies
          res.clearCookie('connect.sid', { path: '/' });
          res.clearCookie('connect.sid');

          // Also try clearing with different options in case the cookie was set with specific options
          res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
          });

          console.log("Admin session destroyed successfully");
          return res.json({ success: true });
        });
      });
    }).catch((error) => {
      console.error("Error in admin logout process:", error);
      return res.status(500).json({ error: "Logout failed" });
    });
  });

  // Admin login endpoint - authenticate with server-side session
  app.post("/api/admin/session-login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        console.error("Missing username or password in admin login attempt");
        return res.status(400).json({ error: "Username and password are required" });
      }

      console.log(`Admin login attempt for: "${username}"`);

      // SPECIAL HARDCODED ADMIN CREDENTIALS
      // For development/demo purposes only
      const HARDCODED_ADMIN = {
        username: 'admin',
        password: 'SODA'
      };

      // Check if this is the hardcoded admin login
      if (username === HARDCODED_ADMIN.username && password === HARDCODED_ADMIN.password) {
        console.log("Using hardcoded admin credentials - successful login");

        // Create an admin user object in memory (not saved to database)
        const adminUser = {
          id: 999999, // Special admin ID
          username: HARDCODED_ADMIN.username,
          email: 'admin@daswos.com',
          fullName: 'Admin User',
          isAdmin: true,
          isSeller: false,
          createdAt: new Date()
        };

        // Log in using the admin user object
        req.login(adminUser, (err) => {
          if (err) {
            console.error("Error logging in admin user:", err);
            return res.status(500).json({ error: "Login error" });
          }

          console.log("Admin logged in successfully with hardcoded credentials");

          // Set admin session
          if (req.session) {
            req.session.isAdmin = true;
          }

          // Return success response
          return res.json({
            success: true,
            user: {
              id: adminUser.id,
              username: adminUser.username,
              isAdmin: true
            }
          });
        });
      } else {
        // Get the list of admin users from settings
        try {
          const settings = await storage.getAllAppSettings();
          const adminUsers = settings.admin_users || ["admin"];

          if (adminUsers.includes(username)) {
            console.log(`Username "${username}" is in authorized admin list`);

            // Try to find the user in database
            let user = null;
            try {
              user = await storage.getUserByUsername(username);
            } catch (lookupError) {
              console.error("Error looking up user:", lookupError);
            }

            // If found, validate password
            if (user) {
              try {
                const passwordValid = await comparePasswords(password, user.password);
                if (passwordValid) {
                  // Ensure admin flag is set
                  user.isAdmin = true;

                  // Login
                  req.login(user, (err) => {
                    if (err) {
                      console.error("Error in passport login:", err);
                      return res.status(500).json({ error: "Login error" });
                    }

                    console.log(`Admin "${username}" logged in successfully with database credentials`);

                    return res.json({
                      success: true,
                      user: {
                        id: user.id,
                        username: user.username,
                        isAdmin: true
                      }
                    });
                  });
                } else {
                  console.log("Invalid password for admin user");
                  return res.status(401).json({ error: "Invalid credentials" });
                }
              } catch (passwordError) {
                console.error("Error checking password:", passwordError);
                return res.status(500).json({ error: "Authentication error" });
              }
            } else {
              console.log("Admin user in settings but not in database");
              return res.status(401).json({ error: "Invalid credentials" });
            }
          } else {
            console.log(`Username "${username}" not in admin list`);
            return res.status(401).json({ error: "Invalid credentials" });
          }
        } catch (settingsError) {
          console.error("Error fetching admin settings:", settingsError);
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }
    } catch (error) {
      console.error('Error in admin login:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Admin seller verification management endpoints
  app.get("/api/admin/seller-verifications", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check for admin authorization - from user object, session, or custom admin criteria
      const isAdmin = req.user?.isAdmin === true || req.session?.isAdmin === true || req.user?.username === 'admin';

      console.log('Admin check - User:', req.user);
      console.log('Session admin flag:', req.session?.isAdmin);
      console.log('isAdmin result:', isAdmin);

      if (!isAdmin) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Get all seller verifications, including the associated user details
      const verifications = await storage.getAllSellerVerifications();
      console.log('Fetched seller verifications:', verifications?.length || 0);
      return res.json({ verifications: verifications || [] });
    } catch (error) {
      console.error('Error fetching seller verifications:', error);
      return res.status(500).json({ error: 'Failed to fetch seller verifications' });
    }
  });

  app.post("/api/admin/approve-seller/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check for admin authorization - from user object, session, or custom admin criteria
      const isAdmin = req.user?.isAdmin === true || req.session?.isAdmin === true || req.user?.username === 'admin';

      if (!isAdmin) {
        console.log('Unauthorized attempt to approve seller');
        return res.status(403).json({ error: 'Not authorized' });
      }

      const sellerId = parseInt(req.params.id);
      if (isNaN(sellerId)) {
        console.log(`Invalid seller ID: ${req.params.id}`);
        return res.status(400).json({ error: 'Invalid seller ID' });
      }

      console.log(`Attempting to approve seller with ID: ${sellerId}`);

      // Get the seller to approve
      const seller = await storage.getSellerById(sellerId);
      if (!seller) {
        console.log(`Seller with ID ${sellerId} not found`);
        return res.status(404).json({ error: 'Seller not found' });
      }

      console.log(`Found seller:`, seller);

      // Update the seller status to approved
      console.log(`Updating seller verification status to approved`);
      const updatedSeller = await storage.updateSeller(sellerId, {
        verification_status: 'approved',
        verificationStatus: 'approved',
        updated_at: new Date(),
        updatedAt: new Date()
      });

      // Update the user's seller status
      const userId = seller.userId || seller.user_id;
      if (!userId) {
        console.error(`No user ID found for seller ${sellerId}. User ID field is ${userId}`);
        return res.status(500).json({ error: 'No user ID associated with this seller' });
      }

      console.log(`Updating user ${userId} to have seller status`);

      try {
        // Don't update user status for hardcoded admin
        if (userId === 999999) {
          console.log(`Skipping seller status update for admin user ID ${userId}`);
        } else {
          const updateResult = await storage.updateUserSellerStatus(userId, true);
          if (!updateResult) {
            console.log(`Warning: Failed to update user ${userId} seller status, but proceeding with approval`);
          }

          // Force client refresh: invalidate user data cache by setting a header
          res.setHeader('X-Refresh-User-Data', 'true');
        }
      } catch (error) {
        console.error(`Error updating user seller status: ${error}`);
        console.log('Proceeding with seller approval despite user status update error');
      }

      console.log(`Successfully approved seller ${sellerId} for user ${userId}`);
      return res.json({
        success: true,
        message: 'Seller approved successfully',
        refresh: true, // Signal client to refresh user data
        seller: updatedSeller
      });
    } catch (error) {
      console.error('Error approving seller:', error);
      return res.status(500).json({ error: 'Failed to approve seller' });
    }
  });

  app.post("/api/admin/reject-seller/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check for admin authorization - from user object, session, or custom admin criteria
      const isAdmin = req.user?.isAdmin === true || req.session?.isAdmin === true || req.user?.username === 'admin';

      if (!isAdmin) {
        console.log('Unauthorized attempt to reject seller');
        return res.status(403).json({ error: 'Not authorized' });
      }

      const sellerId = parseInt(req.params.id);
      if (isNaN(sellerId)) {
        console.log(`Invalid seller ID: ${req.params.id}`);
        return res.status(400).json({ error: 'Invalid seller ID' });
      }

      console.log(`Attempting to reject seller with ID: ${sellerId}`);

      // Get the seller to reject
      const seller = await storage.getSellerById(sellerId);
      if (!seller) {
        console.log(`Seller with ID ${sellerId} not found`);
        return res.status(404).json({ error: 'Seller not found' });
      }

      console.log(`Found seller:`, seller);

      // Get reason from request body if provided
      const { reason } = req.body;
      console.log(`Rejection reason: ${reason || 'No reason provided'}`);

      // Update the seller status to rejected
      console.log(`Updating seller verification status to rejected`);
      const updatedSeller = await storage.updateSeller(sellerId, {
        verification_status: 'rejected',
        verificationStatus: 'rejected',
        rejection_reason: reason || 'Rejected by admin',
        rejectionReason: reason || 'Rejected by admin',
        updated_at: new Date(),
        updatedAt: new Date()
      });

      console.log(`Successfully rejected seller ${sellerId}`);
      return res.json({
        success: true,
        message: 'Seller rejected successfully',
        seller: updatedSeller
      });
    } catch (error) {
      console.error('Error rejecting seller:', error);
      return res.status(500).json({ error: 'Failed to reject seller' });
    }
  });

  app.get("/api/admin/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const value = await storage.getAppSettings(key);

      if (value === null) {
        return res.status(404).json({ error: "Setting not found" });
      }

      res.json({ key, value });
    } catch (error) {
      console.error(`Error fetching app setting ${req.params.key}:`, error);
      res.status(500).json({ error: "Failed to fetch app setting" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const { key, value } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key and value are required" });
      }

      const success = await storage.setAppSettings(key, value);

      if (!success) {
        return res.status(500).json({ error: "Failed to save setting" });
      }

      res.status(200).json({ key, value });
    } catch (error) {
      console.error("Error saving app setting:", error);
      res.status(500).json({ error: "Failed to save app setting" });
    }
  });

  // Collaborative Search Routes

  // Create a new collaborative search
  app.post("/api/collaborative-search", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a collaborative search" });
      }

      const userId = req.user.id;
      const searchData = insertCollaborativeSearchSchema.parse({
        ...req.body,
        userId
      });

      const newSearch = await storage.createCollaborativeSearch(searchData);
      res.status(201).json(newSearch);
    } catch (error) {
      console.error('Error creating collaborative search:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create collaborative search" });
    }
  });

  // Get user's collaborative searches
  app.get("/api/collaborative-search/user", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your searches" });
      }

      const userId = req.user.id;
      const searches = await storage.getUserCollaborativeSearches(userId);
      res.json(searches);
    } catch (error) {
      console.error('Error fetching user collaborative searches:', error);
      res.status(500).json({ message: "Failed to fetch collaborative searches" });
    }
  });

  // Get a specific collaborative search by ID
  app.get("/api/collaborative-search/:id", async (req, res) => {
    try {
      const searchId = parseInt(req.params.id);
      if (isNaN(searchId)) {
        return res.status(400).json({ message: "Invalid search ID" });
      }

      const search = await storage.getCollaborativeSearchById(searchId);
      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      // If the search is not public, check if the user is a collaborator
      if (!search.isPublic && req.isAuthenticated()) {
        const userId = req.user.id;
        if (search.userId !== userId) {
          const collaborators = await storage.getSearchCollaborators(searchId);
          const isCollaborator = collaborators.some(c => c.userId === userId && c.status === 'active');

          if (!isCollaborator) {
            return res.status(403).json({ message: "You do not have permission to view this search" });
          }
        }
      } else if (!search.isPublic && !req.isAuthenticated()) {
        return res.status(403).json({ message: "You do not have permission to view this search" });
      }

      res.json(search);
    } catch (error) {
      console.error('Error fetching collaborative search by ID:', error);
      res.status(500).json({ message: "Failed to fetch collaborative search" });
    }
  });

  // Update a collaborative search
  app.patch("/api/collaborative-search/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update a search" });
      }

      const searchId = parseInt(req.params.id);
      if (isNaN(searchId)) {
        return res.status(400).json({ message: "Invalid search ID" });
      }

      // Get the search to check ownership
      const search = await storage.getCollaborativeSearchById(searchId);
      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      // Check if the user is the owner
      const userId = req.user.id;
      if (search.userId !== userId) {
        // Check if they're at least a collaborator with proper role
        const collaborators = await storage.getSearchCollaborators(searchId);
        const userCollaborator = collaborators.find(c => c.userId === userId && c.status === 'active');

        if (!userCollaborator || userCollaborator.role !== 'owner') {
          return res.status(403).json({ message: "You do not have permission to update this search" });
        }
      }

      const updatedSearch = await storage.updateCollaborativeSearch(searchId, req.body);
      res.json(updatedSearch);
    } catch (error) {
      console.error('Error updating collaborative search:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update collaborative search" });
    }
  });

  // Search for public collaborative searches
  app.get("/api/collaborative-search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const topic = req.query.topic as string;

      const searches = await storage.searchCollaborativeSearches(query, topic);
      res.json(searches);
    } catch (error) {
      console.error('Error searching collaborative searches:', error);
      res.status(500).json({ message: "Failed to search collaborative searches" });
    }
  });

  // Resource routes

  // Add a resource to a collaborative search
  app.post("/api/collaborative-resource", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to add a resource" });
      }

      const userId = req.user.id;
      const resourceData = insertCollaborativeResourceSchema.parse({
        ...req.body,
        userId
      });

      // Check if the user has permission to add resources to this search
      const searchId = resourceData.searchId;
      const search = await storage.getCollaborativeSearchById(searchId);

      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      if (search.userId !== userId) {
        // Check if they're at least a collaborator
        const collaborators = await storage.getSearchCollaborators(searchId);
        const isCollaborator = collaborators.some(c => c.userId === userId && c.status === 'active');

        if (!isCollaborator) {
          return res.status(403).json({ message: "You do not have permission to add resources to this search" });
        }
      }

      const newResource = await storage.addResourceToCollaborativeSearch(resourceData);
      res.status(201).json(newResource);
    } catch (error) {
      console.error('Error adding resource to collaborative search:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add resource to collaborative search" });
    }
  });

  // Get resources for a specific collaborative search
  app.get("/api/collaborative-search/:id/resources", async (req, res) => {
    try {
      const searchId = parseInt(req.params.id);
      if (isNaN(searchId)) {
        return res.status(400).json({ message: "Invalid search ID" });
      }

      // Get the search to check access rights
      const search = await storage.getCollaborativeSearchById(searchId);
      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      // If not public and user is not authenticated, deny access
      if (!search.isPublic && !req.isAuthenticated()) {
        return res.status(403).json({ message: "You do not have permission to view these resources" });
      }

      // If not public, check if user is owner or collaborator
      if (!search.isPublic && req.isAuthenticated()) {
        const userId = req.user.id;
        if (search.userId !== userId) {
          const collaborators = await storage.getSearchCollaborators(searchId);
          const isCollaborator = collaborators.some(c => c.userId === userId && c.status === 'active');

          if (!isCollaborator) {
            return res.status(403).json({ message: "You do not have permission to view these resources" });
          }
        }
      }

      const resources = await storage.getResourcesBySearchId(searchId);
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources by search ID:', error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Get a specific resource by ID
  app.get("/api/collaborative-resource/:id", async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }

      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check if this resource requires permission and if the user has permission
      if (resource.requiresPermission) {
        if (!req.isAuthenticated()) {
          return res.status(403).json({
            message: "This resource requires permission to access",
            requiresPermission: true
          });
        }

        const userId = req.user.id;

        // Resource owner can always access
        if (resource.userId === userId) {
          return res.json(resource);
        }

        // Check if this is from a public search
        const search = await storage.getCollaborativeSearchById(resource.searchId);
        if (!search || !search.isPublic) {
          // If not a public search, check if user is a collaborator
          const collaborators = await storage.getSearchCollaborators(resource.searchId);
          const isCollaborator = collaborators.some(c => c.userId === userId && c.status === 'active');

          if (!isCollaborator) {
            return res.status(403).json({
              message: "This resource requires permission to access",
              requiresPermission: true,
              resourceId: resource.id
            });
          }
        }
      }

      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource by ID:', error);
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // Update a resource
  app.patch("/api/collaborative-resource/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update a resource" });
      }

      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }

      // Get the resource to check ownership
      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check if the user is the owner of the resource
      const userId = req.user.id;
      if (resource.userId !== userId) {
        // Check if they're at least a collaborator with proper role on the search
        const search = await storage.getCollaborativeSearchById(resource.searchId);
        if (!search) {
          return res.status(404).json({ message: "Associated collaborative search not found" });
        }

        // Search owner can update any resource
        if (search.userId !== userId) {
          return res.status(403).json({ message: "You do not have permission to update this resource" });
        }
      }

      const updatedResource = await storage.updateResource(resourceId, req.body);
      res.json(updatedResource);
    } catch (error) {
      console.error('Error updating resource:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  // Collaborator routes

  // Add a collaborator to a search
  app.post("/api/collaborative-search/:id/collaborator", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to add a collaborator" });
      }

      const searchId = parseInt(req.params.id);
      if (isNaN(searchId)) {
        return res.status(400).json({ message: "Invalid search ID" });
      }

      // Get the search to check ownership
      const search = await storage.getCollaborativeSearchById(searchId);
      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      // Check if the current user is the owner or has permission to add collaborators
      const currentUserId = req.user.id;
      if (search.userId !== currentUserId) {
        // Check if they have the right role
        const collaborators = await storage.getSearchCollaborators(searchId);
        const userCollaborator = collaborators.find(c => c.userId === currentUserId && c.status === 'active');

        if (!userCollaborator || userCollaborator.role !== 'owner') {
          return res.status(403).json({ message: "You do not have permission to add collaborators to this search" });
        }
      }

      // Process the collaborator data
      const { userId, role } = req.body;
      if (!userId || !role) {
        return res.status(400).json({ message: "User ID and role are required" });
      }

      // Make sure the user exists
      const userToAdd = await storage.getUser(userId);
      if (!userToAdd) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is already a collaborator
      const collaborators = await storage.getSearchCollaborators(searchId);
      const existingCollaborator = collaborators.find(c => c.userId === userId);

      if (existingCollaborator) {
        if (existingCollaborator.status === 'active') {
          return res.status(400).json({ message: "User is already a collaborator on this search" });
        } else {
          // Reactivate removed collaborator
          existingCollaborator.status = 'active';
          existingCollaborator.role = role;

          // We'd need a method to update an existing collaborator, but for now we'll just remove and add
          await storage.removeCollaborator(searchId, userId);
        }
      }

      // Add the collaborator
      const collaborator = await storage.addCollaborator({
        searchId,
        userId,
        role,
        status: 'active'
      });

      res.status(201).json(collaborator);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      res.status(500).json({ message: "Failed to add collaborator" });
    }
  });

  // Get collaborators for a search
  app.get("/api/collaborative-search/:id/collaborators", async (req, res) => {
    try {
      const searchId = parseInt(req.params.id);
      if (isNaN(searchId)) {
        return res.status(400).json({ message: "Invalid search ID" });
      }

      // Get the search
      const search = await storage.getCollaborativeSearchById(searchId);
      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      // Only owner or collaborators can see the list of collaborators
      if (req.isAuthenticated()) {
        const userId = req.user.id;

        if (search.userId !== userId && !search.isPublic) {
          const collaborators = await storage.getSearchCollaborators(searchId);
          const isCollaborator = collaborators.some(c => c.userId === userId && c.status === 'active');

          if (!isCollaborator) {
            return res.status(403).json({ message: "You do not have permission to view collaborators for this search" });
          }
        }
      } else if (!search.isPublic) {
        return res.status(403).json({ message: "You do not have permission to view collaborators for this search" });
      }

      const collaborators = await storage.getSearchCollaborators(searchId);
      res.json(collaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ message: "Failed to fetch collaborators" });
    }
  });

  // Remove a collaborator from a search
  app.delete("/api/collaborative-search/:searchId/collaborator/:userId", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to remove a collaborator" });
      }

      const searchId = parseInt(req.params.searchId);
      const userIdToRemove = parseInt(req.params.userId);

      if (isNaN(searchId) || isNaN(userIdToRemove)) {
        return res.status(400).json({ message: "Invalid search ID or user ID" });
      }

      // Get the search to check ownership
      const search = await storage.getCollaborativeSearchById(searchId);
      if (!search) {
        return res.status(404).json({ message: "Collaborative search not found" });
      }

      // Check if the current user is the owner or has permission to remove collaborators
      const currentUserId = req.user.id;
      if (search.userId !== currentUserId) {
        // Check if they have the right role
        const collaborators = await storage.getSearchCollaborators(searchId);
        const userCollaborator = collaborators.find(c => c.userId === currentUserId && c.status === 'active');

        if (!userCollaborator || userCollaborator.role !== 'owner') {
          return res.status(403).json({ message: "You do not have permission to remove collaborators from this search" });
        }
      }

      // Remove the collaborator
      const success = await storage.removeCollaborator(searchId, userIdToRemove);

      if (!success) {
        return res.status(404).json({ message: "Collaborator not found" });
      }

      res.json({ success: true, message: "Collaborator removed successfully" });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ message: "Failed to remove collaborator" });
    }
  });

  // Permission request routes

  // Request permission to use a resource
  app.post("/api/resource-permission-request", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to request resource permission" });
      }

      const requesterId = req.user.id;
      const requestData = insertResourcePermissionRequestSchema.parse({
        ...req.body,
        requesterId
      });

      // Get the resource to check if it requires permission
      const resource = await storage.getResourceById(requestData.resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (!resource.requiresPermission) {
        return res.status(400).json({ message: "This resource does not require permission" });
      }

      // Check if user already has a pending request for this resource
      const userRequests = await storage.getUserPermissionRequests(requesterId);
      const existingRequest = userRequests.find(
        r => r.resourceId === requestData.resourceId && ['pending', 'approved'].includes(r.status)
      );

      if (existingRequest) {
        return res.status(400).json({
          message: `You already have a ${existingRequest.status} request for this resource`,
          existingRequest
        });
      }

      // Create the permission request
      const newRequest = await storage.requestResourcePermission(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating permission request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create permission request" });
    }
  });

  // Get permission requests for a resource (resource owner only)
  app.get("/api/resource/:id/permission-requests", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view permission requests" });
      }

      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }

      // Get the resource to check ownership
      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check if the user is the owner of the resource
      const userId = req.user.id;
      if (resource.userId !== userId) {
        // Also check if they're the owner of the search
        const search = await storage.getCollaborativeSearchById(resource.searchId);
        if (!search || search.userId !== userId) {
          return res.status(403).json({ message: "You do not have permission to view permission requests for this resource" });
        }
      }

      const requests = await storage.getResourcePermissionRequests(resourceId);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching permission requests:', error);
      res.status(500).json({ message: "Failed to fetch permission requests" });
    }
  });

  // Get user's permission requests
  app.get("/api/user/permission-requests", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your permission requests" });
      }

      const userId = req.user.id;
      const requests = await storage.getUserPermissionRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching user permission requests:', error);
      res.status(500).json({ message: "Failed to fetch permission requests" });
    }
  });

  // Update a permission request status (approve/reject)
  app.patch("/api/resource-permission-request/:id", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update a permission request" });
      }

      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const { status } = req.body;
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      // Get all permission requests to find the specific one
      const permissionRequests = await storage.getUserPermissionRequests(0); // This is a hack, need to modify storage
      const permissionRequest = permissionRequests.find(pr => pr.id === requestId);

      if (!permissionRequest) {
        return res.status(404).json({ message: "Permission request not found" });
      }

      // Get the resource to check ownership
      const resource = await storage.getResourceById(permissionRequest.resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Associated resource not found" });
      }

      // Check if the user is the owner of the resource
      const userId = req.user.id;
      if (resource.userId !== userId) {
        // Also check if they're the owner of the search
        const search = await storage.getCollaborativeSearchById(resource.searchId);
        if (!search || search.userId !== userId) {
          return res.status(403).json({ message: "You do not have permission to update this permission request" });
        }
      }

      const updatedRequest = await storage.updatePermissionRequestStatus(requestId, status);
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating permission request:', error);
      res.status(500).json({ message: "Failed to update permission request" });
    }
  });

  // DasWos Coins routes

  // Get user's DasWos Coins balance - Simplified version
  app.get("/api/user/daswos-coins/balance", async (req, res) => {
    try {
      // For authenticated users, return their session balance
      if (req.isAuthenticated()) {
        // Use the session to store the balance
        if (!req.session.dasWosCoins) {
          req.session.dasWosCoins = 0;
        }

        return res.json({ balance: req.session.dasWosCoins });
      }

      // For non-authenticated users, return a balance of 0 coins
      return res.json({ balance: 0 });
    } catch (error) {
      console.error('Error fetching user DasWos Coins balance:', error);
      res.status(500).json({ message: "Failed to fetch DasWos Coins balance" });
    }
  });

  // Get user's DasWos Coins transaction history - Simplified version
  app.get("/api/user/daswos-coins/transactions", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your transaction history" });
      }

      const userId = req.user.id;

      // Initialize session transactions if they don't exist
      if (!req.session.dasWosCoinsTransactions) {
        req.session.dasWosCoinsTransactions = [];
      }

      // Return the transactions from the session
      res.json(req.session.dasWosCoinsTransactions || []);
    } catch (error) {
      console.error('Error fetching user DasWos Coins transactions:', error);
      res.status(500).json({ message: "Failed to fetch transaction history" });
    }
  });

  // Purchase DasWos Coins (no payment required) - Simplified version
  app.post("/api/user/daswos-coins/purchase", async (req, res) => {
    try {
      console.log("Processing DasWos Coins purchase request:", req.body);

      // Get data from request body
      const { amount } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        console.log("Invalid amount:", amount);
        return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
      }

      // Handle both authenticated and non-authenticated users
      const userId = req.isAuthenticated() ? req.user.id : null;
      console.log("User ID:", userId);

      // For non-authenticated users, just return success
      if (!userId) {
        console.log("Non-authenticated user, returning mock balance");
        res.json({
          success: true,
          message: "Successfully added DasWos Coins",
          amount,
          balance: amount // Return the amount as the new balance
        });
        return;
      }

      // For authenticated users, use the session to store the balance
      // This is a simplified approach that doesn't rely on database tables
      if (!req.session.dasWosCoins) {
        req.session.dasWosCoins = 0;
      }

      // Initialize transactions array if it doesn't exist
      if (!req.session.dasWosCoinsTransactions) {
        req.session.dasWosCoinsTransactions = [];
      }

      // Add the coins to the session
      req.session.dasWosCoins += amount;

      // Record the transaction
      const transaction = {
        id: Date.now(),
        userId: userId,
        amount: amount,
        type: 'purchase',
        description: `Added ${amount} DasWos Coins`,
        status: 'completed',
        metadata: {
          freeCoins: true,
          timestamp: new Date().toISOString()
        },
        createdAt: new Date()
      };

      // Add to transactions history
      req.session.dasWosCoinsTransactions.unshift(transaction);

      console.log("Added coins to session, new balance:", req.session.dasWosCoins);

      // Return success
      res.json({
        success: true,
        message: "Successfully added DasWos Coins",
        amount,
        balance: req.session.dasWosCoins
      });
    } catch (error) {
      console.error('Error purchasing DasWos Coins:', error);
      // Send more detailed error message for debugging
      res.status(500).json({
        message: "Failed to process purchase",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Spend DasWos Coins (for AI Shopper) - Simplified version
  app.post("/api/user/daswos-coins/spend", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to spend DasWos Coins" });
      }

      const { amount, description, metadata } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
      }

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const userId = req.user.id;

      // Use the session to store the balance
      if (!req.session.dasWosCoins) {
        req.session.dasWosCoins = 0;
      }

      // Initialize transactions array if it doesn't exist
      if (!req.session.dasWosCoinsTransactions) {
        req.session.dasWosCoinsTransactions = [];
      }

      // Check if user has enough coins
      if (req.session.dasWosCoins < amount) {
        return res.status(400).json({
          message: "Insufficient DasWos Coins balance",
          balance: req.session.dasWosCoins,
          required: amount
        });
      }

      // Spend coins by subtracting from session
      req.session.dasWosCoins -= amount;

      // Record the transaction
      const transaction = {
        id: Date.now(),
        userId: userId,
        amount: amount,
        type: 'spend',
        description: description,
        status: 'completed',
        metadata: metadata || {},
        createdAt: new Date()
      };

      // Add to transactions history
      req.session.dasWosCoinsTransactions.unshift(transaction);

      console.log(`User ${userId} spent ${amount} coins on: ${description}. New balance: ${req.session.dasWosCoins}`);

      // Return success
      res.json({
        success: true,
        message: "Successfully spent DasWos Coins",
        amount,
        balance: req.session.dasWosCoins
      });
    } catch (error) {
      console.error('Error spending DasWos Coins:', error);
      res.status(500).json({ message: "Failed to process transaction" });
    }
  });

  // Add free DasWos Coins (admin only or system rewards)
  app.post("/api/user/daswos-coins/add", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to add DasWos Coins" });
      }

      // Check if user is admin (only admin can add free coins)
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Only administrators can add free DasWos Coins" });
      }

      const { userId, amount, type, description, metadata } = req.body;

      if (!userId || typeof userId !== 'number') {
        return res.status(400).json({ message: "Valid user ID is required" });
      }

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
      }

      if (!type || !description) {
        return res.status(400).json({ message: "Type and description are required" });
      }

      // Use the session to store the balance
      if (!req.session.dasWosCoins) {
        req.session.dasWosCoins = 0;
      }

      // Add coins to session
      req.session.dasWosCoins += amount;

      console.log(`Admin added ${amount} coins to user ${userId}. New balance: ${req.session.dasWosCoins}`);

      // Return success
      res.json({
        success: true,
        message: "Successfully added DasWos Coins",
        userId,
        amount,
        balance: req.session.dasWosCoins
      });
    } catch (error) {
      console.error('Error adding DasWos Coins:', error);
      res.status(500).json({ message: "Failed to process transaction" });
    }
  });

  // Swap DasWos Coins for cash
  app.post("/api/user/daswos-coins/swap", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to swap DasWos Coins for cash" });
      }

      const { amount } = req.body;
      const userId = req.user.id;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
      }

      // Minimum amount check
      if (amount < 100) {
        return res.status(400).json({ message: "Minimum swap amount is 100 DasWos Coins" });
      }

      // Use the session to store the balance
      if (!req.session.dasWosCoins) {
        req.session.dasWosCoins = 0;
      }

      // Check if user has enough coins
      if (req.session.dasWosCoins < amount) {
        return res.status(400).json({
          message: "Insufficient DasWos Coins balance",
          balance: req.session.dasWosCoins,
          required: amount
        });
      }

      // Calculate cash value (1 coin = $1.00)
      const cashValue = amount;

      // Spend the coins by subtracting from session
      req.session.dasWosCoins -= amount;

      console.log(`User ${userId} swapped ${amount} coins for $${cashValue.toFixed(2)}. New balance: ${req.session.dasWosCoins}`);

      // In a production app, we would trigger a real payment to the user here
      // For this development implementation, we'll just simulate it

      // Return successful response
      res.json({
        success: true,
        message: "Successfully swapped DasWos Coins for cash",
        amount,
        cashValue: cashValue,
        balance: req.session.dasWosCoins
      });
    } catch (error) {
      console.error('Error swapping DasWos Coins for cash:', error);
      res.status(500).json({ message: "Failed to process swap transaction" });
    }
  });

  // Shopping Cart endpoints

  // Get user's cart items - accessible for both authenticated and non-authenticated users
  app.get("/api/user/cart", async (req, res) => {
    try {
      // For authenticated users, get their cart items from the database
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const cartItems = await storage.getUserCartItems(userId);
        return res.json(cartItems);
      }

      // For non-authenticated users, use session cart
      // Initialize session cart if it doesn't exist
      if (!req.session.cart) {
        req.session.cart = [];
      }

      return res.json(req.session.cart || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  // Add item to cart - accessible for both authenticated and non-authenticated users
  app.post("/api/user/cart/add", async (req, res) => {
    try {
      // For authenticated users, save to the database
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const cartItemData = insertCartItemSchema.parse({
          ...req.body,
          userId
        });

        // Add item to cart in database
        const cartItem = await storage.addCartItem(cartItemData);
        return res.json(cartItem);
      }

      // For non-authenticated users, use session cart
      // Initialize session cart if it doesn't exist
      if (!req.session.cart) {
        req.session.cart = [];
      }

      // Get product info from the database using productId
      const productId = parseInt(req.body.productId);
      if (!productId || isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Create cart item for session
      const cartItem = {
        id: Date.now(), // Use timestamp as a temporary ID
        productId: product.id,
        name: product.title || product.name, // Ensure we have a name property
        price: product.price || 0, // Ensure we have a price, default to 0 if undefined
        imageUrl: product.imageUrl || product.image, // Support both imageUrl and image properties
        quantity: req.body.quantity || 1,
        source: req.body.source || 'manual',
        description: product.description, // Include description
        createdAt: new Date().toISOString()
      };

      // Check if the product is already in cart, then increase quantity
      const existingItemIndex = req.session.cart.findIndex(
        (item: any) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        req.session.cart[existingItemIndex].quantity += cartItem.quantity;
      } else {
        // Add new item to cart
        req.session.cart.push(cartItem);
      }

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session cart:', err);
          return res.status(500).json({ error: "Failed to save cart" });
        }
        res.json(cartItem);
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity - accessible to both authenticated and non-authenticated users
  app.put("/api/user/cart/item/:itemId", async (req, res) => {
    try {
      const { quantity } = req.body;

      if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      // For authenticated users, update in the database
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const itemId = parseInt(req.params.itemId);

        // TODO: Verify item belongs to user before updating

        // Update item quantity in database
        const updatedItem = await storage.updateCartItemQuantity(itemId, quantity);
        return res.json(updatedItem);
      }

      // For non-authenticated users, update in session
      const itemId = req.params.itemId;

      // Initialize session cart if it doesn't exist
      if (!req.session.cart) {
        req.session.cart = [];
        return res.status(404).json({ error: "Item not found in cart" });
      }

      // Make sure cart exists before finding items
      if (!req.session.cart) {
        req.session.cart = [];
        return res.status(404).json({ error: "Item not found in cart" });
      }

      // Find the item in the cart
      const itemIndex = req.session.cart.findIndex((item: any) => item.id.toString() === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in cart" });
      }

      // Update the quantity
      req.session.cart[itemIndex].quantity = quantity;

      // Get the updated item to return
      const updatedItem = req.session.cart[itemIndex];

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session cart:', err);
          return res.status(500).json({ error: "Failed to update cart" });
        }
        res.json(updatedItem);
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  // Remove item from cart - accessible to both authenticated and non-authenticated users
  app.delete("/api/user/cart/item/:itemId", async (req, res) => {
    try {
      // For authenticated users, remove from the database
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const itemId = parseInt(req.params.itemId);

        // TODO: Verify item belongs to user before removing

        // Remove item from cart in database
        await storage.removeCartItem(itemId);
        return res.json({ success: true });
      }

      // For non-authenticated users, remove from session
      const itemId = req.params.itemId;

      // Initialize session cart if it doesn't exist
      if (!req.session.cart) {
        req.session.cart = [];
        return res.json({ success: true });
      }

      // Filter out the item to remove
      req.session.cart = req.session.cart.filter((item: any) => item.id.toString() !== itemId);

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session cart:', err);
          return res.status(500).json({ error: "Failed to remove from cart" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Clear user's cart - accessible to both authenticated and non-authenticated users
  app.delete("/api/user/cart", async (req, res) => {
    try {
      // For authenticated users, clear from the database
      if (req.isAuthenticated()) {
        const userId = req.user.id;

        // Clear user's cart in database
        await storage.clearUserCart(userId);
        return res.json({ success: true });
      }

      // For non-authenticated users, clear the session cart
      req.session.cart = [];

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session cart:', err);
          return res.status(500).json({ error: "Failed to clear cart" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Add AI recommendation to cart
  app.post("/api/user/cart/add-recommendation/:recommendationId", async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.recommendationId);
      let cartItem;

      if (req.isAuthenticated()) {
        // For authenticated users, use their ID
        const userId = req.user.id;
        cartItem = await storage.addAiRecommendationToCart(userId, recommendationId);
      } else {
        // For non-authenticated users, use session-based cart
        // First, get the recommendation to get the product info
        try {
          // Get the recommendation
          const paidFeaturesDisabled = await storage.getAppSettings('paidFeaturesDisabled');

          // Use demo user ID (1) to get recommendation if paid features are disabled (demo mode)
          const demoUserId = 1;
          const recommendation = await storage.getRecommendationById(paidFeaturesDisabled ? demoUserId : null, recommendationId);

          if (!recommendation) {
            throw new Error("Recommendation not found");
          }

          // Get the product details based on recommendation's productId
          const product = await storage.getProductById(recommendation.productId);

          if (!product) {
            throw new Error("Product not found");
          }

          // Initialize the cart in the session if it doesn't exist
          if (!req.session.cart) {
            req.session.cart = [];
          }

          // Generate a unique ID for the cart item
          const cartItemId = Date.now();

          // Create the cart item matching the session cart format
          cartItem = {
            id: cartItemId,
            productId: product.id,
            name: product.title || product.name, // Ensure we have a name property
            price: product.price || 0, // Ensure we have a price, default to 0 if undefined
            imageUrl: product.imageUrl || product.image, // Support both imageUrl and image properties
            quantity: 1,
            source: "ai_shopper",
            recommendationId: recommendationId, // This is allowed in the session cart
            description: product.description, // Include description
            createdAt: new Date().toISOString()
          };

          // Add to session cart
          req.session.cart.push(cartItem);

          // Update recommendation status manually
          // For simplicity, we won't update the status in the database for non-authenticated users
        } catch (error) {
          console.error('Error getting recommendation details:', error);
          return res.status(404).json({ error: "Recommendation or product not found" });
        }
      }

      res.json(cartItem);
    } catch (error) {
      console.error('Error adding recommendation to cart:', error);
      res.status(500).json({ error: "Failed to add recommendation to cart" });
    }
  });

  // Use the product routes for basic product search
  app.use('/api/products', createProductRoutes(storage));

  // Use information routes for information search
  app.use('/api/information', createInformationRoutes(storage));

  // Use order routes for order management
  app.use('/api/orders', createOrderRoutes(storage));

  // We already set up AI search routes at the beginning
  // No need to call setupAiSearchRoutes again

  const httpServer = createServer(app);
  return httpServer;
}


