/**
 * Script to migrate the database to support vector search with pgvector
 * This script will ensure the pgvector extension is installed and update the products table
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const { Pool } = pg;
dotenv.config();

async function migrateVectorSearch() {
  // Connect to PostgreSQL using DATABASE_URL from .env
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // 1. Make sure pgvector extension is installed
    console.log('Ensuring pgvector extension is installed...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector extension confirmed');
    
    // 2. Check if the search_vector column exists in the products table
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'search_vector';
    `);
    
    // 3. If the column doesn't exist, add it
    if (checkColumnResult.rows.length === 0) {
      console.log('Adding search_vector column to products table...');
      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS search_vector text;
      `);
      console.log('✅ search_vector column added to products table');
    } else {
      console.log('✅ search_vector column already exists in products table');
    }
    
    // 4. Vector search migration completed
    console.log('✅ Vector search database structure set up successfully');
    console.log('⚠️ IMPORTANT: To complete migration, run "npm run db:push" to update the schema');
    
    console.log('✅ Vector search migration completed successfully');
  } catch (error) {
    console.error('❌ Error during vector search migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateVectorSearch()
  .then(() => {
    console.log('Migration completed successfully!');
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });