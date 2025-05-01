import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script reads the migration SQL file and saves it to a file
 * that can be run manually in the Neon database console
 */
async function main() {
  try {
    // Read the migration SQL file
    const migrationFilePath = path.join(__dirname, '..', 'migrations', '0000_tidy_white_tiger.sql');
    
    if (!fs.existsSync(migrationFilePath)) {
      console.error(`Migration file not found: ${migrationFilePath}`);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Save the SQL to a file
    const outputFilePath = path.join(__dirname, 'schema.sql');
    fs.writeFileSync(outputFilePath, migrationSQL);
    
    console.log(`Schema SQL saved to: ${outputFilePath}`);
    console.log('You can now run this SQL in the Neon database console.');
  } catch (error) {
    console.error('Error generating schema SQL:', error.message);
    process.exit(1);
  }
}

main();
