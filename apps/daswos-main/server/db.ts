import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { log } from "./vite";

// Configure database connection using Fly.io PostgreSQL URL
const connectionString = process.env.DATABASE_URL || "postgres://postgres:QqA7lBPZ67Z3gvP@daswos-db.flycast:5432";
log(`Using database connection: ${connectionString ? 'PostgreSQL via Fly.io' : 'No database connection string found'}`);

// Initialize the database connection with proper options for Fly.io Postgres
export const queryClient = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production',  // Only use SSL in production
  max: 10,                          // Connection pool max size
  idle_timeout: 20,                 // How long a connection can be idle before being closed
  connect_timeout: 10,              // How long to wait for a connection
  prepare: false,                   // Don't use prepared statements
});

// Create Drizzle ORM instance with the schema
export const db = drizzle(queryClient, { schema });