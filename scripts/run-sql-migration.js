import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a hardcoded connection string for local development
// Replace this with your actual database connection string
const connectionString = 'postgres://postgres:postgres@localhost:5432/daswos';

async function runSqlMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || connectionString,
  });

  try {
    console.log('Connecting to database...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add-family-owner-id-column.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL migration...');
    await pool.query(sqlQuery);
    
    console.log('SQL migration completed successfully');
  } catch (error) {
    console.error('Error running SQL migration:', error);
  } finally {
    await pool.end();
  }
}

runSqlMigration();
