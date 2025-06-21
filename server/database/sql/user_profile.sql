CREATE TABLE IF NOT EXISTS user_profile (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    full_name text,
    age text,
    bio text,
    gender text,
    ethnicity text,
    goals text,
    coaching_style text,
    preferred_focus_area text,
    message_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    stripe_customer_id text,
    stripe_session_id text,
    created_at timestamptz NOT NULL DEFAULT now()
);
-- All fields except id, user_id, created_at will be stored encrypted 