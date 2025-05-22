import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL, { 
    ssl: process.env.NODE_ENV === 'production',
    max: 1 
  });
  
  const db = drizzle(sql);

  try {
    console.log('Starting database migrations...');
    
    // Run migrations from the migrations folder
    await migrate(db, {
      migrationsFolder: join(__dirname, '..', '..', 'migrations'),
    });

    console.log('Migrations completed successfully');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('Error running migrations:', err);
    await sql.end();
    process.exit(1);
  }
}

runMigrations();
