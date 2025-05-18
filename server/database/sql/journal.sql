CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
); 