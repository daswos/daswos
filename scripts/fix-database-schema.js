import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * This script generates a migration file to fix the database schema
 * and then applies it to the database.
 */
async function main() {
  console.log('Starting database schema fix...');
  
  try {
    // Create a temporary .env file with the database connection string if it doesn't exist
    if (!process.env.DATABASE_URL) {
      console.log('Creating temporary .env file with database connection string...');
      fs.writeFileSync('.env', 'DATABASE_URL=postgres://postgres:postgres@localhost:5432/daswos\n');
      console.log('Temporary .env file created.');
    }
    
    // Generate a migration file
    console.log('Generating migration file...');
    execSync('npx drizzle-kit generate', { stdio: 'inherit' });
    
    // Apply the migration
    console.log('Applying migration...');
    execSync('npx drizzle-kit push', { stdio: 'inherit' });
    
    console.log('Database schema fix completed successfully.');
  } catch (error) {
    console.error('Error fixing database schema:', error.message);
    process.exit(1);
  }
}

main();
