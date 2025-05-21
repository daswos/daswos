import { db } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL file
const sqlPath = path.join(__dirname, '..', 'migrations', '20240101000000_create_daswos_coins_tables.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function runMigration() {
  console.log('Running DasWos Coins migration...');
  
  try {
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await db.execute(statement + ';');
    }
    
    console.log('DasWos Coins migration completed successfully!');
  } catch (error) {
    console.error('Error running DasWos Coins migration:', error);
  }
}

// Run the migration
runMigration().then(() => {
  console.log('Migration script completed.');
  process.exit(0);
}).catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});
