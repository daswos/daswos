import { pgTable, serial, integer, text, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { users, products, orders, orderItems } from "./schema";

// Pending Payouts Schema - For tracking payments to sellers that couldn't be processed automatically
export const pendingPayouts = pgTable("pending_payouts", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  orderId: integer("order_id").notNull(),
  amount: integer("amount").notNull(), // In cents
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  paymentMethod: text("payment_method").default("bank_transfer"), // "bank_transfer", "check", "paypal", etc.
  paymentReference: text("payment_reference"), // Reference number for the payment
  notes: text("notes"),
  metadata: json("metadata"), // Additional data about the payout
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Relations for pending payouts
export const pendingPayoutsRelations = relations(pendingPayouts, ({ one }) => ({
  seller: one(users, {
    fields: [pendingPayouts.sellerId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [pendingPayouts.orderId],
    references: [orders.id],
  }),
}));

// Extended Order Schema - Additional fields for checkout
export type InsertOrder = {
  userId: number | null;
  totalAmount: number;
  status?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
  transferGroup?: string;
  shippingInfo?: any;
  metadata?: any;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    sellerId: number | null;
  }>;
};

export type Order = {
  id: number;
  userId: number | null;
  orderDate: Date;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentIntentId?: string;
  transferGroup?: string;
  shippingInfo?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
};

export type InsertPendingPayout = {
  sellerId: number;
  orderId: number;
  amount: number;
  status?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  metadata?: any;
};

export type PendingPayout = {
  id: number;
  sellerId: number;
  orderId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  metadata?: any;
  createdAt: Date;
  processedAt?: Date;
};

// Insert schemas for validation
export const insertPendingPayoutSchema = createInsertSchema(pendingPayouts).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});
