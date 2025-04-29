/**
 * Script to set up the pgvector extension in PostgreSQL
 * This is required for vector search functionality
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

async function setupPgVector() {
  // Connect to PostgreSQL using DATABASE_URL from .env
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Setting up pgvector extension...');
    
    // Create the pgvector extension if it doesn't exist
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    console.log('✅ pgvector extension set up successfully');
  } catch (error) {
    console.error('❌ Error setting up pgvector extension:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupPgVector()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to set up pgvector extension:', error);
    process.exit(1);
  });