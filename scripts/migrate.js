import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script performs a database migration without requiring user interaction
 * It checks for changes in schema.ts and runs the migration automatically
 */

async function main() {
  console.log('Starting automatic database migration...');
  
  try {
    // Run Drizzle push with auto-confirm for any changes
    execSync('echo "y" | npx drizzle-kit push', { stdio: 'inherit' });
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error running migration:', error.message);
    process.exit(1);
  }
}

main();