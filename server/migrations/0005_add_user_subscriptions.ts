import { sql } from "drizzle-orm";
import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export async function up(db) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      subscription_type TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      canceled_at TIMESTAMP,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
  `);
}

export async function down(db) {
  await db.execute(sql`
    DROP TABLE IF EXISTS user_subscriptions;
  `);
}
