// Script to update the migration file with the current Neon database schema
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

// Load environment variables - try .env first, then fall back to .env.production
const envPath = fs.existsSync(path.join(__dirname, '..', '.env'))
  ? path.join(__dirname, '..', '.env')
  : path.join(__dirname, '..', '.env.production');
console.log(`Using environment file: ${envPath}`);
dotenv.config({ path: envPath });

// Database connection string
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Migration file path
const migrationFilePath = path.join(__dirname, '..', 'migrations', '0000_tidy_white_tiger.sql');

// Connect to the database and update the migration file
async function updateMigration() {
  console.log('Connecting to Neon database...');

  console.log('Using database URL:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    await client.connect();
    console.log('Connected to database. Fetching schema information...');

    // Get all tables
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);

    console.log(`Found ${tables.length} tables in the database.`);

    let migrationContent = '';

    // Process each table
    for (const tableName of tables) {
      console.log(`Processing table: ${tableName}`);

      // Get table structure
      const tableStructureQuery = `
        SELECT column_name, data_type,
               is_nullable, column_default,
               character_maximum_length, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position;
      `;

      const tableStructureResult = await client.query(tableStructureQuery, [tableName]);

      // Start building CREATE TABLE statement
      migrationContent += `CREATE TABLE "${tableName}" (\n`;

      const columns = [];

      for (const column of tableStructureResult.rows) {
        let columnDef = `\t"${column.column_name}" `;

        // Data type
        if (column.data_type === 'ARRAY') {
          // Handle array types
          columnDef += `${column.udt_name.replace(/^_/, '')}[]`;
        } else if (column.data_type === 'USER-DEFINED') {
          // Handle custom types
          columnDef += column.udt_name;
        } else if (column.data_type === 'character varying' && column.character_maximum_length) {
          columnDef += `varchar(${column.character_maximum_length})`;
        } else if (column.data_type === 'integer' && column.column_default && column.column_default.includes('nextval')) {
          columnDef += 'serial';
        } else {
          columnDef += column.data_type;
        }

        // Default value
        if (column.column_default !== null) {
          if (column.column_default.includes('nextval')) {
            // Skip default for serial columns as it's implied
          } else {
            columnDef += ` DEFAULT ${column.column_default}`;
          }
        }

        // Nullable
        if (column.is_nullable === 'NO') {
          columnDef += ' NOT NULL';
        }

        columns.push(columnDef);
      }

      // Get primary key
      const pkQuery = `
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass
        AND i.indisprimary;
      `;

      const pkResult = await client.query(pkQuery, [tableName]);

      if (pkResult.rows.length > 0) {
        if (pkResult.rows.length === 1 && tableStructureResult.rows.some(col =>
            col.column_name === pkResult.rows[0].attname &&
            col.column_default &&
            col.column_default.includes('nextval'))) {
          // For single-column primary keys on serial columns, add PRIMARY KEY to the column definition
          const pkColumn = pkResult.rows[0].attname;
          const columnIndex = columns.findIndex(col => col.includes(`"${pkColumn}"`));
          if (columnIndex !== -1) {
            columns[columnIndex] += ' PRIMARY KEY';
          }
        } else {
          // For composite primary keys or non-serial primary keys
          const pkColumns = pkResult.rows.map(row => `"${row.attname}"`).join(', ');
          if (pkResult.rows.length > 1) {
            columns.push(`\tCONSTRAINT "${tableName}_${pkResult.rows.map(r => r.attname).join('_')}_pk" PRIMARY KEY(${pkColumns})`);
          } else {
            columns.push(`\tPRIMARY KEY (${pkColumns})`);
          }
        }
      }

      // Get unique constraints (simpler approach)
      const uniqueQuery = `
        SELECT tc.constraint_name,
               kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_name = $1
          AND tc.table_schema = 'public'
        ORDER BY tc.constraint_name, kcu.ordinal_position;
      `;

      const uniqueResult = await client.query(uniqueQuery, [tableName]);

      // Group unique constraints by constraint name
      const uniqueConstraints = {};
      for (const row of uniqueResult.rows) {
        if (!uniqueConstraints[row.constraint_name]) {
          uniqueConstraints[row.constraint_name] = [];
        }
        uniqueConstraints[row.constraint_name].push(row.column_name);
      }

      // Add unique constraints
      for (const [constraintName, constraintColumns] of Object.entries(uniqueConstraints)) {
        const uniqueColumns = constraintColumns.map(col => `"${col}"`).join(', ');
        columns.push(`\tCONSTRAINT "${constraintName}" UNIQUE(${uniqueColumns})`);
      }

      migrationContent += columns.join(',\n');
      migrationContent += '\n);\n--> statement-breakpoint\n';
    }

    // Get foreign key constraints
    const fkQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;

    const fkResult = await client.query(fkQuery);

    // Add foreign key constraints
    for (const fk of fkResult.rows) {
      migrationContent += `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "public"."${fk.foreign_table_name}"("${fk.foreign_column_name}") ON DELETE no action ON UPDATE no action;--> statement-breakpoint\n`;
    }

    // Write to migration file
    fs.writeFileSync(migrationFilePath, migrationContent);
    console.log(`Migration file updated successfully at ${migrationFilePath}`);

  } catch (error) {
    console.error('Error updating migration:', error);
  } finally {
    await client.end();
  }
}

updateMigration();
