-- Saved / Favorited creators
create table public.saved_creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, creator_id)
);

create index idx_saved_creators_user on public.saved_creators(user_id);

alter table public.saved_creators enable row level security;

create policy "Users can read own saves"
  on public.saved_creators for select using (auth.uid() = user_id);
create policy "Users can insert own saves"
  on public.saved_creators for insert with check (auth.uid() = user_id);
create policy "Users can delete own saves"
  on public.saved_creators for delete using (auth.uid() = user_id);

-- Inbox read tracking columns
alter table public.connections
  add column client_last_read_at timestamptz,
  add column talent_last_read_at timestamptz;
