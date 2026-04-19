-- Policat Supabase Migration Schema

-- 1. Profiles Table (extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  points integer default 300,
  experience integer default 0,
  streak integer default 0,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: In a real app you'd use a database trigger to insert profile on auth.user created.
-- For simplicity, we can just upsert it from client-side or use this trigger:
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, points)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 300);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Markets Table (Admin only resolves)
create table markets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  created_by uuid references profiles(id) not null,
  yes_pool integer default 0 not null,
  no_pool integer default 0 not null,
  status text default 'active' check (status in ('active', 'resolved_yes', 'resolved_no', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  resolved_by uuid references profiles(id) -- must be admin
);


-- 3. Bets Table
create table bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  market_id uuid references markets(id) not null,
  side text not null check (side in ('yes', 'no')),
  amount integer not null check (amount > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 4. Transactions Table (for history tracking)
create table point_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  amount integer not null, -- can be negative (bet) or positive (reward)
  type text not null check (type in ('signup', 'bet', 'reward', 'ad_watch', 'refund')),
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Enable RLS (Row Level Security) and configure basic policies
alter table profiles enable row level security;
alter table markets enable row level security;
alter table bets enable row level security;
alter table point_transactions enable row level security;

-- Very basic wildcard policies for prototype speed (In production, restrict these heavily)
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Markets viewable by everyone." on markets for select using (true);
create policy "Any authenticated user can create market." on markets for insert with check (auth.role() = 'authenticated');
-- Only admin can update markets:
create policy "Admins can update markets." on markets for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

create policy "Users can view all bets." on bets for select using (true);
create policy "Users can place bets." on bets for insert with check (auth.uid() = user_id);

create policy "Users can view own transactions." on point_transactions for select using (auth.uid() = user_id);
create policy "Allows inserting transactions" on point_transactions for insert with check (auth.uid() = user_id);
