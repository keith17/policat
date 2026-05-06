-- Create comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  market_id uuid references markets(id), -- Nullable for event comments
  event_id uuid references events(id),   -- Nullable for market comments
  parent_id uuid references comments(id),-- Nullable for top-level comments
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure a comment is attached to either a market OR an event, but not both or neither
  check (
    (market_id is not null and event_id is null) or 
    (event_id is not null and market_id is null)
  )
);

-- Enable RLS
alter table comments enable row level security;

-- Policies
create policy "Comments viewable by everyone." on comments for select using (true);

create policy "Authenticated users can insert comments." on comments for insert 
with check (auth.uid() = user_id);

-- Optional: users can delete their own comments
create policy "Users can delete own comments." on comments for delete 
using (auth.uid() = user_id);

create policy "Users can update own comments." on comments for update 
using (auth.uid() = user_id);
