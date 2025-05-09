import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { log } from "./vite";

// Configure database connection using the DATABASE_URL provided by Replit
const connectionString = process.env.DATABASE_URL!;
log(`Using database connection: ${connectionString ? 'PostgreSQL via DATABASE_URL' : 'No database connection string found'}`);

// Initialize the database connection with proper options for Neon database
export const queryClient = postgres(connectionString, {
  ssl: true,                         // Required for Neon DB
  max: 10,                          // Connection pool max size
  idle_timeout: 20,                 // How long a connection can be idle before being closed
  connect_timeout: 10,              // How long to wait for a connection
  prepare: false,                   // Don't use prepared statements for Neon compatibility
});

// Create Drizzle ORM instance with the schema
export const db = drizzle(queryClient, { schema });