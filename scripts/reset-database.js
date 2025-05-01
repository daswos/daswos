import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script resets the database by:
 * 1. Dropping all tables
 * 2. Recreating the schema from the migration file
 */
async function main() {
  console.log('Starting database reset...');
  
  try {
    // Read the migration SQL file
    const migrationFilePath = path.join(__dirname, '..', 'migrations', '0000_tidy_white_tiger.sql');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Create a temporary SQL file that drops all tables first
    const resetSQLPath = path.join(__dirname, 'reset-database.sql');
    const resetSQL = `
-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS "user_dasbar_preferences" CASCADE;
DROP TABLE IF EXISTS "user_sessions" CASCADE;
DROP TABLE IF EXISTS "family_invitation_codes" CASCADE;
DROP TABLE IF EXISTS "category_closure" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "ai_shopper_recommendations" CASCADE;
DROP TABLE IF EXISTS "app_settings" CASCADE;
DROP TABLE IF EXISTS "bulk_buy_requests" CASCADE;
DROP TABLE IF EXISTS "cart_items" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "collaborative_collaborators" CASCADE;
DROP TABLE IF EXISTS "collaborative_resources" CASCADE;
DROP TABLE IF EXISTS "collaborative_searches" CASCADE;
DROP TABLE IF EXISTS "daswos_coins_transactions" CASCADE;
DROP TABLE IF EXISTS "daswos_ai_chat_messages" CASCADE;
DROP TABLE IF EXISTS "daswos_ai_chats" CASCADE;
DROP TABLE IF EXISTS "daswos_ai_sources" CASCADE;
DROP TABLE IF EXISTS "information_content" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "resource_permission_requests" CASCADE;
DROP TABLE IF EXISTS "search_queries" CASCADE;
DROP TABLE IF EXISTS "seller_verifications" CASCADE;
DROP TABLE IF EXISTS "sellers" CASCADE;
DROP TABLE IF EXISTS "split_buy_participants" CASCADE;
DROP TABLE IF EXISTS "split_buys" CASCADE;
DROP TABLE IF EXISTS "user_payment_methods" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Now recreate all tables
${migrationSQL}
`;
    
    fs.writeFileSync(resetSQLPath, resetSQL);
    console.log('Created reset SQL file');
    
    // Now run the setup-test-database.js script to populate the database with test data
    console.log('Running setup-test-database.js script...');
    execSync('node scripts/setup-test-database.cjs', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/daswos'
      }
    });
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error.message);
    process.exit(1);
  }
}

main();
