create table conversation_history (
    id uuid default gen_random_uuid() primary key,
    prompt text not null,
    response text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on user_id for faster queries
create index conversation_history_user_id_idx on conversation_history(user_id);

-- Enable Row Level Security (RLS)
alter table conversation_history enable row level security;

-- Create a policy that allows users to only see their own conversations
create policy "Users can view their own conversations"
    on conversation_history
    for select
    using (auth.uid()::text = user_id);

-- Create a policy that allows users to insert their own conversations
create policy "Users can insert their own conversations"
    on conversation_history
    for insert
    with check (auth.uid()::text = user_id); 