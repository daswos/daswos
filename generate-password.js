// Script to generate a hashed password for DasWohnen application
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

// Function to hash a password using the same method as server/auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Generate a hashed password from command line argument or default
async function main() {
  // Get password from command line args or use default
  const password = process.argv[2] || 'AdminPass123';
  const hashedPassword = await hashPassword(password);
  console.log('Password:', password);
  console.log('Hashed password:', hashedPassword);
  console.log('This hash can be used directly in the database.');
}

main().catch(console.error);