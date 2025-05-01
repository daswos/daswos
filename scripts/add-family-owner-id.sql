-- Add family_owner_id column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS family_owner_id INTEGER;
