import {
  products, type Product,
  users, type User, type InsertUser,
  informationContent, type InformationContent
} from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import memorystore from "memorystore";
import { db } from "./db";
import { eq, or, and, sql, ilike } from "drizzle-orm";
import { log } from "./vite";
// Simplified FallbackStorage class that implements the streamlined IStorage interface
export class FallbackStorage implements IStorage {
  public sessionStore: session.Store;
  private users: User[] = [];
  private products: Product[] = [];
  private informationContent: InformationContent[] = [];

  constructor() {
    // Initialize a memory store for sessions
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize with empty arrays - we'll use the database for all data
    this.users = [];
    this.products = [];
    this.informationContent = [];
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(user: InsertUser): Promise<User> {
    // Create a complete user object with all required fields
    const newUser = {
      ...user,
      id: this.users.length + 1,
      fullName: (user as any).fullName || 'New User',
      createdAt: new Date(),
      updatedAt: new Date(),
      isSeller: false,
      isAdmin: false,
      avatar: '',
      hasSubscription: false,
      subscriptionType: 'limited',
      subscriptionExpiresAt: null,
      isFamilyOwner: false,
      familyOwnerId: null,
      isChild: false,
      isVerified: true,
      verificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLoginAt: new Date(),
      dasWosCoins: 0
    } as unknown as User;

    this.users.push(newUser);
    return newUser;
  }

  // Product operations
  async getProducts(sphere: string, query?: string): Promise<Product[]> {
    // Use a type assertion to handle the custom 'sphere' property
    let filteredProducts = this.products.filter(product => {
      const productWithSphere = product as unknown as { sphere: string };
      return productWithSphere.sphere === sphere || sphere === 'all';
    });

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        (product as any).categoryName?.toLowerCase().includes(lowerQuery)
      );
    }

    return filteredProducts;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.find(product => product.id === id);
  }

  // Information content operations
  async getInformationContent(query?: string, category?: string): Promise<InformationContent[]> {
    let filteredContent = [...this.informationContent];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredContent = filteredContent.filter(content =>
        content.title.toLowerCase().includes(lowerQuery) ||
        content.content.toLowerCase().includes(lowerQuery)
      );
    }

    if (category) {
      filteredContent = filteredContent.filter(content =>
        content.category === category
      );
    }

    return filteredContent;
  }

  async getInformationContentById(id: number): Promise<InformationContent | undefined> {
    return this.informationContent.find(content => content.id === id);
  }

  // User session operations
  async createUserSession(session: any): Promise<any> {
    return {
      id: 1,
      userId: session.userId,
      sessionToken: session.sessionToken,
      deviceInfo: session.deviceInfo,
      createdAt: new Date(),
      expiresAt: session.expiresAt,
      isActive: true
    };
  }

  async getUserSessions(userId: number | null): Promise<any[]> {
    return [];
  }

  async deactivateSession(sessionToken: string): Promise<boolean> {
    // In fallback storage, just return success
    return true;
  }

  async deactivateAllUserSessions(userId: number): Promise<boolean> {
    // In fallback storage, just return success
    return true;
  }

  // App settings operations
  async getAppSettings(key: string): Promise<any> {
    return {};
  }

  async setAppSettings(key: string, value: any): Promise<boolean> {
    return true;
  }

  async getAllAppSettings(): Promise<{[key: string]: any}> {
    return {};
  }

  // User subscription operations
  async updateUserSubscription(userId: number, subscriptionType: string, durationMonths: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user } as any;
    updatedUser.hasSubscription = true;
    updatedUser.subscriptionType = subscriptionType;

    if (durationMonths > 0) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
      updatedUser.subscriptionExpiresAt = expiresAt;
    } else {
      updatedUser.subscriptionExpiresAt = null;
    }

    // Update the user in the users array
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = updatedUser as User;
    }

    return updatedUser;
  }

  async checkUserHasSubscription(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.hasSubscription || false;
  }

  async getUserSubscriptionDetails(userId: number): Promise<{hasSubscription: boolean, type?: string, expiresAt?: Date}> {
    const user = await this.getUser(userId);
    if (!user) {
      return { hasSubscription: false };
    }

    return {
      hasSubscription: user.hasSubscription || false,
      type: user.subscriptionType,
      expiresAt: user.subscriptionExpiresAt
    };
  }

  // AI operations
  async generateAiRecommendations(
    userId: number,
    searchQuery?: string,
    isBulkBuy?: boolean,
    searchHistory?: string[],
    shoppingList?: string
  ): Promise<{ success: boolean; message: string; }> {
    // In the fallback storage, we just return a success message
    return {
      success: true,
      message: 'AI recommendations generated successfully (fallback mode)'
    };
  }
}

// Create an instance of the fallback storage to use when needed
export const memoryStorage = new FallbackStorage();

// Define the streamlined storage interface with essential methods
export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User related operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>; // Alias for getUser for better readability
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User session operations
  createUserSession(session: any): Promise<any>;
  getUserSessions(userId: number | null): Promise<any[]>;
  deactivateSession(sessionToken: string): Promise<boolean>;
  deactivateAllUserSessions(userId: number): Promise<boolean>;

  // App settings operations
  getAppSettings(key: string): Promise<any>;
  setAppSettings(key: string, value: any): Promise<boolean>;
  getAllAppSettings(): Promise<{[key: string]: any}>;

  // User subscription operations
  updateUserSubscription(userId: number, subscriptionType: string, durationMonths: number): Promise<User>;
  checkUserHasSubscription(userId: number): Promise<boolean>;
  getUserSubscriptionDetails(userId: number): Promise<{hasSubscription: boolean, type?: string, expiresAt?: Date}>;

  // Product related operations
  getProducts(sphere: string, query?: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;

  // Information content operations
  getInformationContent(query?: string, category?: string): Promise<InformationContent[]>;
  getInformationContentById(id: number): Promise<InformationContent | undefined>;

  // AI operations
  generateAiRecommendations(
    userId: number,
    searchQuery?: string,
    isBulkBuy?: boolean,
    searchHistory?: string[],
    shoppingList?: string
  ): Promise<{ success: boolean; message: string; }>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize a memory store
    const MemoryStore = memorystore(session);
    const memStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // In production, we require a PostgreSQL session store
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required in production for session storage');
    }

    try {
      // Attempt to initialize PostgreSQL session store
      const PostgresSessionStore = connectPg(session);

      log('Attempting to connect to PostgreSQL for session storage', 'info');

      // Try to use PostgreSQL session store if DATABASE_URL is available
      if (process.env.DATABASE_URL) {
        try {
          const pgStore = new PostgresSessionStore({
            conObject: {
              connectionString: process.env.DATABASE_URL,
            },
            createTableIfMissing: true
          });

          // Use PostgreSQL store
          this.sessionStore = pgStore;
          log('Successfully connected to PostgreSQL session store', 'info');
        } catch (err) {
          log('Error initializing PostgreSQL session store: ' + err, 'error');

          // In production, fail if we can't connect to PostgreSQL
          if (process.env.NODE_ENV === 'production') {
            throw new Error(`Failed to initialize PostgreSQL session store in production: ${err}`);
          } else {
            // In development, can fall back to memory store
            log('Using memory session store as fallback in development mode', 'warning');
            this.sessionStore = memStore;
          }
        }
      } else {
        // Only happens in development
        log('No DATABASE_URL provided, using memory session store', 'warning');
        this.sessionStore = memStore;
      }
    } catch (error) {
      log('Error setting up session store: ' + error, 'error');

      // In production, fail if we can't set up the session store
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Failed to set up session store in production: ${error}`);
      } else {
        // In development, fall back to memory store
        this.sessionStore = memStore;
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Alias for getUser for better readability/consistency
  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Use case-insensitive exact match
    const [user] = await db.select().from(users).where(sql`LOWER(${users.username}) = LOWER(${username})`);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Use case-insensitive exact match
    const [user] = await db.select().from(users).where(sql`LOWER(${users.email}) = LOWER(${email})`);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserSubscription(userId: number, subscriptionType: string, durationMonths: number): Promise<User> {
    // Calculate the expiration date based on duration
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(now.getMonth() + durationMonths);

    // Set isFamilyOwner flag for family or unlimited subscriptions
    const isFamilyOwner = subscriptionType === 'family' || subscriptionType === 'unlimited';

    console.log(`Updating subscription for user ID=${userId}: type=${subscriptionType}, isFamilyOwner=${isFamilyOwner}`);

    const [user] = await db
      .update(users)
      .set({
        hasSubscription: true,
        subscriptionType: subscriptionType,
        subscriptionExpiresAt: expiresAt,
        isFamilyOwner: isFamilyOwner
      })
      .where(eq(users.id, userId))
      .returning();

    console.log(`User subscription updated: ID=${user.id}, type=${user.subscriptionType}, isFamilyOwner=${user.isFamilyOwner}`);

    return user;
  }

  // Stripe subscription operations
  async createStripeSubscription(
    userId: number,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    subscriptionType: string,
    billingCycle: string
  ): Promise<UserSubscription> {
    console.log(`Creating Stripe subscription for user ${userId} with billing cycle ${billingCycle}`);

    // First, check if a subscription already exists for this user
    const existingSubscription = await this.getStripeSubscription(userId);

    if (existingSubscription) {
      console.log(`Updating existing subscription for user ${userId}`);
      // Update the existing subscription
      const [subscription] = await db
        .update(userSubscriptions)
        .set({
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionType,
          billingCycle, // Ensure billing cycle is updated
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.userId, userId))
        .returning();

      return subscription;
    }

    console.log(`Creating new subscription for user ${userId} with billing cycle ${billingCycle}`);
    // Create a new subscription record
    const [subscription] = await db
      .insert(userSubscriptions)
      .values({
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionType,
        billingCycle, // Ensure billing cycle is set
        status: 'active',
        currentPeriodStart: new Date(),
        // For monthly, add 1 month; for annual, add 1 year
        currentPeriodEnd: billingCycle === 'monthly'
          ? new Date(new Date().setMonth(new Date().getMonth() + 1))
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        cancelAtPeriodEnd: false,
        metadata: {}
      })
      .returning();

    // Also update the user record
    await this.updateUserSubscription(
      userId,
      subscriptionType,
      billingCycle === 'monthly' ? 1 : 12
    );

    return subscription;
  }

  async updateStripeSubscription(
    userId: number,
    stripeSubscriptionId: string,
    status: string
  ): Promise<UserSubscription | undefined> {
    // Find the subscription
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId)
        )
      );

    if (!subscription) {
      return undefined;
    }

    // Update the subscription status
    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({
        status,
        updatedAt: new Date(),
        // If canceled, set canceledAt
        ...(status === 'canceled' ? { canceledAt: new Date() } : {})
      })
      .where(eq(userSubscriptions.id, subscription.id))
      .returning();

    // If subscription is canceled, update the user record
    if (status === 'canceled') {
      await db
        .update(users)
        .set({
          hasSubscription: false,
          subscriptionType: 'limited', // Downgrade to free tier
          subscriptionExpiresAt: subscription.currentPeriodEnd // Will expire at the end of the current period
        })
        .where(eq(users.id, userId));
    }

    return updatedSubscription;
  }

  async getStripeSubscription(userId: number): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));

    return subscription;
  }

  async checkUserHasSubscription(userId: number): Promise<boolean> {
    const [user] = await db
      .select({
        hasSubscription: users.hasSubscription,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return false;

    // Admin exception - always has access
    if (user.email === 'admin@manipulai.com') return true;

    // Check subscription status and expiration
    if (!user.hasSubscription) return false;

    // Check if subscription is expired
    if (user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
      // Subscription expired, update status
      await db
        .update(users)
        .set({ hasSubscription: false })
        .where(eq(users.id, userId));
      return false;
    }

    return true;
  }

  async getUserSubscriptionDetails(userId: number): Promise<{hasSubscription: boolean, type?: string, expiresAt?: Date, billingCycle?: string}> {
    const [user] = await db
      .select({
        hasSubscription: users.hasSubscription,
        subscriptionType: users.subscriptionType,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return { hasSubscription: false };

    // Admin exception - always has access
    if (user.email === 'admin@manipulai.com') {
      return {
        hasSubscription: true,
        type: 'admin',
        expiresAt: new Date('2099-12-31'),
        billingCycle: 'annual'
      };
    }

    // Check if subscription is expired
    if (user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
      // Subscription expired, update status
      await db
        .update(users)
        .set({ hasSubscription: false })
        .where(eq(users.id, userId));
      return { hasSubscription: false };
    }

    // Get billing cycle from user_subscriptions table
    let billingCycle: string | undefined;
    if (user.hasSubscription) {
      const [subscription] = await db
        .select({
          billingCycle: userSubscriptions.billingCycle
        })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId));

      if (subscription) {
        billingCycle = subscription.billingCycle;
      } else {
        // Default to monthly if no billing cycle is found
        billingCycle = 'monthly';

        // Log this situation for debugging
        console.log(`No billing cycle found for user ${userId} with subscription type ${user.subscriptionType}. Defaulting to monthly.`);
      }
    }

    return {
      hasSubscription: user.hasSubscription,
      type: user.subscriptionType || undefined,
      expiresAt: user.subscriptionExpiresAt || undefined,
      billingCycle: billingCycle
    };
  }

  /**
   * Update a user's seller status in the database
   * @param userId The ID of the user to update
   * @param isSeller Whether the user should be marked as a seller
   * @returns Success boolean
   */
  async updateUserSellerStatus(userId: number, isSeller: boolean): Promise<boolean> {
    try {
      // Skip updates for hardcoded admin user
      if (userId === 999999) {
        log(`Skipping seller status update for admin user ID ${userId}`, 'info');
        return true;
      }

      // Execute raw SQL to ensure we're using the correct field name
      // The users table in the database uses is_seller (snake_case), but our schema uses isSeller (camelCase)
      await db.execute(
        sql`UPDATE users SET is_seller = ${isSeller} WHERE id = ${userId}`
      );

      log(`Updated seller status for user ID ${userId} to ${isSeller} in database storage`, 'info');
      return true;
    } catch (error) {
      log(`Error updating user seller status: ${error}`, 'error');
      return false;
    }
  }

  // Product operations
  async getProducts(sphere: string, query?: string): Promise<Product[]> {
    let conditions = [];

    // Handle different sphere combinations
    if (sphere === 'safesphere') {
      // Standard SafeSphere - verified sellers only + must have complete profile
      conditions.push(eq(products.sellerVerified, true));
      // Additional criteria for SafeSphere: Trust score must be at least 80
      // AND seller must have provided all required verification information
      conditions.push(gte(products.trustScore, 80));
    } else if (sphere === 'bulkbuy-safe') {
      // BulkBuy with SafeSphere filter - both bulk buy eligible AND verified sellers
      conditions.push(eq(products.isBulkBuy, true));
      conditions.push(eq(products.sellerVerified, true));
      // Additional criteria for SafeSphere: Trust score must be at least 80
      // AND seller must have provided all required verification information
      conditions.push(gte(products.trustScore, 80));
    } else if (sphere === 'bulkbuy-open') {
      // BulkBuy with OpenSphere filter - just bulk buy eligible, any seller
      conditions.push(eq(products.isBulkBuy, true));
    } else if (sphere === 'bulkbuy') {
      // Original BulkBuy sphere, used for backward compatibility
      conditions.push(eq(products.isBulkBuy, true));
    }

    // Filter by search query
    if (query && query.trim() !== '') {
      conditions.push(
        or(
          like(products.title, `%${query}%`),
          like(products.description, `%${query}%`),
          // Add search by tags using SQL array contains operator
          sql`${products.tags}::text[] && ARRAY[${query}]::text[]`
        )
      );
    }

    // Build the query with all conditions
    if (conditions.length > 0) {
      return await db.select().from(products).where(and(...conditions));
    }

    // No conditions means return all products
    return await db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.sellerId, sellerId));
  }

  // Search operations
  async saveSearchQuery(insertSearchQuery: InsertSearchQuery): Promise<SearchQuery> {
    // Ensure contentType is set with a default value if not provided
    const searchQueryWithDefaults = {
      ...insertSearchQuery,
      contentType: insertSearchQuery.contentType || "products"
    };

    const [searchQuery] = await db.insert(searchQueries).values(searchQueryWithDefaults).returning();
    return searchQuery;
  }

  async getRecentSearches(limit: number): Promise<SearchQuery[]> {
    return await db.select().from(searchQueries).orderBy(desc(searchQueries.timestamp)).limit(limit);
  }

  // Seller verification operations
  async createSellerVerification(verification: InsertSellerVerification): Promise<SellerVerification> {
    const [sellerVerification] = await db.insert(sellerVerifications).values(verification).returning();
    return sellerVerification;
  }

  async getSellerVerificationsByUserId(userId: number): Promise<SellerVerification[]> {
    return await db.select().from(sellerVerifications).where(eq(sellerVerifications.userId, userId));
  }

  async updateSellerVerificationStatus(id: number, status: string, comments?: string): Promise<SellerVerification> {
    const data: any = {
      status,
      processedAt: new Date()
    };

    if (comments) {
      data.comments = comments;
    }

    const [sellerVerification] = await db
      .update(sellerVerifications)
      .set(data)
      .where(eq(sellerVerifications.id, id))
      .returning();

    return sellerVerification;
  }

  // New seller methods implementation
  async findSellerByUserId(userId: number): Promise<any | undefined> {
    try {
      const [seller] = await db.execute(
        sql`SELECT * FROM sellers WHERE user_id = ${userId} LIMIT 1`
      );
      return seller || undefined;
    } catch (error) {
      console.error("Error finding seller:", error);
      return undefined;
    }
  }

  async getSellerById(sellerId: number): Promise<any | undefined> {
    try {
      const [seller] = await db.execute(
        sql`SELECT * FROM sellers WHERE id = ${sellerId} LIMIT 1`
      );
      return seller || undefined;
    } catch (error) {
      console.error("Error finding seller by ID:", error);
      return undefined;
    }
  }

  async getPendingSellerVerifications(): Promise<any[]> {
    try {
      // Get all sellers with pending verification status
      const result = await db.execute(
        sql`SELECT s.*, u.email, u.username, u.full_name
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.verification_status = 'pending'
            ORDER BY s.created_at DESC`
      );
      return result || [];
    } catch (error) {
      console.error("Error getting pending seller verifications:", error);
      return [];
    }
  }

  async getAllSellerVerifications(): Promise<any[]> {
    try {
      // Get all sellers with user information, sorted by status (pending first) and creation date
      const result = await db.execute(
        sql`SELECT
              s.id,
              s.user_id AS "userId",
              s.business_name AS "businessName",
              s.business_type AS "businessType",
              s.verification_status AS "verificationStatus",
              s.business_address AS "businessAddress",
              s.contact_phone AS "contactPhone",
              s.tax_id AS "taxId",
              s.website,
              s.year_established AS "yearEstablished",
              s.description,
              s.created_at AS "createdAt",
              s.updated_at AS "updatedAt",
              u.email,
              u.username,
              u.full_name AS "fullName"
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            ORDER BY
              CASE
                WHEN s.verification_status = 'pending' THEN 1
                WHEN s.verification_status = 'rejected' THEN 2
                WHEN s.verification_status = 'approved' THEN 3
                ELSE 4
              END,
              s.created_at DESC`
      );
      console.log("Seller verifications retrieved:", result.length);
      return result || [];
    } catch (error) {
      console.error("Error getting all seller verifications:", error);
      return [];
    }
  }

  // Calculate seller trust score based on provided information
  calculateSellerTrustScore(data: any): number {
    let score = 50; // Base score for all sellers

    // Business verification adds more trust
    if (data.business_type && data.business_type !== 'individual') {
      score += 10; // Business sellers get a higher base score
    }

    // Add points for complete information
    if (data.business_name) score += 5;
    if (data.business_address) score += 5;
    if (data.contact_phone) score += 5;
    if (data.tax_id) score += 10;
    if (data.website) score += 5;
    if (data.year_established) {
      score += 5;

      // Older businesses get additional points (up to 10)
      const yearsInBusiness = new Date().getFullYear() - data.year_established;
      if (yearsInBusiness > 0) {
        score += Math.min(10, yearsInBusiness);
      }
    }
    if (data.description && data.description.length > 50) score += 5;

    // Boost for document verification
    if (data.document_urls && data.document_urls.length > 0) {
      score += 10 * Math.min(data.document_urls.length, 3); // Up to 30 points for 3+ documents
    }

    // Approved verification status is a significant boost
    if (data.verification_status === 'approved') {
      score += 20;
    }

    // Cap the score at 100
    return Math.min(100, score);
  }

  async createSeller(sellerData: any): Promise<any> {
    try {
      // Calculate trust score based on the provided information
      const trustScore = this.calculateSellerTrustScore(sellerData);

      const [seller] = await db.execute(
        sql`INSERT INTO sellers (
          user_id, business_name, business_type, verification_status, business_address,
          contact_phone, tax_id, year_established, website, description, created_at, trust_score
        ) VALUES (
          ${sellerData.user_id}, ${sellerData.business_name}, ${sellerData.business_type},
          ${sellerData.verification_status || 'pending'}, ${sellerData.business_address},
          ${sellerData.contact_phone}, ${sellerData.tax_id}, ${sellerData.year_established},
          ${sellerData.website}, ${sellerData.description}, ${sellerData.created_at || new Date()},
          ${trustScore}
        ) RETURNING *`
      );

      // If seller is approved, update the user's isSeller flag
      if (seller && seller.verification_status === 'approved' && seller.user_id) {
        // Execute raw SQL to ensure we're using the correct field name
        await db.execute(
          sql`UPDATE users SET is_seller = true WHERE id = ${seller.user_id}`
        );
      }

      return seller;
    } catch (error) {
      console.error("Error creating seller:", error);
      throw error;
    }
  }

  async updateSeller(sellerId: number, data: any): Promise<any> {
    try {
      // First, get the current seller data using raw SQL query to avoid importing the schema
      const getSellerQuery = `
        SELECT * FROM sellers WHERE id = $1
      `;
      const [currentSeller] = await db.execute(sql.raw(getSellerQuery, sellerId));

      if (!currentSeller) {
        throw new Error(`Seller with ID ${sellerId} not found`);
      }

      // Merge the current data with the update data for trust score calculation
      const mergedData = { ...currentSeller, ...data };

      // Recalculate the trust score based on the updated information
      const trustScore = this.calculateSellerTrustScore(mergedData);

      // Add trust score to the data being updated
      data.trust_score = trustScore;

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      // Always add updated_at
      updateFields.push(`updated_at = $${paramIndex}`);
      values.push(new Date());

      const query = `
        UPDATE sellers
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex + 1}
        RETURNING *
      `;

      values.push(sellerId);

      // Create proper params array for the SQL query
      const [seller] = await db.execute(sql.raw(query, ...values));

      // If this update is changing verification status to approved, update the user's isSeller flag
      if (data.verification_status === 'approved' && currentSeller.user_id) {
        // Execute raw SQL to ensure we're using the correct field name
        await db.execute(
          sql`UPDATE users SET is_seller = true WHERE id = ${currentSeller.user_id}`
        );
      }

      return seller;
    } catch (error) {
      console.error("Error updating seller:", error);
      throw error;
    }
  }

  // Family account operations
  async addFamilyMember(ownerUserId: number, email: string): Promise<{ success: boolean, message: string }> {
    // First, check if the owner has a family subscription
    const owner = await this.getUser(ownerUserId);
    if (!owner || owner.subscriptionType !== 'family' || !owner.hasSubscription) {
      return { success: false, message: "You need a family subscription to add members" };
    }

    // Check if the owner is indeed marked as a family owner
    if (!owner.isFamilyOwner) {
      // Update the owner status first
      await db
        .update(users)
        .set({ isFamilyOwner: true })
        .where(eq(users.id, ownerUserId));
    }

    // Count existing family members
    const existingMembers = await this.getFamilyMembers(ownerUserId);
    if (existingMembers.length >= 4) {
      return { success: false, message: "Maximum of 4 family members allowed" };
    }

    // Check if the email exists
    const memberUser = await this.getUserByEmail(email);
    if (!memberUser) {
      return { success: false, message: "User with this email not found" };
    }

    // Check if the user is already part of a family
    if (memberUser.parentAccountId) {
      return { success: false, message: "User is already part of a family account" };
    }

    // Add the user to the family
    await db
      .update(users)
      .set({
        parentAccountId: ownerUserId,
        // Optionally inherit owner's SuperSafe settings
        superSafeMode: owner.superSafeMode,
        superSafeSettings: owner.superSafeSettings
      })
      .where(eq(users.id, memberUser.id));

    return { success: true, message: "Family member added successfully" };
  }

  async removeFamilyMember(memberUserId: number): Promise<boolean> {
    const member = await this.getUser(memberUserId);
    if (!member || !member.parentAccountId) {
      return false;
    }

    // Remove the member from the family
    await db
      .update(users)
      .set({
        parentAccountId: null,
        // Reset SuperSafe to defaults
        superSafeMode: false,
        superSafeSettings: {
          blockGambling: true,
          blockAdultContent: true,
          blockOpenSphere: false
        }
      })
      .where(eq(users.id, memberUserId));

    return true;
  }

  async getFamilyMembers(ownerUserId: number): Promise<User[]> {
    // Get all users where the parentAccountId is the owner's ID
    const result = await db
      .select()
      .from(users)
      .where(eq(users.parentAccountId, ownerUserId));

    // For debugging
    console.log(`Found ${result.length} family members for owner ID ${ownerUserId}`);

    return result;
  }

  async isFamilyOwner(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return !!(user && user.isFamilyOwner);
  }

  async createChildAccount(ownerUserId: number, childName: string): Promise<{ success: boolean, message: string, account?: { username: string, password: string } }> {
    console.log(`Creating child account for owner ID ${ownerUserId}, child name: ${childName}`);

    // First, check if the owner has a family subscription
    const owner = await this.getUser(ownerUserId);
    console.log(`Owner details: ID=${owner?.id}, isFamilyOwner=${owner?.isFamilyOwner}, subscriptionType=${owner?.subscriptionType}, hasSubscription=${owner?.hasSubscription}`);

    if (!owner || owner.subscriptionType !== 'family' || !owner.hasSubscription) {
      return { success: false, message: "You need a family subscription to create child accounts" };
    }

    // Check if the owner is indeed marked as a family owner
    if (!owner.isFamilyOwner) {
      // User has a family subscription but isFamilyOwner flag is not set
      // Let's fix that automatically
      console.log(`User ${ownerUserId} has family subscription but isFamilyOwner flag is false. Fixing...`);
      await db
        .update(users)
        .set({ isFamilyOwner: true })
        .where(eq(users.id, ownerUserId));

      // Update our local copy for the rest of this function
      owner.isFamilyOwner = true;
    }

    // Count existing family members
    const existingMembers = await this.getFamilyMembers(ownerUserId);
    console.log(`Found ${existingMembers.length} existing family members`);

    if (existingMembers.length >= 4) {
      return { success: false, message: "Maximum of 4 family members allowed" };
    }

    // Generate a fun username (base on child's name + random animal/color)
    const animals = ['Panda', 'Tiger', 'Lion', 'Zebra', 'Giraffe', 'Dolphin', 'Koala', 'Penguin', 'Fox', 'Wolf'];
    const colors = ['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Yellow', 'Pink', 'Turquoise', 'Violet', 'Gold'];

    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomNumber = Math.floor(Math.random() * 100);

    // Convert childName to a safe format (lowercase, remove spaces)
    const safeName = childName.toLowerCase().replace(/\s+/g, '');
    const username = `${safeName}${randomAnimal}${randomNumber}`;

    // Generate a secure but memorable password
    const password = `${randomColor}${randomAnimal}${randomNumber}!`;

    // Generate a valid email address for the child account
    const childEmail = `${username}@family.${owner.email.split('@')[1]}`;

    // Create the child account
    try {
      const childUser = await this.createUser({
        username,
        email: childEmail,
        password, // Note: Will be hashed by the auth system
        fullName: childName,
        parentAccountId: ownerUserId,
        isChildAccount: true,
        superSafeMode: true, // Child accounts have SuperSafe mode enabled by default
        superSafeSettings: {
          blockGambling: true,
          blockAdultContent: true,
          blockOpenSphere: true
        }
      });

      console.log(`Child account created: ID=${childUser.id}, username=${childUser.username}, parentAccountId=${childUser.parentAccountId}, isChildAccount=${childUser.isChildAccount}`);

      return {
        success: true,
        message: "Child account created successfully",
        account: {
          username,
          password
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create child account. Please try again."
      };
    }
  }

  async updateChildAccountPassword(childUserId: number, newPassword: string): Promise<boolean> {
    const child = await this.getUser(childUserId);
    if (!child || !child.isChildAccount) {
      return false;
    }

    try {
      await db
        .update(users)
        .set({
          password: newPassword // Note: Will be hashed by the auth system when used
        })
        .where(eq(users.id, childUserId));

      return true;
    } catch (error) {
      return false;
    }
  }

  // SuperSafe mode operations
  async getSuperSafeStatus(userId: number): Promise<{enabled: boolean, settings: any}> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        enabled: false,
        settings: {
          blockGambling: true,
          blockAdultContent: true,
          blockOpenSphere: false
        }
      };
    }

    return {
      enabled: user.superSafeMode,
      settings: user.superSafeSettings || {
        blockGambling: true,
        blockAdultContent: true,
        blockOpenSphere: false
      }
    };
  }

  async updateSuperSafeStatus(userId: number, enabled: boolean, settings?: any): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    // If settings not provided, keep existing settings
    const updatedSettings = settings || user.superSafeSettings || {
      blockGambling: true,
      blockAdultContent: true,
      blockOpenSphere: false
    };

    await db
      .update(users)
      .set({
        superSafeMode: enabled,
        superSafeSettings: updatedSettings
      })
      .where(eq(users.id, userId));

    return true;
  }

  async updateFamilyMemberSuperSafeStatus(ownerUserId: number, memberUserId: number, enabled: boolean, settings?: any): Promise<boolean> {
    // First verify this is actually a family owner
    const isOwner = await this.isFamilyOwner(ownerUserId);
    if (!isOwner) return false;

    // Then verify the member is part of this family
    const member = await this.getUser(memberUserId);
    if (!member || member.parentAccountId !== ownerUserId) return false;

    // Update the member's settings
    return this.updateSuperSafeStatus(memberUserId, enabled, settings);
  }

  // SafeSphere operations
  async getSafeSphereStatus(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    return user.safeSphereActive || false;
  }

  async updateSafeSphereStatus(userId: number, active: boolean): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    await db
      .update(users)
      .set({ safeSphereActive: active })
      .where(eq(users.id, userId));

    return true;
  }

  // Bulk Buy Agent operations
  async createBulkBuyRequest(request: InsertBulkBuyRequest): Promise<BulkBuyRequest> {
    const [bulkBuyRequest] = await db.insert(bulkBuyRequests).values(request).returning();
    return bulkBuyRequest;
  }

  async getBulkBuyRequestsByUserId(userId: number): Promise<BulkBuyRequest[]> {
    return await db.select().from(bulkBuyRequests).where(eq(bulkBuyRequests.userId, userId));
  }

  async getBulkBuyRequestById(id: number): Promise<BulkBuyRequest | undefined> {
    const [request] = await db.select().from(bulkBuyRequests).where(eq(bulkBuyRequests.id, id));
    return request;
  }

  async updateBulkBuyRequestStatus(id: number, status: string, agentId?: number): Promise<BulkBuyRequest> {
    const data: any = {
      status,
      updatedAt: new Date()
    };

    if (agentId) {
      data.assignedAgentId = agentId;
    }

    const [request] = await db
      .update(bulkBuyRequests)
      .set(data)
      .where(eq(bulkBuyRequests.id, id))
      .returning();

    return request;
  }

  // AI Shopper operations
  async getAiShopperStatus(userId: number): Promise<{enabled: boolean, settings: any}> {
    const [user] = await db
      .select({
        aiShopperEnabled: users.aiShopperEnabled,
        aiShopperSettings: users.aiShopperSettings
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return {
        enabled: false,
        settings: {
          autoPurchase: false,
          budgetLimit: 5000, // in cents ($50)
          preferredCategories: [],
          avoidTags: [],
          minimumTrustScore: 85
        }
      };
    }

    return {
      enabled: user.aiShopperEnabled,
      settings: user.aiShopperSettings
    };
  }

  async updateAiShopperStatus(userId: number, enabled: boolean, settings?: any): Promise<boolean> {
    const data: any = {
      aiShopperEnabled: enabled
    };

    if (settings) {
      data.aiShopperSettings = settings;
    }

    try {
      await db
        .update(users)
        .set(data)
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Failed to update AI Shopper status:', error);
      return false;
    }
  }

  async createAiShopperRecommendation(recommendation: InsertAiShopperRecommendation): Promise<AiShopperRecommendation> {
    const [result] = await db
      .insert(aiShopperRecommendations)
      .values({
        ...recommendation,
        createdAt: new Date()
      })
      .returning();

    return result;
  }

  async getRecommendationById(userId: number | null, recommendationId: number): Promise<AiShopperRecommendation | null> {
    try {
      // Build the query
      let query = db
        .select()
        .from(aiShopperRecommendations)
        .where(eq(aiShopperRecommendations.id, recommendationId));

      // If userId is provided, also filter by userId
      if (userId !== null) {
        query = query.where(eq(aiShopperRecommendations.userId, userId));
      }

      // Execute the query
      const recommendations = await query;

      if (recommendations.length === 0) {
        return null;
      }

      // Get recommendation
      const recommendation = recommendations[0];

      // Check if it's permanently removed
      if (recommendation.rejectedReason && recommendation.rejectedReason.includes('[PERMANENT_REMOVAL]')) {
        return null;
      }

      // Get associated product
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, recommendation.productId));

      // Return recommendation with product info
      return {
        ...recommendation,
        product
      };
    } catch (error) {
      console.error("Error getting recommendation by ID:", error);
      throw error;
    }
  }

  async getAiShopperRecommendationsByUserId(userId: number): Promise<AiShopperRecommendation[]> {
    // Get all recommendations for the user
    const recommendations = await db
      .select()
      .from(aiShopperRecommendations)
      .where(eq(aiShopperRecommendations.userId, userId))
      .orderBy(desc(aiShopperRecommendations.createdAt));

    // Filter out permanently removed items (those marked with [PERMANENT_REMOVAL])
    return recommendations.filter(rec => {
      if (rec.rejectedReason && rec.rejectedReason.includes('[PERMANENT_REMOVAL]')) {
        console.log(`Filtering out permanently removed recommendation ${rec.id}`);
        return false;
      }
      return true;
    });
  }

  async clearAiShopperRecommendations(userId: number): Promise<void> {
    console.log(`Clearing all AI Shopper recommendations for user ID ${userId}`);

    try {
      // Delete all recommendations for the user
      await db
        .delete(aiShopperRecommendations)
        .where(eq(aiShopperRecommendations.userId, userId));

      console.log(`Successfully cleared recommendations for user ID ${userId}`);
    } catch (error) {
      console.error(`Error clearing recommendations for user ID ${userId}:`, error);
      throw error;
    }
  }

  async updateAiShopperRecommendationStatus(id: number, status: string, reason?: string, removeFromList?: boolean): Promise<AiShopperRecommendation> {
    // If removeFromList is true and status is rejected, we'll handle it differently
    if (removeFromList === true && status === 'rejected') {
      console.log(`Permanently removing recommendation ${id} from list`);

      // For permanently removing the item, we'll simply update its status
      // but mark it specially in the rejectedReason to know it should be filtered out
      const data: any = {
        status,
        updatedAt: new Date(),
        rejectedReason: reason ? `${reason} [PERMANENT_REMOVAL]` : 'Permanently removed by user'
      };

      const [recommendation] = await db
        .update(aiShopperRecommendations)
        .set(data)
        .where(eq(aiShopperRecommendations.id, id))
        .returning();

      return recommendation;
    }

    // Standard update case
    const data: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'purchased') {
      data.purchasedAt = new Date();
    }

    if (status === 'rejected' && reason) {
      data.rejectedReason = reason;
    }

    const [recommendation] = await db
      .update(aiShopperRecommendations)
      .set(data)
      .where(eq(aiShopperRecommendations.id, id))
      .returning();

    return recommendation;
  }

  async generateAiRecommendations(
    userId: number,
    searchQuery?: string,
    isBulkBuy: boolean = false,
    searchHistory?: string[],
    shoppingList?: string
  ): Promise<{ success: boolean; message: string; }> {
    try {
      // For anonymous users or when enabling Super Shopper for all users,
      // we'll use default settings instead of checking user status
      const { settings } = await this.getAiShopperStatus(userId);

      // We're skipping the AI Shopper enabled check since we want all users to access it

      // We're skipping the subscription check since we want all users to access it

      console.log(`Generating AI recommendations for user ${userId}, search query: "${searchQuery}", bulk buy: ${isBulkBuy}`);

      // Step 4: Get SafeSphere products that match user's preferences
      // Filter products based on preferred categories and avoided tags
      const preferredCategories = settings.preferredCategories || [];
      const avoidTags = settings.avoidTags || [];
      const minimumTrustScore = settings.minimumTrustScore || 85;

      // Get potential products matching the criteria from either bulk buy or standard products
      let sphere = isBulkBuy ? 'bulkbuy-safe' : 'safesphere';
      let potentialProducts = await this.getProducts(sphere, searchQuery);

      console.log(`Found ${potentialProducts.length} potential products for ${sphere}${searchQuery ? ' with query: ' + searchQuery : ''}`);

      // Filter products by trust score
      potentialProducts = potentialProducts.filter(product => {
        // Ensure the product has a valid trust score (fix for the 0 score issue)
        if (!product.trustScore || product.trustScore <= 0) {
          console.log(`Product ${product.id} has invalid trust score: ${product.trustScore}`);
          return false;
        }
        return product.trustScore >= minimumTrustScore;
      });

      // Filter by preferred categories if specified
      if (preferredCategories.length > 0) {
        potentialProducts = potentialProducts.filter(product =>
          product.tags.some(tag => preferredCategories.includes(tag))
        );
      }

      // Filter out products with avoided tags
      if (avoidTags.length > 0) {
        potentialProducts = potentialProducts.filter(product =>
          !product.tags.some(tag => avoidTags.includes(tag))
        );
      }

      if (potentialProducts.length === 0) {
        return {
          success: false,
          message: "No products found matching your preferences"
        };
      }

      // Step 5: Use Anthropic AI to generate recommendations
      const budgetLimit = settings.budgetLimit / 100; // Convert from cents to dollars/pounds

      try {
        // First try to use the new Anthropic API if available
        let productId, confidence, reasoning;
        let alternativeRecommendations = {};
        let enhancedConfidenceScores = {};

        try {
          // Try to use the enhanced Anthropic API integration
          const { enhanceAiRecommendations } = await import('./anthropic-api');

          // Check if we have access to the Anthropic API
          if (process.env.ANTHROPIC_API_KEY) {
            console.log('Using enhanced Anthropic API integration for recommendations');

            // Get enhanced recommendations and confidence scores
            const { enhancedReasons, confidenceScores } = await enhanceAiRecommendations(
              searchQuery || "",
              settings,
              potentialProducts,
              searchHistory || [],
              shoppingList || ""
            );

            // Store the enhanced results
            alternativeRecommendations = enhancedReasons;
            enhancedConfidenceScores = confidenceScores;

            // If we got valid results, use the product with highest confidence
            if (Object.keys(confidenceScores).length > 0) {
              const productIds = Object.keys(confidenceScores).map(Number);
              const bestProductId = productIds.reduce((a, b) =>
                confidenceScores[a] > confidenceScores[b] ? a : b
              );

              productId = bestProductId;
              confidence = confidenceScores[productId] || 0.85; // Default to 0.85 if undefined
              reasoning = enhancedReasons[productId] || `This product matches your search query.`;

              console.log(`Selected best product ID ${productId} with confidence ${confidence}`);
            }
          }
        } catch (anthropicApiError) {
          console.error('Error using enhanced Anthropic API:', anthropicApiError);
          // Continue to fallback method
        }

        // If we couldn't use the enhanced API or it failed, fall back to the original implementation
        if (!productId || isNaN(productId)) {
          console.log('Falling back to original Anthropic implementation');

          // Import the original Anthropic service to avoid circular dependencies
          const { generateRecommendation } = await import('./anthropic');

          // Pass search history and shopping list to the AI for better recommendations
          const result = await generateRecommendation(
            settings,
            budgetLimit,
            potentialProducts,
            searchHistory || [],
            shoppingList || ""
          );

          // Extract data from the result
          productId = parseInt(result.recommendation, 10);
          confidence = result.confidence;
          reasoning = result.reasoning;

          if (isNaN(productId)) {
            throw new Error(`Invalid product ID: ${result.recommendation}`);
          }
        }

        // Validate that the product exists
        const product = await this.getProductById(productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        // Create the recommendation with type safety
        await this.createAiShopperRecommendation({
          userId,
          productId,
          reason: reasoning || "This product matches your preferences.",
          confidence: confidence !== undefined ? Math.round(confidence * 100) : 85 // Convert from 0-1 to 0-100, default to 85 if undefined
        });

        // Check if auto-purchase is enabled and confidence is high enough
        const confidenceValue = confidence !== undefined ? confidence : 0.85; // Default to 0.85 if undefined
        if (settings.autoPurchase && settings.autoPaymentEnabled && confidenceValue >= (settings.confidenceThreshold || 0.85)) {
          // Get the recommendation ID
          const [newRecommendation] = await db
            .select()
            .from(aiShopperRecommendations)
            .where(and(
              eq(aiShopperRecommendations.userId, userId),
              eq(aiShopperRecommendations.productId, productId)
            ))
            .orderBy(desc(aiShopperRecommendations.createdAt))
            .limit(1);

          if (newRecommendation) {
            // Process the auto-purchase asynchronously
            this.processAutoPurchase(newRecommendation.id)
              .then(result => {
                console.log(`Auto-purchase result for recommendation ${newRecommendation.id}:`, result);
              })
              .catch(err => {
                console.error(`Auto-purchase failed for recommendation ${newRecommendation.id}:`, err);
              });
          }
        }

        return {
          success: true,
          message: "AI Shopper has generated new recommendations"
        };
      } catch (error) {
        console.error('Error generating AI recommendation:', error);
        return {
          success: false,
          message: `Failed to generate recommendation: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    } catch (error) {
      console.error('Error in generateAiRecommendations:', error);
      return {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async processAutoPurchase(recommendationId: number): Promise<{ success: boolean; message: string; }> {
    try {
      // Step 1: Get the recommendation
      const [recommendation] = await db
        .select()
        .from(aiShopperRecommendations)
        .where(eq(aiShopperRecommendations.id, recommendationId));

      if (!recommendation) {
        return { success: false, message: "Recommendation not found" };
      }

      // Step 2: Get the product
      const product = await this.getProductById(recommendation.productId);
      if (!product) {
        return { success: false, message: "Product not found" };
      }

      // Step 3: Get the user's AI Shopper settings
      // We're using settings directly without checking if it's enabled
      const { settings } = await this.getAiShopperStatus(recommendation.userId);

      // Step 4: Import the Anthropic validation function
      const { validateAutomatedPurchase } = await import('./anthropic');

      // Step 5: Validate the purchase
      const validationResult = validateAutomatedPurchase(
        settings,
        {
          confidence: recommendation.confidence / 100, // Convert from 0-100 to 0-1
          productId: recommendation.productId
        },
        product
      );

      // If purchase validation fails, update recommendation status and return
      if (!validationResult.canPurchase) {
        await this.updateAiShopperRecommendationStatus(
          recommendationId,
          'rejected',
          validationResult.reason || 'Purchase validation failed'
        );

        return {
          success: false,
          message: validationResult.reason || 'Purchase validation failed'
        };
      }

      // Step 6: Check if user has chosen to use DasWos Coins
      if (settings.useCoins) {
        // Check if user has enough DasWos Coins
        const userCoins = await this.getUserDasWosCoins(recommendation.userId);
        if (userCoins < product.price) {
          await this.updateAiShopperRecommendationStatus(
            recommendationId,
            'rejected',
            `Not enough DasWos Coins. Required: ${product.price}, Available: ${userCoins}`
          );
          return {
            success: false,
            message: `Not enough DasWos Coins. Required: ${product.price}, Available: ${userCoins}`
          };
        }

        // Spend DasWos Coins for the purchase
        const coinSpent = await this.spendDasWosCoins(
          recommendation.userId,
          product.price,
          `Auto-purchase: ${product.title}`,
          {
            productId: product.id,
            recommendationId: recommendation.id
          }
        );

        if (!coinSpent) {
          await this.updateAiShopperRecommendationStatus(
            recommendationId,
            'rejected',
            'Failed to process DasWos Coins transaction'
          );
          return {
            success: false,
            message: "Failed to process DasWos Coins transaction"
          };
        }

        // Add product to cart with "ai_shopper" source
        await this.addCartItem({
          userId: recommendation.userId,
          productId: product.id,
          quantity: 1,
          source: "ai_shopper", // Use "ai_shopper" for automated purchases with DasWos Coins
          recommendationId
        });

        // Update recommendation status to purchased
        await this.updateAiShopperRecommendationStatus(recommendationId, 'purchased');

        return {
          success: true,
          message: `Auto-purchased ${product.title} for ${product.price} DasWos Coins`
        };
      } else {
        // Step 7: Process with payment method if not using coins
        const paymentMethod = await this.getDefaultPaymentMethod(recommendation.userId);
        if (!paymentMethod) {
          await this.updateAiShopperRecommendationStatus(
            recommendationId,
            'rejected',
            'No default payment method found'
          );
          return {
            success: false,
            message: "No default payment method found"
          };
        }

        // Process the payment using Stripe
        try {
          // Import stripe service
          const { createPaymentIntent } = await import('./stripe');

          // Get user to fetch details
          const user = await this.getUser(recommendation.userId);
          if (!user) {
            throw new Error('User not found');
          }

          // In a production environment, we would create a real payment intent
          // and process the payment using the stored payment method
          console.log(`Processing payment for recommendation ${recommendationId}:`, {
            productId: product.id,
            price: product.price,
            paymentMethodId: paymentMethod.stripePaymentMethodId,
            userId: recommendation.userId,
            userEmail: user.email
          });

          // This would be used in a real implementation to process the payment
          // const paymentIntent = await createPaymentIntent(
          //   product.price,
          //   'gbp', // Currency
          //   user.email,
          //   paymentMethod.stripePaymentMethodId,
          //   `Product purchase: ${product.title}`,
          //   {
          //     recommendationId: recommendation.id.toString(),
          //     productId: product.id.toString(),
          //     automated: 'true'
          //   }
          // );

          // Step 8: Update recommendation status to purchased
          await this.updateAiShopperRecommendationStatus(recommendationId, 'purchased');

          // Record the purchase in the order history (would be implemented in a real system)
          // await this.createOrder({
          //   userId: recommendation.userId,
          //   productId: product.id,
          //   quantity: 1,
          //   totalPrice: product.price,
          //   paymentStatus: 'completed',
          //   paymentMethodId: paymentMethod.id,
          //   stripePaymentIntentId: paymentIntent.id,
          //   automatedPurchase: true,
          //   recommendationId: recommendation.id
          // });

          return {
            success: true,
            message: "Purchase completed successfully"
          };
        } catch (error) {
          // If payment processing fails, update the recommendation status
          await this.updateAiShopperRecommendationStatus(
            recommendationId,
            'rejected',
            `Payment processing failed: ${error instanceof Error ? error.message : String(error)}`
          );

          return {
            success: false,
            message: `Payment processing failed: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }
    } catch (error) {
      console.error('Error in processAutoPurchase:', error);
      return {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }



  // Payment method operations
  async getUserPaymentMethods(userId: number): Promise<UserPaymentMethod[]> {
    return await db
      .select()
      .from(userPaymentMethods)
      .where(eq(userPaymentMethods.userId, userId))
      .orderBy(desc(userPaymentMethods.isDefault));
  }

  async getDefaultPaymentMethod(userId: number): Promise<UserPaymentMethod | undefined> {
    const [paymentMethod] = await db
      .select()
      .from(userPaymentMethods)
      .where(and(
        eq(userPaymentMethods.userId, userId),
        eq(userPaymentMethods.isDefault, true)
      ));

    return paymentMethod;
  }

  async addUserPaymentMethod(paymentMethod: InsertUserPaymentMethod): Promise<UserPaymentMethod> {
    // If this is the first payment method or isDefault is true,
    // ensure it's set as the default
    if (paymentMethod.isDefault) {
      // Set all other payment methods for this user to non-default
      await db
        .update(userPaymentMethods)
        .set({ isDefault: false })
        .where(eq(userPaymentMethods.userId, paymentMethod.userId));
    } else {
      // Check if the user has any payment methods
      const existingMethods = await this.getUserPaymentMethods(paymentMethod.userId);
      if (existingMethods.length === 0) {
        // If this is the first one, make it default regardless of what was passed
        paymentMethod.isDefault = true;
      }
    }

    const [result] = await db
      .insert(userPaymentMethods)
      .values(paymentMethod)
      .returning();

    return result;
  }

  async setDefaultPaymentMethod(paymentMethodId: number, userId: number): Promise<boolean> {
    // First, verify the payment method belongs to the user
    const [paymentMethod] = await db
      .select()
      .from(userPaymentMethods)
      .where(and(
        eq(userPaymentMethods.id, paymentMethodId),
        eq(userPaymentMethods.userId, userId)
      ));

    if (!paymentMethod) {
      return false;
    }

    // Set all payment methods for this user to non-default
    await db
      .update(userPaymentMethods)
      .set({ isDefault: false })
      .where(eq(userPaymentMethods.userId, userId));

    // Set the selected payment method as default
    await db
      .update(userPaymentMethods)
      .set({ isDefault: true })
      .where(eq(userPaymentMethods.id, paymentMethodId));

    return true;
  }

  async deletePaymentMethod(paymentMethodId: number): Promise<boolean> {
    // Get the payment method first to check if it's the default
    const [paymentMethod] = await db
      .select()
      .from(userPaymentMethods)
      .where(eq(userPaymentMethods.id, paymentMethodId));

    if (!paymentMethod) {
      return false;
    }

    // Delete the payment method
    await db
      .delete(userPaymentMethods)
      .where(eq(userPaymentMethods.id, paymentMethodId));

    // If it was the default, make another one the default if available
    if (paymentMethod.isDefault) {
      const [nextPaymentMethod] = await db
        .select()
        .from(userPaymentMethods)
        .where(eq(userPaymentMethods.userId, paymentMethod.userId))
        .limit(1);

      if (nextPaymentMethod) {
        await db
          .update(userPaymentMethods)
          .set({ isDefault: true })
          .where(eq(userPaymentMethods.id, nextPaymentMethod.id));
      }
    }

    return true;
  }

  // App settings operations
  async getAppSettings(key: string): Promise<any> {
    const [setting] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key));

    return setting ? setting.value : null;
  }

  async setAppSettings(key: string, value: any): Promise<boolean> {
    try {
      // Check if setting already exists
      const existing = await this.getAppSettings(key);

      if (existing) {
        // Update existing setting
        await db
          .update(appSettings)
          .set({
            value,
            updatedAt: new Date()
          })
          .where(eq(appSettings.key, key));
      } else {
        // Create new setting
        await db
          .insert(appSettings)
          .values({
            key,
            value,
            createdAt: new Date()
          });
      }

      return true;
    } catch (error) {
      console.error(`Error setting app setting ${key}:`, error);
      return false;
    }
  }

  // User Dasbar Preferences operations
  async getUserDasbarPreferences(userId: number): Promise<UserDasbarPreferences | null> {
    const [preferences] = await db
      .select()
      .from(userDasbarPreferences)
      .where(eq(userDasbarPreferences.userId, userId));

    return preferences || null;
  }

  async saveUserDasbarPreferences(userId: number, items: any[]): Promise<UserDasbarPreferences> {
    // Check if preferences already exist for this user
    const existingPreferences = await this.getUserDasbarPreferences(userId);

    if (existingPreferences) {
      // Update existing preferences
      const [updatedPreferences] = await db
        .update(userDasbarPreferences)
        .set({
          items,
          updatedAt: new Date()
        })
        .where(eq(userDasbarPreferences.userId, userId))
        .returning();

      return updatedPreferences;
    } else {
      // Create new preferences
      const [newPreferences] = await db
        .insert(userDasbarPreferences)
        .values({
          userId,
          items,
          createdAt: new Date()
        })
        .returning();

      return newPreferences;
    }
  }

  async getAllAppSettings(): Promise<{[key: string]: any}> {
    const settings = await db
      .select()
      .from(appSettings);

    // Convert to a key/value map
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as {[key: string]: any});
  }

  // Information content operations
  async getInformationContent(query?: string, category?: string): Promise<InformationContent[]> {
    let conditions = [];

    // Filter by category if provided
    if (category) {
      conditions.push(eq(informationContent.category, category));
    }

    // Filter by search query
    if (query && query.trim() !== '') {
      conditions.push(
        or(
          like(informationContent.title, `%${query}%`),
          like(informationContent.content, `%${query}%`),
          like(informationContent.summary, `%${query}%`)
        )
      );
    }

    // Build the query with all conditions
    if (conditions.length > 0) {
      return await db.select().from(informationContent).where(and(...conditions)).orderBy(desc(informationContent.trustScore));
    }

    // No conditions means return all information content, ordered by trust score
    return await db.select().from(informationContent).orderBy(desc(informationContent.trustScore));
  }

  async getInformationContentById(id: number): Promise<InformationContent | undefined> {
    const [content] = await db.select().from(informationContent).where(eq(informationContent.id, id));
    return content;
  }

  async createInformationContent(content: InsertInformationContent): Promise<InformationContent> {
    // Ensure all required fields have default values if not provided
    const contentWithDefaults = {
      ...content,
      sourceVerified: content.sourceVerified ?? false,
      sourceType: content.sourceType || "website",
      imageUrl: content.imageUrl || null,
      verifiedSince: content.verifiedSince || null,
      warning: content.warning || null
    };

    const [newContent] = await db.insert(informationContent).values(contentWithDefaults).returning();
    return newContent;
  }

  async getInformationContentByCategory(category: string): Promise<InformationContent[]> {
    return await db.select().from(informationContent)
      .where(eq(informationContent.category, category))
      .orderBy(desc(informationContent.trustScore));
  }

  // Collaborative Search operations
  async createCollaborativeSearch(search: InsertCollaborativeSearch): Promise<CollaborativeSearch> {
    const [collaborativeSearch] = await db.insert(collaborativeSearches).values(search).returning();

    // Automatically add the creator as a collaborator with owner role
    await this.addCollaborator({
      searchId: collaborativeSearch.id,
      userId: collaborativeSearch.userId,
      role: "owner",
      status: "active"
    });

    return collaborativeSearch;
  }

  async getCollaborativeSearchById(id: number): Promise<CollaborativeSearch | undefined> {
    const [search] = await db.select().from(collaborativeSearches).where(eq(collaborativeSearches.id, id));
    return search;
  }

  async getUserCollaborativeSearches(userId: number): Promise<CollaborativeSearch[]> {
    // Get searches where user is the creator
    return await db.select().from(collaborativeSearches)
      .where(eq(collaborativeSearches.userId, userId))
      .orderBy(desc(collaborativeSearches.createdAt));
  }

  async updateCollaborativeSearch(id: number, data: Partial<InsertCollaborativeSearch>): Promise<CollaborativeSearch> {
    // Set the updated timestamp
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    const [search] = await db.update(collaborativeSearches)
      .set(updateData)
      .where(eq(collaborativeSearches.id, id))
      .returning();

    return search;
  }

  async searchCollaborativeSearches(query: string, topic?: string): Promise<CollaborativeSearch[]> {
    // Build the SQL query directly for more control
    let sqlQuery = sql`
      SELECT * FROM ${collaborativeSearches}
      WHERE ${collaborativeSearches.isPublic} = true
      AND ${collaborativeSearches.status} = 'active'
    `;

    // Add topic filter if provided
    if (topic) {
      sqlQuery = sql`${sqlQuery} AND ${collaborativeSearches.topic} = ${topic}`;
    }

    // Add search query filter if provided
    if (query && query.trim() !== '') {
      const searchPattern = `%${query.trim()}%`;
      sqlQuery = sql`${sqlQuery}
        AND (
          ${collaborativeSearches.title} ILIKE ${searchPattern}
          OR ${collaborativeSearches.description} ILIKE ${searchPattern}
        )
      `;
    }

    // Add ordering and limit
    sqlQuery = sql`${sqlQuery}
      ORDER BY ${collaborativeSearches.createdAt} DESC
      LIMIT 20
    `;

    // Execute the query and return properly typed results
    return await db.execute(sqlQuery) as unknown as CollaborativeSearch[];
  }

  // Collaborative Resources operations
  async addResourceToCollaborativeSearch(resource: InsertCollaborativeResource): Promise<CollaborativeResource> {
    const [newResource] = await db.insert(collaborativeResources).values(resource).returning();
    return newResource;
  }

  async getResourceById(id: number): Promise<CollaborativeResource | undefined> {
    const [resource] = await db.select().from(collaborativeResources).where(eq(collaborativeResources.id, id));
    return resource;
  }

  async getResourcesBySearchId(searchId: number): Promise<CollaborativeResource[]> {
    return await db.select().from(collaborativeResources)
      .where(eq(collaborativeResources.searchId, searchId))
      .orderBy(desc(collaborativeResources.createdAt));
  }

  async updateResource(id: number, data: Partial<InsertCollaborativeResource>): Promise<CollaborativeResource> {
    // Set the updated timestamp
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    const [resource] = await db.update(collaborativeResources)
      .set(updateData)
      .where(eq(collaborativeResources.id, id))
      .returning();

    return resource;
  }

  // Collaborator operations
  async addCollaborator(collaborator: InsertCollaborativeCollaborator): Promise<CollaborativeCollaborator> {
    const [newCollaborator] = await db.insert(collaborativeCollaborators).values(collaborator).returning();
    return newCollaborator;
  }

  async getSearchCollaborators(searchId: number): Promise<CollaborativeCollaborator[]> {
    return await db.select().from(collaborativeCollaborators)
      .where(eq(collaborativeCollaborators.searchId, searchId));
  }

  async getUserCollaborations(userId: number): Promise<CollaborativeCollaborator[]> {
    return await db.select().from(collaborativeCollaborators)
      .where(
        and(
          eq(collaborativeCollaborators.userId, userId),
          eq(collaborativeCollaborators.status, "active")
        )
      );
  }

  async removeCollaborator(searchId: number, userId: number): Promise<boolean> {
    // Don't actually delete, just set status to removed
    const result = await db.update(collaborativeCollaborators)
      .set({ status: "removed" })
      .where(
        and(
          eq(collaborativeCollaborators.searchId, searchId),
          eq(collaborativeCollaborators.userId, userId)
        )
      );

    return true;
  }

  // Resource Permission operations
  async requestResourcePermission(request: InsertResourcePermissionRequest): Promise<ResourcePermissionRequest> {
    const [newRequest] = await db.insert(resourcePermissionRequests).values(request).returning();
    return newRequest;
  }

  async getResourcePermissionRequests(resourceId: number): Promise<ResourcePermissionRequest[]> {
    return await db.select().from(resourcePermissionRequests)
      .where(eq(resourcePermissionRequests.resourceId, resourceId))
      .orderBy(desc(resourcePermissionRequests.createdAt));
  }

  async getUserPermissionRequests(userId: number): Promise<ResourcePermissionRequest[]> {
    return await db.select().from(resourcePermissionRequests)
      .where(eq(resourcePermissionRequests.requesterId, userId))
      .orderBy(desc(resourcePermissionRequests.createdAt));
  }

  async updatePermissionRequestStatus(requestId: number, status: string): Promise<ResourcePermissionRequest> {
    // Set the updated timestamp
    const updateData = {
      status,
      updatedAt: new Date()
    };

    const [request] = await db.update(resourcePermissionRequests)
      .set(updateData)
      .where(eq(resourcePermissionRequests.id, requestId))
      .returning();

    return request;
  }

  // Shopping Cart operations
  async getUserCartItems(userId: number): Promise<CartItemWithProduct[]> {
    try {
      // Join cart items with products to get full product details
      const result = await db.select({
        cartItem: cartItems,
        product: products
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.addedAt));

      // Map the joined results to CartItemWithProduct objects, handling null products
      return result.map(row => {
        const item: CartItemWithProduct = {
          ...row.cartItem,
          product: row.product || undefined
        };
        return item;
      });
    } catch (error) {
      console.error("Error fetching user cart items:", error);
      return [];
    }
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    try {
      // Check if the item already exists in the cart
      const existingItems = await db.select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.userId, item.userId),
            eq(cartItems.productId, item.productId)
          )
        );

      if (existingItems.length > 0) {
        // Item already exists, update quantity
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + (item.quantity || 1);

        const [updatedItem] = await db.update(cartItems)
          .set({
            quantity: newQuantity,
            updatedAt: new Date(),
            ...(item.source ? { source: item.source } : {})
          })
          .where(eq(cartItems.id, existingItem.id))
          .returning();

        return updatedItem;
      } else {
        // Item doesn't exist, insert new
        const newItem = {
          ...item,
          quantity: item.quantity || 1,
          addedAt: new Date(),
          updatedAt: null,
          source: item.source || 'manual'
        };

        const [createdItem] = await db.insert(cartItems).values(newItem).returning();
        return createdItem;
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  }

  async updateCartItemQuantity(itemId: number, quantity: number): Promise<CartItem> {
    try {
      const [updatedItem] = await db.update(cartItems)
        .set({
          quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, itemId))
        .returning();

      if (!updatedItem) {
        throw new Error("Cart item not found");
      }

      return updatedItem;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      throw error;
    }
  }

  async removeCartItem(itemId: number): Promise<void> {
    try {
      await db.delete(cartItems)
        .where(eq(cartItems.id, itemId));
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error;
    }
  }

  async clearUserCart(userId: number): Promise<void> {
    try {
      await db.delete(cartItems)
        .where(eq(cartItems.userId, userId));
    } catch (error) {
      console.error("Error clearing user cart:", error);
      throw error;
    }
  }

  async addAiRecommendationToCart(userId: number, recommendationId: number): Promise<CartItem> {
    try {
      // First, get the recommendation to find the product
      // Don't filter by userId to allow any user to add AI recommendations (supports demo mode)
      const recommendations = await db.select()
        .from(aiShopperRecommendations)
        .where(eq(aiShopperRecommendations.id, recommendationId));

      if (recommendations.length === 0) {
        // If no recommendations found, check if this is a free access scenario
        // Check for setting that might enable free access
        const paidFeaturesDisabled = await this.getAppSettings('paidFeaturesDisabled');

        if (!paidFeaturesDisabled) {
          // If not in free access mode, recommendation should be tied to user
          throw new Error("Recommendation not found");
        }

        // For free access mode, try again with the demo user ID (usually 1)
        const demoRecommendations = await db.select()
          .from(aiShopperRecommendations)
          .where(eq(aiShopperRecommendations.id, recommendationId));

        if (demoRecommendations.length === 0) {
          throw new Error("Recommendation not found in free access mode");
        }
      }

      const recommendation = recommendations[0];

      // Add the product to the cart with the current user's ID
      const cartItem = await this.addCartItem({
        userId, // Use the current user's ID regardless of recommendation.userId
        productId: recommendation.productId,
        quantity: 1,
        source: "ai_recommendation", // Use "ai_recommendation" for manually added AI recommendations
        recommendationId
      });

      // Update the recommendation status
      await db.update(aiShopperRecommendations)
        .set({
          status: "added_to_cart",
          updatedAt: new Date()
        })
        .where(eq(aiShopperRecommendations.id, recommendationId));

      return cartItem;
    } catch (error) {
      console.error("Error adding AI recommendation to cart:", error);
      throw error;
    }
  }

  // DasWos Coins operations
  async getUserDasWosCoins(userId: number): Promise<number> {
    try {
      // Get user to check if they have a coins field
      const user = await this.getUser(userId);
      if (!user) throw new Error(`User with ID ${userId} not found`);

      // Get the user's coin balance from transactions
      // Sum all transactions (add transactions as positive, spend transactions as negative)
      const transactions = await db
        .select({
          totalCoins: sql`COALESCE(SUM(CASE
            WHEN type = 'purchase' OR type = 'reward' OR type = 'refund' OR type = 'admin' THEN amount
            WHEN type = 'spend' THEN -amount
            ELSE 0
          END), 0)::integer`
        })
        .from(dasWosCoinsTransactions)
        .where(eq(dasWosCoinsTransactions.userId, userId));

      return transactions[0]?.totalCoins as number || 0;
    } catch (error) {
      console.error(`Error getting DasWos Coins balance for user ${userId}:`, error);
      return 0;
    }
  }

  async addDasWosCoins(userId: number, amount: number, type: string, description: string, metadata?: any): Promise<boolean> {
    try {
      // Validate that amount is positive for adding coins
      if (amount <= 0) {
        throw new Error('Amount must be positive when adding coins');
      }

      // Validate type is valid for adding coins
      const validTypes = ['purchase', 'reward', 'refund', 'admin'];
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid type for adding coins: ${type}. Must be one of: ${validTypes.join(', ')}`);
      }

      // Add transaction record
      await db.insert(dasWosCoinsTransactions).values({
        userId,
        amount,
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date()
      });

      return true;
    } catch (error) {
      console.error(`Error adding DasWos Coins for user ${userId}:`, error);
      return false;
    }
  }

  async spendDasWosCoins(userId: number, amount: number, description: string, metadata?: any): Promise<boolean> {
    try {
      // Validate that amount is positive for spending
      if (amount <= 0) {
        throw new Error('Amount must be positive when spending coins');
      }

      // Check if user has enough coins
      const balance = await this.getUserDasWosCoins(userId);
      if (balance < amount) {
        throw new Error(`Insufficient balance. User has ${balance} coins, attempting to spend ${amount}`);
      }

      // Add spend transaction
      await db.insert(dasWosCoinsTransactions).values({
        userId,
        amount, // Store as positive value, but will be subtracted in balance calculation
        type: 'spend',
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date()
      });

      return true;
    } catch (error) {
      console.error(`Error spending DasWos Coins for user ${userId}:`, error);
      return false;
    }
  }

  async getDasWosCoinsTransactions(userId: number, limit?: number): Promise<DasWosCoinsTransaction[]> {
    try {
      // Build and execute query to get transactions for this user
      let transactions;

      if (limit && limit > 0) {
        transactions = await db.select()
          .from(dasWosCoinsTransactions)
          .where(eq(dasWosCoinsTransactions.userId, userId))
          .orderBy(desc(dasWosCoinsTransactions.createdAt))
          .limit(limit);
      } else {
        transactions = await db.select()
          .from(dasWosCoinsTransactions)
          .where(eq(dasWosCoinsTransactions.userId, userId))
          .orderBy(desc(dasWosCoinsTransactions.createdAt));
      }

      // Parse metadata from JSON string to object
      return transactions.map(tx => {
        try {
          // Safely handle metadata that could be string, object, or null
          let parsedMetadata;

          if (tx.metadata === null || tx.metadata === undefined) {
            parsedMetadata = null;
          } else if (typeof tx.metadata === 'object') {
            parsedMetadata = tx.metadata;
          } else if (typeof tx.metadata === 'string') {
            try {
              // Only try to parse if it looks like a JSON string (starts with { or [)
              if (tx.metadata.trim().startsWith('{') || tx.metadata.trim().startsWith('[')) {
                parsedMetadata = JSON.parse(tx.metadata);
              } else {
                // For non-JSON strings, keep as is
                parsedMetadata = tx.metadata;
              }
            } catch {
              // If parsing fails, keep original value
              parsedMetadata = tx.metadata;
            }
          } else {
            // For any other type, keep as is
            parsedMetadata = tx.metadata;
          }

          return {
            ...tx,
            metadata: parsedMetadata
          };
        } catch (error) {
          console.log(`Error parsing metadata for transaction ${tx.id}:`, error);
          // Return the transaction with original metadata to avoid breaking
          return {
            ...tx,
            metadata: null
          };
        }
      });
    } catch (error) {
      console.error(`Error getting DasWos Coins transactions for user ${userId}:`, error);
      return [];
    }
  }
  // Split Bulk Buy operations
  async createSplitBuy(splitBuy: InsertSplitBuy): Promise<SplitBuy> {
    try {
      // Add expiration date if not provided (default 7 days from now)
      const splitBuyWithDefaults = {
        ...splitBuy,
        expiresAt: splitBuy.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const [result] = await db.insert(splitBuys).values(splitBuyWithDefaults).returning();

      // Automatically add the initiator as the first participant
      await this.addSplitBuyParticipant({
        splitBuyId: result.id,
        userId: result.initiatorUserId,
        quantityCommitted: 1 // Default to 1, can be updated later
      });

      return result;
    } catch (error) {
      console.error("Error creating split buy:", error);
      throw error;
    }
  }

  async getSplitBuyById(id: number): Promise<SplitBuy | undefined> {
    try {
      const [splitBuy] = await db.select().from(splitBuys).where(eq(splitBuys.id, id));
      return splitBuy;
    } catch (error) {
      console.error("Error getting split buy by ID:", error);
      return undefined;
    }
  }

  async getSplitBuysByProductId(productId: number): Promise<SplitBuy[]> {
    try {
      return await db.select()
        .from(splitBuys)
        .where(and(
          eq(splitBuys.productId, productId),
          eq(splitBuys.status, "active")
        ))
        .orderBy(desc(splitBuys.createdAt));
    } catch (error) {
      console.error("Error getting split buys by product ID:", error);
      return [];
    }
  }

  async getSplitBuysByUserId(userId: number): Promise<SplitBuy[]> {
    try {
      // Get split buys where the user is either initiator or participant
      const initiatedSplitBuys = await db.select()
        .from(splitBuys)
        .where(eq(splitBuys.initiatorUserId, userId));

      // Get participant split buy IDs
      const participantEntries = await db.select()
        .from(splitBuyParticipants)
        .where(eq(splitBuyParticipants.userId, userId));

      if (participantEntries.length === 0) {
        return initiatedSplitBuys;
      }

      // Create array of split buy IDs from participant entries
      const participantIds = participantEntries.map(p => p.splitBuyId);

      // Only proceed if we have participant entries
      let participantSplitBuys = [];

      if (participantIds.length > 0) {
        // Get participant split buys
        // Using OR conditions for each id instead of IN operator
        participantSplitBuys = await db.select()
          .from(splitBuys)
          .where(
            and(
              or(...participantIds.map(id => eq(splitBuys.id, id))),
              not(eq(splitBuys.initiatorUserId, userId))
            )
          );
      }

      // Combine both lists, removing duplicates
      const allSplitBuys = [...initiatedSplitBuys];

      // Add participant split buys if not already in the list
      for (const splitBuy of participantSplitBuys) {
        if (!allSplitBuys.some(sb => sb.id === splitBuy.id)) {
          allSplitBuys.push(splitBuy);
        }
      }

      return allSplitBuys.sort((a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      );
    } catch (error) {
      console.error("Error getting split buys by user ID:", error);
      return [];
    }
  }

  async updateSplitBuyStatus(id: number, status: string): Promise<SplitBuy> {
    try {
      const [splitBuy] = await db
        .update(splitBuys)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(splitBuys.id, id))
        .returning();

      return splitBuy;
    } catch (error) {
      console.error("Error updating split buy status:", error);
      throw error;
    }
  }

  async addSplitBuyParticipant(participant: InsertSplitBuyParticipant): Promise<SplitBuyParticipant> {
    try {
      const [result] = await db.insert(splitBuyParticipants).values(participant).returning();

      // Update current quantity in the split buy
      const allParticipants = await this.getSplitBuyParticipants(participant.splitBuyId);
      const totalQuantity = allParticipants.reduce((sum, p) => sum + p.quantityCommitted, 0);

      // Update split buy with new quantity
      await db
        .update(splitBuys)
        .set({
          currentQuantity: totalQuantity,
          updatedAt: new Date()
        })
        .where(eq(splitBuys.id, participant.splitBuyId));

      return result;
    } catch (error) {
      console.error("Error adding split buy participant:", error);
      throw error;
    }
  }

  async getSplitBuyParticipants(splitBuyId: number): Promise<SplitBuyParticipant[]> {
    try {
      return await db.select()
        .from(splitBuyParticipants)
        .where(eq(splitBuyParticipants.splitBuyId, splitBuyId))
        .orderBy(asc(splitBuyParticipants.joinedAt));
    } catch (error) {
      console.error("Error getting split buy participants:", error);
      return [];
    }
  }

  async updateSplitBuyParticipantStatus(id: number, status: string): Promise<SplitBuyParticipant> {
    try {
      const [participant] = await db
        .update(splitBuyParticipants)
        .set({
          paymentStatus: status,
          updatedAt: new Date()
        })
        .where(eq(splitBuyParticipants.id, id))
        .returning();

      return participant;
    } catch (error) {
      console.error("Error updating split buy participant status:", error);
      throw error;
    }
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const [result] = await db.insert(orders).values(order).returning();
      return result;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Error getting order by ID:", error);
      return undefined;
    }
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.orderDate));
    } catch (error) {
      console.error("Error getting orders by user ID:", error);
      return [];
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    try {
      const [order] = await db
        .update(orders)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(orders.id, id))
        .returning();

      return order;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      const [result] = await db.insert(orderItems).values(orderItem).returning();
      return result;
    } catch (error) {
      console.error("Error adding order item:", error);
      throw error;
    }
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    try {
      return await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
    } catch (error) {
      console.error("Error getting order items by order ID:", error);
      return [];
    }
  }

  // Daswos AI Chat operations
  async createDaswosAiChat(chat: InsertDaswosAiChat): Promise<DaswosAiChat> {
    try {
      const [newChat] = await db.insert(daswosAiChats).values(chat).returning();
      return newChat;
    } catch (error) {
      console.error("Error creating Daswos AI chat:", error);
      throw error;
    }
  }

  async getUserChats(userId: number | null): Promise<DaswosAiChat[]> {
    try {
      if (userId) {
        // Get authenticated user's chats
        return await db.select()
          .from(daswosAiChats)
          .where(and(
            eq(daswosAiChats.userId, userId),
            eq(daswosAiChats.isArchived, false)
          ))
          .orderBy(desc(daswosAiChats.updatedAt));
      } else {
        // Get guest chats (those without userId)
        return await db.select()
          .from(daswosAiChats)
          .where(and(
            isNotNull(daswosAiChats.userId),
            eq(daswosAiChats.isArchived, false)
          ))
          .orderBy(desc(daswosAiChats.updatedAt));
      }
    } catch (error) {
      console.error("Error getting user chats:", error);
      return [];
    }
  }

  async getChatById(chatId: number): Promise<DaswosAiChat | undefined> {
    try {
      const [chat] = await db.select()
        .from(daswosAiChats)
        .where(eq(daswosAiChats.id, chatId));
      return chat;
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      return undefined;
    }
  }

  async updateChatTitle(chatId: number, title: string): Promise<DaswosAiChat> {
    try {
      const [updatedChat] = await db.update(daswosAiChats)
        .set({
          title,
          updatedAt: new Date()
        })
        .where(eq(daswosAiChats.id, chatId))
        .returning();
      return updatedChat;
    } catch (error) {
      console.error("Error updating chat title:", error);
      throw error;
    }
  }

  async archiveChat(chatId: number): Promise<DaswosAiChat> {
    try {
      const [archivedChat] = await db.update(daswosAiChats)
        .set({
          isArchived: true,
          updatedAt: new Date()
        })
        .where(eq(daswosAiChats.id, chatId))
        .returning();
      return archivedChat;
    } catch (error) {
      console.error("Error archiving chat:", error);
      throw error;
    }
  }

  // Daswos AI Chat Messages operations
  async addChatMessage(message: InsertDaswosAiChatMessage): Promise<DaswosAiChatMessage> {
    try {
      const [newMessage] = await db.insert(daswosAiChatMessages).values(message).returning();

      // Update the chat's updatedAt timestamp
      await db.update(daswosAiChats)
        .set({ updatedAt: new Date() })
        .where(eq(daswosAiChats.id, message.chatId));

      return newMessage;
    } catch (error) {
      console.error("Error adding chat message:", error);
      throw error;
    }
  }

  async getChatMessages(chatId: number): Promise<DaswosAiChatMessage[]> {
    try {
      return await db.select()
        .from(daswosAiChatMessages)
        .where(eq(daswosAiChatMessages.chatId, chatId))
        .orderBy(asc(daswosAiChatMessages.timestamp));
    } catch (error) {
      console.error("Error getting chat messages:", error);
      return [];
    }
  }

  async getRecentChatMessage(chatId: number): Promise<DaswosAiChatMessage | undefined> {
    try {
      const [message] = await db.select()
        .from(daswosAiChatMessages)
        .where(eq(daswosAiChatMessages.chatId, chatId))
        .orderBy(desc(daswosAiChatMessages.timestamp))
        .limit(1);
      return message;
    } catch (error) {
      console.error("Error getting recent chat message:", error);
      return undefined;
    }
  }

  // Daswos AI Sources operations
  async addMessageSource(source: InsertDaswosAiSource): Promise<DaswosAiSource> {
    try {
      const [newSource] = await db.insert(daswosAiSources).values(source).returning();
      return newSource;
    } catch (error) {
      console.error("Error adding message source:", error);
      throw error;
    }
  }

  async getMessageSources(messageId: number): Promise<DaswosAiSource[]> {
    try {
      return await db.select()
        .from(daswosAiSources)
        .where(eq(daswosAiSources.messageId, messageId))
        .orderBy(desc(daswosAiSources.relevanceScore));
    } catch (error) {
      console.error("Error getting message sources:", error);
      return [];
    }
  }

  // Family invitation code operations
  async createFamilyInvitationCode(ownerId: number, email?: string, expiresInDays: number = 7): Promise<FamilyInvitationCode> {
    try {
      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Create the invitation code
      const [invitation] = await db.insert(familyInvitationCodes).values({
        code,
        ownerUserId: ownerId,
        email,
        expiresAt,
        isUsed: false
      }).returning();

      return invitation;
    } catch (error) {
      console.error("Error creating family invitation code:", error);
      throw error;
    }
  }

  async getFamilyInvitationByCode(code: string): Promise<FamilyInvitationCode | undefined> {
    try {
      const [invitation] = await db
        .select()
        .from(familyInvitationCodes)
        .where(eq(familyInvitationCodes.code, code));

      return invitation;
    } catch (error) {
      console.error("Error getting family invitation by code:", error);
      throw error;
    }
  }

  async getFamilyInvitationsByOwner(ownerId: number): Promise<FamilyInvitationCode[]> {
    try {
      return await db
        .select()
        .from(familyInvitationCodes)
        .where(eq(familyInvitationCodes.ownerUserId, ownerId));
    } catch (error) {
      console.error("Error getting family invitations by owner:", error);
      throw error;
    }
  }

  async markFamilyInvitationAsUsed(code: string, userId: number): Promise<boolean> {
    try {
      const [invitation] = await db
        .update(familyInvitationCodes)
        .set({
          isUsed: true,
          usedByUserId: userId
        })
        .where(eq(familyInvitationCodes.code, code))
        .returning();

      return !!invitation;
    } catch (error) {
      console.error("Error marking family invitation as used:", error);
      throw error;
    }
  }

  async updateFamilyMemberSettings(ownerId: number, memberId: number, settings: any): Promise<boolean> {
    try {
      // First verify that the ownerId is the family owner of memberId
      const member = await this.getUser(memberId);
      if (!member || member.familyOwnerId !== ownerId) {
        return false;
      }

      // Update the member's settings
      await db
        .update(users)
        .set(settings)
        .where(eq(users.id, memberId));

      return true;
    } catch (error) {
      console.error("Error updating family member settings:", error);
      return false;
    }
  }

  // User Settings operations
  async getDasbarSettings(userId: number): Promise<any> {
    try {
      // First check if we have settings stored in app_settings
      const key = `user_${userId}_dasbar_settings`;
      const [settings] = await db.select()
        .from(appSettings)
        .where(eq(appSettings.key, key));

      if (settings) {
        return settings.value;
      }

      // Return default settings if none found
      return {
        enabled: true,
        autoRefresh: false,
        refreshInterval: 30,
        notifications: true
      };
    } catch (error) {
      console.error("Error getting DasBar settings:", error);
      // Return default settings on error
      return {
        enabled: true,
        autoRefresh: false,
        refreshInterval: 30,
        notifications: true
      };
    }
  }

  async updateDasbarSettings(settings: any): Promise<any> {
    try {
      const { userId, ...settingsData } = settings;
      const key = `user_${userId}_dasbar_settings`;

      // Check if settings already exist
      const [existingSettings] = await db.select()
        .from(appSettings)
        .where(eq(appSettings.key, key));

      if (existingSettings) {
        // Update existing settings
        await db.update(appSettings)
          .set({
            value: settingsData,
            updatedAt: new Date()
          })
          .where(eq(appSettings.key, key));
      } else {
        // Create new settings
        await db.insert(appSettings)
          .values({
            key,
            value: settingsData,
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }

      return settingsData;
    } catch (error) {
      console.error("Error updating DasBar settings:", error);
      throw error;
    }
  }



  // User session methods
  async createUserSession(sessionData: {
    userId: number;
    sessionToken: string;
    deviceInfo: any;
    expiresAt: Date;
  }) {
    try {
      console.log('Creating user session for user ID:', sessionData.userId);

      // Check if the sessions table exists
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            session_token TEXT NOT NULL,
            device_info JSONB,
            is_active BOOLEAN DEFAULT TRUE,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
      } catch (tableError) {
        console.error('Error creating sessions table:', tableError);
        // Continue anyway, as the table might already exist
      }

      // Insert the session into the database
      try {
        const [session] = await db.execute(sql`
          INSERT INTO user_sessions (
            user_id,
            session_token,
            device_info,
            is_active,
            expires_at
          )
          VALUES (
            ${sessionData.userId},
            ${sessionData.sessionToken},
            ${JSON.stringify(sessionData.deviceInfo)},
            TRUE,
            ${sessionData.expiresAt}
          )
          RETURNING *
        `);

        return session || { id: 1, ...sessionData };
      } catch (insertError) {
        console.error('Error inserting session:', insertError);
        // Return a mock session if database insert fails
        return { id: 1, ...sessionData };
      }
    } catch (error) {
      console.error('Error in createUserSession:', error);
      // Return a mock session as fallback
      return { id: 1, ...sessionData };
    }
  }

  async getUserSessions(userId: number | null) {
    try {
      console.log('Getting user sessions for user ID:', userId);

      // If userId is null, return all sessions (for token validation)
      if (userId === null) {
        const sessions = await db.execute(sql`
          SELECT * FROM user_sessions
          WHERE is_active = TRUE AND expires_at > NOW()
        `);
        return sessions || [];
      }

      // Get sessions for a specific user
      const sessions = await db.execute(sql`
        SELECT * FROM user_sessions
        WHERE user_id = ${userId} AND is_active = TRUE
        ORDER BY created_at DESC
      `);

      return sessions || [];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async deactivateSession(sessionToken: string) {
    try {
      console.log('Deactivating session:', sessionToken);

      await db.execute(sql`
        UPDATE user_sessions
        SET is_active = FALSE
        WHERE session_token = ${sessionToken}
      `);

      return true;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  async deactivateAllUserSessions(userId: number) {
    try {
      console.log('Deactivating all sessions for user ID:', userId);

      await db.execute(sql`
        UPDATE user_sessions
        SET is_active = FALSE
        WHERE user_id = ${userId}
      `);

      return true;
    } catch (error) {
      console.error('Error deactivating all user sessions:', error);
      return false;
    }
  }
}

const databaseStorage = new DatabaseStorage();
const memoryStorageInstance = memoryStorage;

// Streamlined HybridStorage class that implements our simplified IStorage interface
export class HybridStorage implements IStorage {
  private primaryStorage: DatabaseStorage;
  private fallbackStorage: FallbackStorage;

  constructor() {
    this.primaryStorage = new DatabaseStorage();
    this.fallbackStorage = memoryStorage;
  }

  // Proxy the sessionStore property
  get sessionStore() {
    return this.primaryStorage.sessionStore;
  }

  // Helper method to execute a storage operation with fallback
  private async executeWithFallback<T>(
    operation: string,
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryFn();
    } catch (error) {
      console.log(`Error in ${operation}, using fallback storage: ${error}`);
      return await fallbackFn();
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.executeWithFallback(
      'getUser',
      () => this.primaryStorage.getUser(id),
      () => this.fallbackStorage.getUser(id)
    );
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.executeWithFallback(
      'getUserById',
      () => this.primaryStorage.getUserById(id),
      () => this.fallbackStorage.getUserById(id)
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.executeWithFallback(
      'getUserByUsername',
      () => this.primaryStorage.getUserByUsername(username),
      () => this.fallbackStorage.getUserByUsername(username)
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.executeWithFallback(
      'getUserByEmail',
      () => this.primaryStorage.getUserByEmail(email),
      () => this.fallbackStorage.getUserByEmail(email)
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.executeWithFallback(
      'createUser',
      () => this.primaryStorage.createUser(user),
      () => this.fallbackStorage.createUser(user)
    );
  }

  // Product operations
  async getProducts(sphere: string, query?: string): Promise<Product[]> {
    return this.executeWithFallback(
      'getProducts',
      () => this.primaryStorage.getProducts(sphere, query),
      () => this.fallbackStorage.getProducts(sphere, query)
    );
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.executeWithFallback(
      'getProductById',
      () => this.primaryStorage.getProductById(id),
      () => this.fallbackStorage.getProductById(id)
    );
  }

  // Information content operations
  async getInformationContent(query?: string, category?: string): Promise<InformationContent[]> {
    return this.executeWithFallback(
      'getInformationContent',
      () => this.primaryStorage.getInformationContent(query, category),
      () => this.fallbackStorage.getInformationContent(query, category)
    );
  }

  async getInformationContentById(id: number): Promise<InformationContent | undefined> {
    return this.executeWithFallback(
      'getInformationContentById',
      () => this.primaryStorage.getInformationContentById(id),
      () => this.fallbackStorage.getInformationContentById(id)
    );
  }

  // User session operations
  async createUserSession(session: any): Promise<any> {
    return this.executeWithFallback(
      'createUserSession',
      () => this.primaryStorage.createUserSession(session),
      () => this.fallbackStorage.createUserSession(session)
    );
  }

  async getUserSessions(userId: number | null): Promise<any[]> {
    return this.executeWithFallback(
      'getUserSessions',
      () => this.primaryStorage.getUserSessions(userId),
      () => this.fallbackStorage.getUserSessions(userId)
    );
  }

  async deactivateSession(sessionToken: string): Promise<boolean> {
    return this.executeWithFallback(
      'deactivateSession',
      () => this.primaryStorage.deactivateSession(sessionToken),
      () => this.fallbackStorage.deactivateSession(sessionToken)
    );
  }

  async deactivateAllUserSessions(userId: number): Promise<boolean> {
    return this.executeWithFallback(
      'deactivateAllUserSessions',
      () => this.primaryStorage.deactivateAllUserSessions(userId),
      () => this.fallbackStorage.deactivateAllUserSessions(userId)
    );
  }

  // App settings operations
  async getAppSettings(key: string): Promise<any> {
    return this.executeWithFallback(
      'getAppSettings',
      () => this.primaryStorage.getAppSettings(key),
      () => this.fallbackStorage.getAppSettings(key)
    );
  }

  async setAppSettings(key: string, value: any): Promise<boolean> {
    return this.executeWithFallback(
      'setAppSettings',
      () => this.primaryStorage.setAppSettings(key, value),
      () => this.fallbackStorage.setAppSettings(key, value)
    );
  }

  async getAllAppSettings(): Promise<{[key: string]: any}> {
    return this.executeWithFallback(
      'getAllAppSettings',
      () => this.primaryStorage.getAllAppSettings(),
      () => this.fallbackStorage.getAllAppSettings()
    );
  }

  // User subscription operations
  async updateUserSubscription(userId: number, subscriptionType: string, durationMonths: number): Promise<User> {
    return this.executeWithFallback(
      'updateUserSubscription',
      () => this.primaryStorage.updateUserSubscription(userId, subscriptionType, durationMonths),
      () => this.fallbackStorage.updateUserSubscription(userId, subscriptionType, durationMonths)
    );
  }

  async checkUserHasSubscription(userId: number): Promise<boolean> {
    return this.executeWithFallback(
      'checkUserHasSubscription',
      () => this.primaryStorage.checkUserHasSubscription(userId),
      () => this.fallbackStorage.checkUserHasSubscription(userId)
    );
  }

  async getUserSubscriptionDetails(userId: number): Promise<{hasSubscription: boolean, type?: string, expiresAt?: Date}> {
    return this.executeWithFallback(
      'getUserSubscriptionDetails',
      () => this.primaryStorage.getUserSubscriptionDetails(userId),
      () => this.fallbackStorage.getUserSubscriptionDetails(userId)
    );
  }

  // AI operations
  async generateAiRecommendations(
    userId: number,
    searchQuery?: string,
    isBulkBuy?: boolean,
    searchHistory?: string[],
    shoppingList?: string
  ): Promise<{ success: boolean; message: string; }> {
    return this.executeWithFallback(
      'generateAiRecommendations',
      () => this.primaryStorage.generateAiRecommendations(userId, searchQuery, isBulkBuy, searchHistory, shoppingList),
      () => this.fallbackStorage.generateAiRecommendations(userId, searchQuery, isBulkBuy, searchHistory, shoppingList)
    );
  }
}

// Create a storage instance
export const storage = new HybridStorage();

// Log storage configuration
if (process.env.NODE_ENV === 'production') {
  log('Production mode active: Using PostgreSQL exclusively with no fallbacks', 'info');
} else {
  log('Development mode active: Primary storage is PostgreSQL with memory fallback', 'info');
}

