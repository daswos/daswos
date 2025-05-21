import { pgTable, text, serial, integer, boolean, varchar, jsonb, timestamp, decimal, real, pgEnum, primaryKey, pgSchema } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { never, z } from "zod";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Import DasWos Coins schema
export * from "./daswos-coins-schema";
import { truncate } from "fs";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isSeller: boolean("is_seller").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  avatar: text("avatar"),
  hasSubscription: boolean("has_subscription").default(false).notNull(),
  subscriptionType: text("subscription_type"), // "limited", "unlimited", or legacy types
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  // Family account fields
  isFamilyOwner: boolean("is_family_owner").default(false).notNull(),
  familyOwnerId: integer("family_owner_id"), // For family member accounts, points to the owner
  parentAccountId: integer("parent_account_id"), // ID of the family owner account (null for family owners and individual accounts)
  isChildAccount: boolean("is_child_account").default(false).notNull(), // Whether this is a child account
  // SuperSafe mode fields
  superSafeMode: boolean("super_safe_mode").default(false).notNull(),
  superSafeSettings: jsonb("super_safe_settings").default({
    blockGambling: true,
    blockAdultContent: true,
    blockOpenSphere: false
  }),
  // SafeSphere mode field
  safeSphereActive: boolean("safe_sphere_active").default(false).notNull(),
  // AI Shopper settings
  aiShopperEnabled: boolean("ai_shopper_enabled").default(false).notNull(),
  aiShopperSettings: jsonb("ai_shopper_settings").default({
    autoPurchase: false,
    autoPaymentEnabled: false,
    confidenceThreshold: 0.85, // Minimum confidence score (0-1) required for auto-purchase
    budgetLimit: 5000, // in cents ($50)
    maxTransactionLimit: 10000, // in cents ($100) - maximum for a single transaction
    preferredCategories: [],
    avoidTags: [],
    minimumTrustScore: 85,
    purchaseMode: "refined", // "refined" or "random"
    maxPricePerItem: 5000, // in cents ($50)

    // DasWos Coins settings
    maxCoinsPerItem: 50,
    maxCoinsPerDay: 100,
    maxCoinsOverall: 1000,

    // Purchase frequency settings
    purchaseFrequency: {
      hourly: 1,
      daily: 5,
      monthly: 50
    },
  }),
  // DasWos Coins balance
  dasWosCoins: integer("daswos_coins").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  parentAccountId: true,
  isChildAccount: true,
  superSafeMode: true,
  superSafeSettings: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"), // Self-reference defined in relations
  level: integer("level").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Category closure table for efficient hierarchical queries
export const categoryClosure = pgTable("category_closure", {
  ancestorId: integer("ancestor_id").notNull().references(() => categories.id),
  descendantId: integer("descendant_id").notNull().references(() => categories.id),
  depth: integer("depth").notNull(),
}, (t) => ({
  pk: primaryKey(t.ancestorId, t.descendantId),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  // createdAt: true, // Removed as it is not assignable
  updatedAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Product Schema (Enhanced with vector search and AI attributes)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // In cents
  imageUrl: text("image_url").notNull(),
  sellerId: integer("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerVerified: boolean("seller_verified").notNull().default(false),
  sellerType: text("seller_type").notNull().default("merchant"), // merchant, personal
  trustScore: integer("trust_score").notNull(),
  tags: text("tags").array().notNull(),
  shipping: text("shipping").notNull(),
  originalPrice: integer("original_price"), // In cents, for discounts
  discount: integer("discount"), // Percentage
  verifiedSince: text("verified_since"),
  warning: text("warning"),
  isBulkBuy: boolean("is_bulk_buy").default(false).notNull(), // Whether this product is available for bulk purchase
  bulkMinimumQuantity: integer("bulk_minimum_quantity"), // Minimum quantity for bulk discount
  bulkDiscountRate: integer("bulk_discount_rate"), // Special discount rate for bulk purchases
  imageDescription: text("image_description"), // AI-generated description of the product image

  // New AI-specific fields
  categoryId: integer("category_id").references(() => categories.id),
  aiAttributes: jsonb("ai_attributes").default('{}'),
  // Vector search field for semantic search (handled via SQL directly)
  // We'll implement vector search through direct SQL commands rather than through the ORM
  searchVector: text("search_vector"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Relations
export const productsRelations = relations(products, ({ one }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products)
}));

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  searchVector: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Search Query Schema
export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sphere: text("sphere").notNull(), // safesphere, opensphere
  contentType: text("content_type").notNull().default("products"), // products, information
  filters: jsonb("filters"),
  userId: integer("user_id"),
  // SuperSafe mode fields
  superSafeEnabled: boolean("super_safe_enabled").default(false),
  superSafeSettings: jsonb("super_safe_settings"),
});

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
});

export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;

// Seller Verification Schema
// Sellers Table - New table for detailed seller information
export const sellers = pgTable("sellers", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().unique(),
  business_name: text("business_name").notNull(),
  business_type: text("business_type").notNull(), // "individual", "business", "corporation", etc.
  verification_status: text("verification_status").notNull().default("pending"), // "pending", "approved", "rejected"
  business_address: text("business_address").notNull(),
  contact_phone: text("contact_phone").notNull(),
  tax_id: text("tax_id"),
  website: text("website"),
  year_established: integer("year_established"),
  description: text("description"),
  profile_image_url: text("profile_image_url"),
  document_urls: text("document_urls").array(),
  trust_score: integer("trust_score").default(50).notNull(), // Trust score from 0-100
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
});

export const sellersRelations = relations(sellers, ({ one }) => ({
  user: one(users, {
    fields: [sellers.user_id],
    references: [users.id],
  }),
}));

export const insertSellerSchema = createInsertSchema(sellers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type Seller = typeof sellers.$inferSelect;

export const sellerVerifications = pgTable("seller_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "basic", "priority", "personal"
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  depositAmount: integer("deposit_amount"), // In cents
  comments: text("comments"),
  documentUrls: text("document_urls").array(),
});

export const sellerVerificationsRelations = relations(sellerVerifications, ({ one }) => ({
  user: one(users, {
    fields: [sellerVerifications.userId],
    references: [users.id],
  }),
}));

export const insertSellerVerificationSchema = createInsertSchema(sellerVerifications).omit({
  id: true,
  submittedAt: true,
  processedAt: true,
  status: true,
});

export type InsertSellerVerification = z.infer<typeof insertSellerVerificationSchema>;
export type SellerVerification = typeof sellerVerifications.$inferSelect;

// Bulk Buy Agent Request Schema
export const bulkBuyRequests = pgTable("bulk_buy_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id"),
  requestType: text("request_type").notNull(), // "basic", "premium", "enterprise", "custom"
  quantity: integer("quantity"),
  maxBudget: integer("max_budget"), // In cents
  specialRequirements: text("special_requirements"),
  preferredDeliveryDate: timestamp("preferred_delivery_date"),
  status: text("status").notNull().default("new"), // "new", "assigned", "in_progress", "completed", "cancelled"
  assignedAgentId: integer("assigned_agent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const bulkBuyRequestsRelations = relations(bulkBuyRequests, ({ one }) => ({
  user: one(users, {
    fields: [bulkBuyRequests.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [bulkBuyRequests.productId],
    references: [products.id],
  }),
}));

export const insertBulkBuyRequestSchema = createInsertSchema(bulkBuyRequests).omit({
  id: true,
  assignedAgentId: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertBulkBuyRequest = z.infer<typeof insertBulkBuyRequestSchema>;
export type BulkBuyRequest = typeof bulkBuyRequests.$inferSelect;

// AI Shopper Recommendations Schema
export const aiShopperRecommendations = pgTable("ai_shopper_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "added_to_cart", "purchased", "rejected"
  confidence: integer("confidence").notNull(), // 0-100 score
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  purchasedAt: timestamp("purchased_at"),
  rejectedReason: text("rejected_reason"),
});

export const aiShopperRecommendationsRelations = relations(aiShopperRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [aiShopperRecommendations.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [aiShopperRecommendations.productId],
    references: [products.id],
  }),
}));

export const insertAiShopperRecommendationSchema = createInsertSchema(aiShopperRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  purchasedAt: true,
  status: true,
});

export type InsertAiShopperRecommendation = z.infer<typeof insertAiShopperRecommendationSchema>;
export type AiShopperRecommendation = typeof aiShopperRecommendations.$inferSelect;

// Extended type for AI Shopper Recommendation with product details included
export interface AiShopperRecommendationWithProduct extends AiShopperRecommendation {
  product?: Product;
}

// User Payment Methods Schema
export const userPaymentMethods = pgTable("user_payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull(),
  last4: text("last4").notNull(),
  cardType: text("card_type").notNull(),
  expiryMonth: integer("expiry_month").notNull(),
  expiryYear: integer("expiry_year").notNull(),
  isDefault: boolean("is_default").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPaymentMethodsRelations = relations(userPaymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [userPaymentMethods.userId],
    references: [users.id],
  }),
}));

export const insertUserPaymentMethodSchema = createInsertSchema(userPaymentMethods).omit({
  id: true,
  createdAt: true,
});

export type InsertUserPaymentMethod = z.infer<typeof insertUserPaymentMethodSchema>;
export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;

// App Settings Schema (for developer controls)
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettings = typeof appSettings.$inferSelect;

// User Dasbar Preferences Schema
export const userDasbarPreferences = pgTable("user_dasbar_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  items: jsonb("items").notNull(), // Array of navigation items
  maxVisibleItems: integer("max_visible_items").notNull().default(4),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const userDasbarPreferencesRelations = relations(userDasbarPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userDasbarPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserDasbarPreferencesSchema = createInsertSchema(userDasbarPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserDasbarPreferences = z.infer<typeof insertUserDasbarPreferencesSchema>;
export type UserDasbarPreferences = typeof userDasbarPreferences.$inferSelect;

// Information Content Schema
export const informationContent = pgTable("information_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  sourceVerified: boolean("source_verified").notNull().default(false),
  sourceType: text("source_type").notNull().default("website"), // website, academic, government, news, etc.
  trustScore: integer("trust_score").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  imageUrl: text("image_url"),
  verifiedSince: text("verified_since"),
  warning: text("warning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertInformationContentSchema = createInsertSchema(informationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInformationContent = z.infer<typeof insertInformationContentSchema>;
export type InformationContent = typeof informationContent.$inferSelect;

// Collaborative Search Schema
export const collaborativeSearches = pgTable("collaborative_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  topic: text("topic").notNull(),
  tags: text("tags").array().notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  status: text("status").notNull().default("active"), // "active", "completed", "archived"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const collaborativeSearchesRelations = relations(collaborativeSearches, ({ one, many }) => ({
  user: one(users, {
    fields: [collaborativeSearches.userId],
    references: [users.id],
  }),
}));

export const insertCollaborativeSearchSchema = createInsertSchema(collaborativeSearches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertCollaborativeSearch = z.infer<typeof insertCollaborativeSearchSchema>;
export type CollaborativeSearch = typeof collaborativeSearches.$inferSelect;

// Collaborative Resources Schema - Findings added to a collaborative search
export const collaborativeResources = pgTable("collaborative_resources", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  sourceType: text("source_type").notNull().default("website"), // website, academic, document, note, ai-generated
  isPublic: boolean("is_public").default(true).notNull(),
  requiresPermission: boolean("requires_permission").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const collaborativeResourcesRelations = relations(collaborativeResources, ({ one }) => ({
  search: one(collaborativeSearches, {
    fields: [collaborativeResources.searchId],
    references: [collaborativeSearches.id],
  }),
  user: one(users, {
    fields: [collaborativeResources.userId],
    references: [users.id],
  }),
}));

export const insertCollaborativeResourceSchema = createInsertSchema(collaborativeResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCollaborativeResource = z.infer<typeof insertCollaborativeResourceSchema>;
export type CollaborativeResource = typeof collaborativeResources.$inferSelect;

// Collaborative Collaborators Schema - Users collaborating on a search
export const collaborativeCollaborators = pgTable("collaborative_collaborators", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("collaborator"), // "owner", "collaborator", "viewer"
  status: text("status").notNull().default("active"), // "active", "invited", "removed"
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const collaborativeCollaboratorsRelations = relations(collaborativeCollaborators, ({ one }) => ({
  search: one(collaborativeSearches, {
    fields: [collaborativeCollaborators.searchId],
    references: [collaborativeSearches.id],
  }),
  user: one(users, {
    fields: [collaborativeCollaborators.userId],
    references: [users.id],
  }),
}));

export const insertCollaborativeCollaboratorSchema = createInsertSchema(collaborativeCollaborators).omit({
  id: true,
  joinedAt: true,
});

export type InsertCollaborativeCollaborator = z.infer<typeof insertCollaborativeCollaboratorSchema>;
export type CollaborativeCollaborator = typeof collaborativeCollaborators.$inferSelect;

// Shopping Cart Items Schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  source: text("source").notNull().default("manual"), // "manual", "ai_shopper", "saved_for_later"
  recommendationId: integer("recommendation_id"), // Link to AI recommendation if applicable
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  recommendation: one(aiShopperRecommendations, {
    fields: [cartItems.recommendationId],
    references: [aiShopperRecommendations.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Extended type for Cart Item with product details included
export interface CartItemWithProduct extends CartItem {
  product?: Product;
}

// Resource Permission Requests Schema
export const resourcePermissionRequests = pgTable("resource_permission_requests", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  requesterId: integer("requester_id").notNull(), // User requesting permission
  message: text("message"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const resourcePermissionRequestsRelations = relations(resourcePermissionRequests, ({ one }) => ({
  resource: one(collaborativeResources, {
    fields: [resourcePermissionRequests.resourceId],
    references: [collaborativeResources.id],
  }),
  requester: one(users, {
    fields: [resourcePermissionRequests.requesterId],
    references: [users.id],
  }),
}));

export const insertResourcePermissionRequestSchema = createInsertSchema(resourcePermissionRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertResourcePermissionRequest = z.infer<typeof insertResourcePermissionRequestSchema>;
export type ResourcePermissionRequest = typeof resourcePermissionRequests.$inferSelect;

// DasWos Coins Transactions Schema

// Split Buys Table - Managing bulk purchase splits
export const splitBuys = pgTable("split_buys", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  initiatorUserId: integer("initiator_user_id").notNull(),
  targetQuantity: integer("target_quantity").notNull(),
  currentQuantity: integer("current_quantity").notNull().default(0),
  pricePerUnit: integer("price_per_unit").notNull(), // In cents
  status: text("status").notNull().default("active"), // "active", "pending_payment", "completed", "failed", "cancelled"
  expiresAt: timestamp("expires_at"),
  description: text("description"),
  minParticipants: integer("min_participants").default(2),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Split Buy Participants Table - Users participating in a split buy
export const splitBuyParticipants = pgTable("split_buy_participants", {
  id: serial("id").primaryKey(),
  splitBuyId: integer("split_buy_id").notNull(),
  userId: integer("user_id").notNull(),
  quantityCommitted: integer("quantity_committed").notNull().default(1),
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "refunded"
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Orders Schema - Header information for purchases
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  totalAmount: integer("total_amount").notNull(), // In cents
  status: text("status").notNull().default("pending"), // "pending", "processing", "shipped", "delivered", "cancelled"
  shippingAddress: text("shipping_address").notNull(),
  billingAddress: text("billing_address").notNull(),
  paymentMethod: text("payment_method").notNull(), // "credit_card", "paypal", "daswos_coins"
  paymentReference: text("payment_reference"), // External payment reference if applicable
  notes: text("notes"),
  updatedAt: timestamp("updated_at"),
});

// Order Items Schema - Line items for each order
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  priceAtPurchase: integer("price_at_purchase").notNull(), // In cents, store price at time of purchase
  itemNameSnapshot: text("item_name_snapshot").notNull(), // Store item name at time of purchase
  splitBuyId: integer("split_buy_id"), // Reference to split buy if this order is part of a split buy
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  splitBuy: one(splitBuys, {
    fields: [orderItems.splitBuyId],
    references: [splitBuys.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
  updatedAt: true,
  status: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export const dasWosCoinsTransactions = pgTable("daswos_coins_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // Can be positive (purchase) or negative (spend)
  type: text("type").notNull(), // "purchase", "spend", "refund", "bonus"
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"), // "pending", "completed", "failed", "cancelled"
  metadata: jsonb("metadata").default({}), // Additional data like product ID, order ID, etc.
  relatedOrderId: integer("related_order_id"), // Link to order if applicable
  relatedSplitBuyId: integer("related_split_buy_id"), // Link to split buy if applicable
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const dasWosCoinsTransactionsRelations = relations(dasWosCoinsTransactions, ({ one }) => ({
  user: one(users, {
    fields: [dasWosCoinsTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [dasWosCoinsTransactions.relatedOrderId],
    references: [orders.id],
  }),
  splitBuy: one(splitBuys, {
    fields: [dasWosCoinsTransactions.relatedSplitBuyId],
    references: [splitBuys.id],
  }),
}));

export const insertDasWosCoinsTransactionSchema = createInsertSchema(dasWosCoinsTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  status: true,
});

export type InsertDasWosCoinsTransaction = z.infer<typeof insertDasWosCoinsTransactionSchema>;
export type DasWosCoinsTransaction = typeof dasWosCoinsTransactions.$inferSelect;

// Add relations after all tables are defined to avoid circular references
export const splitBuysRelations = relations(splitBuys, ({ one, many }) => ({
  product: one(products, {
    fields: [splitBuys.productId],
    references: [products.id],
  }),
  initiator: one(users, {
    fields: [splitBuys.initiatorUserId],
    references: [users.id],
  }),
  participants: many(splitBuyParticipants),
}));

export const splitBuyParticipantsRelations = relations(splitBuyParticipants, ({ one }) => ({
  splitBuy: one(splitBuys, {
    fields: [splitBuyParticipants.splitBuyId],
    references: [splitBuys.id],
  }),
  user: one(users, {
    fields: [splitBuyParticipants.userId],
    references: [users.id],
  }),
}));

// Schema definitions for insert operations
export const insertSplitBuySchema = createInsertSchema(splitBuys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentQuantity: true,
  status: true,
});

export const insertSplitBuyParticipantSchema = createInsertSchema(splitBuyParticipants).omit({
  id: true,
  joinedAt: true,
  updatedAt: true,
  paymentStatus: true,
});

// Export types for the schemas
export type InsertSplitBuy = z.infer<typeof insertSplitBuySchema>;
export type SplitBuy = typeof splitBuys.$inferSelect;
export type InsertSplitBuyParticipant = z.infer<typeof insertSplitBuyParticipantSchema>;
export type SplitBuyParticipant = typeof splitBuyParticipants.$inferSelect;

// Daswos AI Chat Schema
export const daswosAiChats = pgTable("daswos_ai_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // null for guest sessions
  title: text("title").notNull().default("New Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
});

export const daswosAiChatsRelations = relations(daswosAiChats, ({ one, many }) => ({
  user: one(users, {
    fields: [daswosAiChats.userId],
    references: [users.id],
  }),
  messages: many(daswosAiChatMessages),
}));

export const insertDaswosAiChatSchema = createInsertSchema(daswosAiChats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Daswos AI Chat Messages Schema
export const daswosAiChatMessages = pgTable("daswos_ai_chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  role: text("role").notNull(), // "user", "assistant", "system"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata").default({}), // For storing additional information like referenced products, info sources, etc.
});

export const daswosAiChatMessagesRelations = relations(daswosAiChatMessages, ({ one }) => ({
  chat: one(daswosAiChats, {
    fields: [daswosAiChatMessages.chatId],
    references: [daswosAiChats.id],
  }),
}));

export const insertDaswosAiChatMessageSchema = createInsertSchema(daswosAiChatMessages).omit({
  id: true,
});

// Daswos AI Sources Schema - to keep track of information sources used in chat responses
export const daswosAiSources = pgTable("daswos_ai_sources", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  sourceType: text("source_type").notNull(), // "product", "information", "web", "huggingface", "anthropic", "openai"
  sourceId: integer("source_id"), // ID of the source (e.g., product ID, information content ID)
  sourceUrl: text("source_url"), // URL of the source if external
  sourceName: text("source_name").notNull(), // Name/title of the source
  relevanceScore: integer("relevance_score").default(0).notNull(), // 0-100 score of how relevant this source is
  excerpt: text("excerpt"), // Text excerpt from the source
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const daswosAiSourcesRelations = relations(daswosAiSources, ({ one }) => ({
  message: one(daswosAiChatMessages, {
    fields: [daswosAiSources.messageId],
    references: [daswosAiChatMessages.id],
  }),
}));

export const insertDaswosAiSourceSchema = createInsertSchema(daswosAiSources).omit({
  id: true,
  createdAt: true,
});

export type InsertDaswosAiChat = z.infer<typeof insertDaswosAiChatSchema>;
export type DaswosAiChat = typeof daswosAiChats.$inferSelect;
export type InsertDaswosAiChatMessage = z.infer<typeof insertDaswosAiChatMessageSchema>;
export type DaswosAiChatMessage = typeof daswosAiChatMessages.$inferSelect;
export type InsertDaswosAiSource = z.infer<typeof insertDaswosAiSourceSchema>;
export type DaswosAiSource = typeof daswosAiSources.$inferSelect;

// User Sessions Schema
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  deviceInfo: jsonb("device_info").default({}),
  isActive: boolean("is_active").default(true).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export type UserSession = typeof userSessions.$inferSelect;

// Family Invitation Codes Schema - for family account invitations
export const familyInvitationCodes = pgTable("family_invitation_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  ownerUserId: integer("owner_user_id").notNull().references(() => users.id),
  email: text("email"), // Optional email to send invitation to
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedByUserId: integer("used_by_user_id").references(() => users.id),
});

export const familyInvitationCodesRelations = relations(familyInvitationCodes, ({ one }) => ({
  owner: one(users, {
    fields: [familyInvitationCodes.ownerUserId],
    references: [users.id],
  }),
  usedBy: one(users, {
    fields: [familyInvitationCodes.usedByUserId],
    references: [users.id],
  }),
}));

export type FamilyInvitationCode = typeof familyInvitationCodes.$inferSelect;
export const insertFamilyInvitationCodeSchema = createInsertSchema(familyInvitationCodes).omit({
  createdAt: true,
  isUsed: true,
  usedByUserId: true,
});
export type InsertFamilyInvitationCode = z.infer<typeof insertFamilyInvitationCodeSchema>;

// Adding the missing category relations at the end to avoid circular references
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  children: many(categories, { relationName: "parentChild" }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentChild"
  }),
  products: many(products)
}));

// Add missing relation for product to category
export const productsCategoryRelation = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));







