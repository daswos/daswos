import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

/**
 * This script directly adds the family_owner_id column to the users table
 * using the existing database connection from the server
 */
async function addFamilyOwnerIdColumn() {
  try {
    console.log('Adding family_owner_id column to users table...');
    
    // Check if the column already exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'family_owner_id'
    `;
    
    const columnExists = await db.execute(checkColumnQuery);
    
    if (columnExists.length === 0) {
      // Column doesn't exist, add it
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN family_owner_id INTEGER
      `);
      console.log('family_owner_id column added successfully');
    } else {
      console.log('family_owner_id column already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

addFamilyOwnerIdColumn()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
