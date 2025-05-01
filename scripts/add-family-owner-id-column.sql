-- Add family_owner_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'family_owner_id'
    ) THEN
        ALTER TABLE users ADD COLUMN family_owner_id INTEGER;
    END IF;
END $$;
