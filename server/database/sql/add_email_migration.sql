-- Migration to add email column to user_profile table
-- Run this script against your Supabase database to add the email field

ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS email text;

-- Optional: Add an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);