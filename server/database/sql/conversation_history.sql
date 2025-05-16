create table conversation_history (
    id uuid default gen_random_uuid() primary key,
    session_id text not null,
    user_id text not null,
    prompt text not null,
    response text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


create table sessions (
    id uuid default gen_random_uuid() primary key,
    user_id text not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at DESC);
