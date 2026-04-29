-- 1. Create events table
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  is_featured boolean default false,
  status text default 'active' check (status in ('active', 'closed', 'hidden')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Update markets table
alter table markets add column event_id uuid references events(id);
alter table markets add column is_featured boolean default false;

-- 3. RLS for events
alter table events enable row level security;
create policy "Events viewable by everyone." on events for select using (true);
create policy "Admins can manage events." on events for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
