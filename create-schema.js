import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createSchema() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create the schema
    await client.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('Schema created or already exists');

    // Set the search path
    await client.query('SET search_path TO public');
    console.log('Search path set to public');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

createSchema();
