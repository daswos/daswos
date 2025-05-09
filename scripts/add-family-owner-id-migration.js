import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

/**
 * This script runs a migration to add the missing family_owner_id column to the users table
 */
async function main() {
  console.log('Starting migration to add family_owner_id column...');
  
  try {
    // Run Drizzle push with auto-confirm for any changes
    execSync('echo "y" | npx drizzle-kit push', { stdio: 'inherit' });
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error running migration:', error.message);
    process.exit(1);
  }
}

main();
