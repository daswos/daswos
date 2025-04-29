/**
 * Script to add more products to the database, especially Nike shoes and red items
 * This helps with natural language search testing
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

// Get current file directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function addProducts() {
  try {
    // Initialize Postgres client
    console.log('Connecting to database...');
    const sql = postgres(connectionString);
    
    // Read the SQL file
    console.log('Reading SQL file...');
    const sqlFilePath = path.join(__dirname, 'insert-red-shoes-and-hats.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    console.log('Executing SQL to add Nike shoes and red products...');
    await sql.unsafe(sqlContent);
    
    // Count the products to confirm
    const productCount = await sql`SELECT COUNT(*) FROM products`;
    console.log(`Products in database after insertion: ${productCount[0].count}`);
    
    // Close the connection
    await sql.end();
    console.log('Successfully added products to the database!');
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

// Run the function
addProducts()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });