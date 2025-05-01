import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script runs a SQL file against the database
// Usage: node run-sql.js <sql-file-path>

async function runSqlFile(sqlFilePath) {
  // Get the database URL from environment or use a default
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/daswos';
  
  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    console.log(`Reading SQL file: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Executing SQL...');
    await client.query(sqlContent);
    
    console.log('SQL executed successfully');
    client.release();
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    await pool.end();
  }
}

// Get the SQL file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a SQL file path');
  process.exit(1);
}

const sqlFilePath = path.resolve(__dirname, args[0]);
runSqlFile(sqlFilePath);
