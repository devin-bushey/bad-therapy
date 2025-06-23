CREATE TABLE IF NOT EXISTS user_profile (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    email text,
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
-- All fields except id, user_id, email, created_at, message_count, is_premium, stripe_customer_id, stripe_session_id will be stored encrypted 