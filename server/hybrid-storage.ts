import { IStorage } from "./storage";
import {
  InsertProduct,
  InsertUser,
  Product,
  User,
  InsertSearchQuery,
  SearchQuery,
  InformationContent,
  insertDaswosAiChatSchema,
  insertDaswosAiChatMessageSchema,
  DaswosAiChat,
  DaswosAiChatMessage,
  UserSession
} from "@shared/schema";
import { db } from "./db";
import { users, products, searchQueries, informationContent, daswosAiChats, daswosAiChatMessages, appSettings, userSessions } from "@shared/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

export class HybridStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  // Keeping this method for backward compatibility
  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserSubscription(userId: number, type: string, durationMonths: number): Promise<User> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    const hasSubscription = type !== "";

    const result = await db.update(users)
      .set({
        subscriptionType: type,
        subscriptionExpiresAt: hasSubscription ? expiresAt : null,
        hasSubscription
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async checkUserHasSubscription(userId: number): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    // Check if user has active subscription
    if (!user.hasSubscription) return false;

    // Check if subscription has expired
    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      // Subscription has expired, update the user record
      await db.update(users)
        .set({
          hasSubscription: false,
          subscriptionType: null,
          subscriptionExpiresAt: null
        })
        .where(eq(users.id, userId));

      return false;
    }

    return true;
  }

  async getUserSubscriptionDetails(userId: number): Promise<any> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    return {
      hasSubscription: user.hasSubscription,
      type: user.subscriptionType,
      expiresAt: user.subscriptionExpiresAt
    };
  }

  // Product methods
  async getProducts(sphere: string = "safesphere", query: string = ""): Promise<Product[]> {
    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase();

    // Start building the where clause
    let whereClause = sql`1 = 1`; // Default to true

    // Filter by sphere if provided
    if (sphere.startsWith('bulkbuy')) {
      // Special handling for bulkbuy spheres
      whereClause = and(whereClause, eq(products.isBulkBuy, true));

      // Apply additional sphere filter (safe/open)
      if (sphere === 'bulkbuy-safe') {
        whereClause = and(whereClause, sql`${products.trustScore} >= 80`);
      }
    } else if (sphere === 'safesphere') {
      whereClause = and(whereClause, sql`${products.trustScore} >= 80`);
    }

    // Apply search query if provided
    if (searchQuery) {
      // Handle natural language queries by extracting keywords
      const words = searchQuery.split(/\s+/);

      // Common filler words to ignore
      const fillerWords = ['i', 'am', 'is', 'are', 'the', 'a', 'an', 'for', 'to', 'in', 'on', 'at', 'by', 'with',
                          'about', 'like', 'of', 'from', 'that', 'this', 'these', 'those', 'some', 'all', 'any',
                          'looking', 'need', 'want', 'search', 'find', 'get', 'buy'];

      // Potential product keywords from the query
      const potentialKeywords = words.filter(word =>
        word.length > 2 && // Skip very short words
        !fillerWords.includes(word) // Skip common filler words
      );

      // Always include the original query for exact matches
      potentialKeywords.push(searchQuery);

      // For multi-word queries like "office chair", also look for "chair"
      // This extracts single-word product categories that might be at the end of a phrase
      if (words.length > 1) {
        potentialKeywords.push(words[words.length - 1]); // Add the last word, often the item type

        // Add common two-word combinations
        for (let i = 0; i < words.length - 1; i++) {
          potentialKeywords.push(`${words[i]} ${words[i + 1]}`);
        }
      }

      console.log('Search keywords extracted:', potentialKeywords);

      // Build a dynamic OR clause for each potential keyword
      const keywordConditions = potentialKeywords.map(keyword =>
        or(
          like(sql`lower(${products.title})`, `%${keyword}%`),
          like(sql`lower(${products.description})`, `%${keyword}%`),
          sql`${products.tags}::text[] && ARRAY[${keyword}]::text[]`
        )
      );

      // Add the combined OR conditions to the main where clause
      whereClause = and(whereClause, or(...keywordConditions));
    }

    // Execute the query to get all matching products
    const result = await db.select().from(products).where(whereClause);

    // If we have a search query, sort results by relevance
    if (searchQuery && result.length > 0) {
      // Calculate a relevance score for each product
      const scoredResults = result.map(product => {
        let relevanceScore = 0;
        const title = product.title.toLowerCase();
        const description = product.description.toLowerCase();
        const tags = product.tags.map(tag => tag.toLowerCase());

        // Direct match in title is highest relevance
        if (title.includes(searchQuery)) {
          relevanceScore += 100;
          // Exact title match gets even higher score
          if (title === searchQuery) {
            relevanceScore += 50;
          }
          // Title starting with query gets higher score
          if (title.startsWith(searchQuery)) {
            relevanceScore += 25;
          }
        }

        // Match in tags is next highest relevance
        if (tags.some(tag => tag.includes(searchQuery) || searchQuery.includes(tag))) {
          relevanceScore += 75;
          // Exact tag match gets higher score
          if (tags.includes(searchQuery)) {
            relevanceScore += 25;
          }
        }

        // Match in description is lower relevance
        if (description.includes(searchQuery)) {
          relevanceScore += 50;
        }

        // Consider individual words in multi-word searches
        if (searchQuery.includes(' ')) {
          const words = searchQuery.split(/\s+/).filter(word => word.length > 2);
          words.forEach(word => {
            if (title.includes(word)) relevanceScore += 10;
            if (tags.some(tag => tag.includes(word))) relevanceScore += 8;
            if (description.includes(word)) relevanceScore += 5;
          });
        }

        // Factor in trust score as a smaller component of relevance
        relevanceScore += (product.trustScore / 10);

        return { product, relevanceScore };
      });

      // Sort by relevance score (descending) and return just the products
      return scoredResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .map(item => item.product);
    }

    // If no search query or no results, sort by trust score as before
    return result.sort((a, b) => b.trustScore - a.trustScore);
  }

  async getProductById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Filter out attributes that don't exist in the database table
    const filteredProduct = { ...product };
    // Remove fields that aren't in the database
    if ('categoryId' in filteredProduct) delete filteredProduct.categoryId;
    if ('aiAttributes' in filteredProduct) delete filteredProduct.aiAttributes;

    // Set searchVector to null if included in the product data
    if ('searchVector' in filteredProduct) filteredProduct.searchVector = null;

    console.log('Creating product with filtered data:', filteredProduct);

    const result = await db.insert(products).values(filteredProduct).returning();
    return result[0];
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.sellerId, sellerId));
  }

  async getRelatedProducts(tags: string[], excludeId: number): Promise<Product[]> {
    // Find products with similar tags, excluding the current product
    const result = await db.select()
      .from(products)
      .where(
        and(
          sql`${products.id} != ${excludeId}`,
          sql`${products.tags}::text[] && ARRAY[${tags.join(',')}]::text[]`
        )
      )
      .limit(5);

    return result;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    // Find products in the specified category
    const result = await db.select()
      .from(products)
      .where(
        sql`${products.tags}::text[] && ARRAY[${category}]::text[]`
      )
      .limit(10);

    return result;
  }

  // Search Query methods
  async saveSearchQuery(query: InsertSearchQuery): Promise<SearchQuery> {
    const result = await db.insert(searchQueries).values(query).returning();
    return result[0];
  }

  async getRecentSearches(limit: number = 5): Promise<SearchQuery[]> {
    return await db.select()
      .from(searchQueries)
      .orderBy(desc(searchQueries.timestamp))
      .limit(limit);
  }

  // Information Content methods
  async getInformationContent(query: string = "", category?: string): Promise<InformationContent[]> {
    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase();

    // Start building the where clause
    let whereClause = sql`1 = 1`; // Default to true

    // Apply search query if provided
    if (searchQuery) {
      // Split the query into individual words for better matching
      const queryWords = searchQuery.split(/\s+/).filter(word => word.length > 2);

      // Include the original query plus individual words in search conditions
      const searchTerms = [...queryWords];
      if (!searchTerms.includes(searchQuery)) {
        searchTerms.push(searchQuery);
      }

      // Create search conditions for each term
      const searchConditions = searchTerms.map(term =>
        or(
          like(sql`lower(${informationContent.title})`, `%${term}%`),
          like(sql`lower(${informationContent.content})`, `%${term}%`),
          like(sql`lower(${informationContent.summary})`, `%${term}%`),
          sql`${informationContent.tags}::text[] && ARRAY[${term}]::text[]`
        )
      );

      // Add the combined search conditions to the main where clause
      whereClause = and(whereClause, or(...searchConditions));
    }

    // Apply category filter if provided
    if (category) {
      whereClause = and(whereClause, eq(informationContent.category, category));
    }

    // Execute the query to get all matching content
    const results = await db.select().from(informationContent).where(whereClause);

    // If we have a search query, sort results by relevance
    if (searchQuery && results.length > 0) {
      // Calculate a relevance score for each content item
      const scoredResults = results.map(item => {
        let relevanceScore = 0;
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();
        const summary = item.summary.toLowerCase();
        const tags = item.tags.map(tag => tag.toLowerCase());

        // Direct match in title is highest relevance
        if (title.includes(searchQuery)) {
          relevanceScore += 100;
          // Exact title match gets even higher score
          if (title === searchQuery) {
            relevanceScore += 50;
          }
          // Title starting with query gets higher score
          if (title.startsWith(searchQuery)) {
            relevanceScore += 25;
          }
        }

        // Match in tags is next highest relevance
        if (tags.some(tag => tag.includes(searchQuery) || searchQuery.includes(tag))) {
          relevanceScore += 75;
          // Exact tag match gets higher score
          if (tags.includes(searchQuery)) {
            relevanceScore += 25;
          }
        }

        // Match in summary is medium relevance
        if (summary.includes(searchQuery)) {
          relevanceScore += 60;
        }

        // Match in content is lower relevance
        if (content.includes(searchQuery)) {
          relevanceScore += 40;
        }

        // Consider individual words in multi-word searches
        if (searchQuery.includes(' ')) {
          const words = searchQuery.split(/\s+/).filter(word => word.length > 2);
          words.forEach(word => {
            if (title.includes(word)) relevanceScore += 10;
            if (tags.some(tag => tag.includes(word))) relevanceScore += 8;
            if (summary.includes(word)) relevanceScore += 6;
            if (content.includes(word)) relevanceScore += 4;
          });
        }

        // Factor in trust score as a smaller component of relevance
        relevanceScore += (item.trustScore / 10);

        return { item, relevanceScore };
      });

      // Sort by relevance score (descending) and return just the items
      return scoredResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .map(scored => scored.item);
    }

    // If no search query or no results, sort by trust score
    return results.sort((a, b) => b.trustScore - a.trustScore);
  }

  async getInformationContentById(id: number): Promise<InformationContent | null> {
    const result = await db.select().from(informationContent).where(eq(informationContent.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getInformationContentByCategory(category: string): Promise<InformationContent[]> {
    return await db.select()
      .from(informationContent)
      .where(eq(informationContent.category, category));
  }

  // Seller verification methods
  async createSellerVerification(data: any): Promise<any> {
    // Implement as needed for your application
    return { id: 1, ...data };
  }

  async getSellerVerificationsByUserId(userId: number): Promise<any[]> {
    // Implement as needed for your application
    return [];
  }

  async updateSellerVerificationStatus(id: number, status: string, comments?: string): Promise<any> {
    // Implement as needed for your application
    return { id, status, comments };
  }

  // Daswos AI Chat methods
  async createDaswosAiChat(data: any): Promise<DaswosAiChat> {
    const parsedData = insertDaswosAiChatSchema.parse(data);
    const result = await db.insert(daswosAiChats).values(parsedData).returning();
    return result[0];
  }

  async getActiveDaswosAiChat(userId: number): Promise<DaswosAiChat | null> {
    const result = await db.select()
      .from(daswosAiChats)
      .where(and(
        eq(daswosAiChats.userId, userId),
        eq(daswosAiChats.isArchived, false)
      ));

    return result.length > 0 ? result[0] : null;
  }

  async getDaswosAiChatById(chatId: number): Promise<DaswosAiChat | null> {
    const result = await db.select().from(daswosAiChats).where(eq(daswosAiChats.id, chatId));
    return result.length > 0 ? result[0] : null;
  }

  async getDaswosAiChatsByUserId(userId: number): Promise<DaswosAiChat[]> {
    return await db.select()
      .from(daswosAiChats)
      .where(eq(daswosAiChats.userId, userId))
      .orderBy(desc(daswosAiChats.createdAt));
  }

  async createDaswosAiChatMessage(data: any): Promise<DaswosAiChatMessage> {
    const parsedData = insertDaswosAiChatMessageSchema.parse(data);
    const result = await db.insert(daswosAiChatMessages).values(parsedData).returning();
    return result[0];
  }

  async getDaswosAiChatMessages(chatId: number): Promise<DaswosAiChatMessage[]> {
    return await db.select()
      .from(daswosAiChatMessages)
      .where(eq(daswosAiChatMessages.chatId, chatId))
      .orderBy(daswosAiChatMessages.timestamp);
  }

  async getRecentChatMessage(chatId: number): Promise<DaswosAiChatMessage | null> {
    const result = await db.select()
      .from(daswosAiChatMessages)
      .where(eq(daswosAiChatMessages.chatId, chatId))
      .orderBy(desc(daswosAiChatMessages.timestamp))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  // App settings operations
  async getAppSettings(key: string): Promise<any> {
    const result = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key));

    return result.length > 0 ? result[0].value : null;
  }

  async setAppSettings(key: string, value: any): Promise<boolean> {
    try {
      // Check if setting exists
      const existingSetting = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, key));

      if (existingSetting.length > 0) {
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

  // User Session methods
  async createUserSession(sessionData: any): Promise<any> {
    try {
      const result = await db
        .insert(userSessions)
        .values({
          userId: sessionData.userId,
          sessionToken: sessionData.sessionToken,
          deviceInfo: sessionData.deviceInfo || {},
          isActive: true,
          expiresAt: sessionData.expiresAt
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  async getUserSessions(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.createdAt));
  }

  async deactivateSession(sessionToken: string): Promise<boolean> {
    try {
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.sessionToken, sessionToken));
      return true;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  async deactivateAllUserSessions(userId: number): Promise<boolean> {
    try {
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.userId, userId));
      return true;
    } catch (error) {
      console.error('Error deactivating all user sessions:', error);
      return false;
    }
  }
}