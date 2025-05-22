// Script to push the definitive schema to a production database
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
const { Client } = pg;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - use .env.production for production
const envPath = path.join(__dirname, '..', '.env.production');
console.log(`Using environment file: ${envPath}`);
dotenv.config({ path: envPath });

// Database connection string
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL environment variable is required in .env.production');
  process.exit(1);
}

// Migration file path
const migrationFilePath = path.join(__dirname, '..', 'migrations', '0000_tidy_white_tiger.sql');

// Connect to the database and push the schema
async function pushToProduction() {
  console.log('Connecting to production database...');
  
  console.log('Using database URL:', dbUrl.replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    await client.connect();
    console.log('Connected to production database.');

    // Read the migration file
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL.split('--> statement-breakpoint');
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
        } catch (error) {
          // Log the error but continue with other statements
          console.error(`Error executing statement ${i + 1}: ${error.message}`);
          console.error('Statement:', statement);
        }
      }
    }
    
    console.log('Schema push completed.');
    
  } catch (error) {
    console.error('Error pushing schema to production:', error);
  } finally {
    await client.end();
  }
}

// Ask for confirmation before proceeding
console.log('\n⚠️  WARNING: This script will apply the schema to the production database.');
console.log('⚠️  This operation may cause data loss if not used carefully.');
console.log('⚠️  Make sure you have a backup of your production database before proceeding.\n');

// Check if --force flag is provided
const forceFlag = process.argv.includes('--force');

if (forceFlag) {
  console.log('Force flag detected. Proceeding without confirmation...');
  pushToProduction();
} else {
  console.log('To proceed, run this script with the --force flag:');
  console.log('npm run db:push-production -- --force');
}
