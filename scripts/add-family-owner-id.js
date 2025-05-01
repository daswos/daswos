import pg from 'pg';
const { Client } = pg;

// Use a hardcoded connection string for local development
const connectionString = 'postgres://postgres:postgres@localhost:5432/daswos';

// Connect to the PostgreSQL database
const client = new Client({
  connectionString: connectionString,
});

/**
 * This script adds the missing family_owner_id column to the users table
 */
async function addFamilyOwnerIdColumn() {
  try {
    console.log('Connecting to database...');
    await client.connect();

    console.log('Adding family_owner_id column to users table...');

    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'family_owner_id'
    `;

    const columnExists = await client.query(checkColumnQuery);

    if (columnExists.rows.length === 0) {
      // Column doesn't exist, add it
      await client.query(`
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
  } finally {
    await client.end();
  }
}

addFamilyOwnerIdColumn();
