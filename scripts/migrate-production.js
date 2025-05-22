#!/usr/bin/env node

/**
 * Script to migrate the schema to the production database
 * This script uses the .env.production file to connect to the production database
 * and applies the migrations/0000_tidy_white_tiger.sql schema
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.production') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL not found in .env.production');
  process.exit(1);
}

// Path to the migration file
const migrationFilePath = path.join(__dirname, '..', 'migrations', '0000_tidy_white_tiger.sql');

if (!fs.existsSync(migrationFilePath)) {
  console.error(`Error: Migration file not found at ${migrationFilePath}`);
  process.exit(1);
}

console.log('Starting migration to production database...');
console.log(`Using migration file: ${migrationFilePath}`);

// Read the migration SQL
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Split the SQL into individual statements
const statements = migrationSQL.split('--> statement-breakpoint');

// Create a new PostgreSQL client
const client = new pg.Client({
  connectionString: DATABASE_URL,
});

async function runMigration() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if tables already exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${existingTables.length} existing tables`);

    // Begin a transaction
    await client.query('BEGIN');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          // Skip CREATE TABLE statements for tables that already exist
          if (statement.toUpperCase().includes('CREATE TABLE') &&
              existingTables.some(table => statement.includes(`"${table}"`))) {
            console.log(`Skipping statement ${i + 1}/${statements.length} (table already exists)`);
            continue;
          }

          await client.query(statement);
          console.log(`Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // If the error is about a relation already existing, we can continue
          if (error.message.includes('already exists')) {
            console.log(`Statement ${i + 1}/${statements.length} skipped: ${error.message}`);
            continue;
          }

          console.error(`Error executing statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close the client
    await client.end();
  }
}

runMigration();
