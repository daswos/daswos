import { log } from './vite';
import { db } from './db';

// Maximum number of connection retries
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

// Helper function to wait/sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkPostgresConnection() {
  try {
    // Execute a simple query to check connectivity
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    log(`PostgreSQL connection error: ${error}`, 'error');
    return false;
  }
}

// This function will be called when the server starts up
async function initializeDatabase() {
  try {
    log('Using database connection: PostgreSQL via DATABASE_URL', 'info');
    
    if (!process.env.DATABASE_URL) {
      log('Missing DATABASE_URL environment variable', 'error');
      return false;
    }
    
    // Implement retry mechanism for more resilient connection
    let connected = false;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      if (retries > 0) {
        log(`Retrying PostgreSQL connection (attempt ${retries + 1}/${MAX_RETRIES})...`, 'info');
        await sleep(RETRY_DELAY_MS * retries); // Exponential backoff
      }
      
      connected = await checkPostgresConnection();
      retries++;
      
      if (connected) {
        log(`Successfully connected to PostgreSQL database on attempt ${retries}`, 'info');
        return true;
      }
    }
    
    if (!connected) {
      log(`Failed to connect to PostgreSQL after ${MAX_RETRIES} attempts.`, 'error');
      log('Possible reasons:', 'error');
      log('1. The DATABASE_URL may be incorrect', 'error');
      log('2. The database may not exist or has no tables yet', 'error');
      
      // In production, we should not proceed without a database connection
      if (process.env.NODE_ENV === 'production') {
        log('Running in production mode - database connection is required', 'error');
        throw new Error('Failed to connect to database in production environment. Application cannot start.');
      } else {
        log('Development mode - continuing with fallback memory storage...', 'warning');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log(`Unexpected error initializing database: ${error}`, 'error');
    if (error instanceof Error) {
      log(`Error stack: ${error.stack}`, 'error');
    }
    return false;
  }
}

export { initializeDatabase };