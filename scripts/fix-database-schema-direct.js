// This script uses the application's database connection to add the missing column
// It doesn't require direct access to PostgreSQL

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function fixDatabaseSchema() {
  try {
    console.log('Checking if family_owner_id column exists...');
    
    // First check if the column exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'family_owner_id'
    `;
    
    const result = await db.execute(checkColumnQuery);
    
    if (result.length === 0) {
      console.log('family_owner_id column does not exist, adding it...');
      
      // Add the missing column
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN family_owner_id INTEGER
      `);
      
      console.log('family_owner_id column added successfully!');
    } else {
      console.log('family_owner_id column already exists.');
    }
    
    console.log('Database schema fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database schema:', error);
    process.exit(1);
  }
}

fixDatabaseSchema();
