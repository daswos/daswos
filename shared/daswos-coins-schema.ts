import { pgTable, serial, integer, decimal, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Total supply table
export const daswosCoinsSupply = pgTable("daswos_coins_total_supply", {
  id: serial("id").primaryKey(),
  totalAmount: decimal("total_amount", { precision: 20, scale: 0 }).notNull(),
  mintedAmount: decimal("minted_amount", { precision: 20, scale: 0 }).default("0"),
  creationDate: timestamp("creation_date").defaultNow()
});

// Wallets table
export const daswosWallets = pgTable("daswos_wallets", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  balance: decimal("balance", { precision: 20, scale: 0 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Transaction types enum
export const TransactionType = {
  PURCHASE: 'purchase',
  GIVEAWAY: 'giveaway',
  TRANSFER: 'transfer'
} as const;

// Transactions table
export const daswosTransactions = pgTable("daswos_transactions", {
  transactionId: serial("transaction_id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 20, scale: 0 }).notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  referenceId: varchar("reference_id", { length: 255 }),
  description: text("description")
}, (table) => {
  return {
    fromUserIdx: index("idx_from_user").on(table.fromUserId),
    toUserIdx: index("idx_to_user").on(table.toUserId),
    timestampIdx: index("idx_timestamp").on(table.timestamp)
  };
});

// Zod schemas for validation
export const insertDaswosCoinsSupplySchema = createInsertSchema(daswosCoinsSupply);
export const insertDaswosWalletSchema = createInsertSchema(daswosWallets);
export const insertDaswosTransactionSchema = createInsertSchema(daswosTransactions, {
  transactionType: z.enum([
    TransactionType.PURCHASE,
    TransactionType.GIVEAWAY,
    TransactionType.TRANSFER
  ])
});

// Types for TypeScript
export type DaswosCoinsSupply = typeof daswosCoinsSupply.$inferSelect;
export type InsertDaswosCoinsSupply = typeof daswosCoinsSupply.$inferInsert;

export type DaswosWallet = typeof daswosWallets.$inferSelect;
export type InsertDaswosWallet = typeof daswosWallets.$inferInsert;

export type DaswosTransaction = typeof daswosTransactions.$inferSelect;
export type InsertDaswosTransaction = typeof daswosTransactions.$inferInsert;
