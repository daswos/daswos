import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, products, categories } from "./schema";

// User Purchase History Schema
export const userPurchaseHistory = pgTable("user_purchase_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(), // In cents
});

export const userPurchaseHistoryRelations = relations(userPurchaseHistory, ({ one }) => ({
  user: one(users, {
    fields: [userPurchaseHistory.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userPurchaseHistory.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [userPurchaseHistory.categoryId],
    references: [categories.id],
  }),
}));

export const insertUserPurchaseHistorySchema = createInsertSchema(userPurchaseHistory).omit({
  id: true,
  purchaseDate: true,
});

export type InsertUserPurchaseHistory = z.infer<typeof insertUserPurchaseHistorySchema>;
export type UserPurchaseHistory = typeof userPurchaseHistory.$inferSelect;

// User Search History Schema
export const userSearchHistory = pgTable("user_search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  searchQuery: text("search_query").notNull(),
  searchDate: timestamp("search_date").defaultNow().notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  clickedProductId: integer("clicked_product_id").references(() => products.id, { onDelete: "set null" }),
});

export const userSearchHistoryRelations = relations(userSearchHistory, ({ one }) => ({
  user: one(users, {
    fields: [userSearchHistory.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [userSearchHistory.categoryId],
    references: [categories.id],
  }),
  clickedProduct: one(products, {
    fields: [userSearchHistory.clickedProductId],
    references: [products.id],
  }),
}));

export const insertUserSearchHistorySchema = createInsertSchema(userSearchHistory).omit({
  id: true,
  searchDate: true,
});

export type InsertUserSearchHistory = z.infer<typeof insertUserSearchHistorySchema>;
export type UserSearchHistory = typeof userSearchHistory.$inferSelect;

// User Product Preferences Schema
export const userProductPreferences = pgTable("user_product_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  preferenceScore: integer("preference_score").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (t) => ({
  uniqueUserCategory: primaryKey(t.userId, t.categoryId),
}));

export const userProductPreferencesRelations = relations(userProductPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userProductPreferences.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [userProductPreferences.categoryId],
    references: [categories.id],
  }),
}));

export const insertUserProductPreferencesSchema = createInsertSchema(userProductPreferences).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUserProductPreferences = z.infer<typeof insertUserProductPreferencesSchema>;
export type UserProductPreferences = typeof userProductPreferences.$inferSelect;
