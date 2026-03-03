-- Portfolio items table
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('image', 'video_embed', 'link')),
  url text not null,
  thumbnail_url text,
  title text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index idx_portfolio_items_profile on public.portfolio_items (profile_id, sort_order);

alter table public.portfolio_items enable row level security;

create policy "Public read access" on public.portfolio_items
  for select using (true);

create policy "Owner insert" on public.portfolio_items
  for insert with check (auth.uid() = profile_id);

create policy "Owner update" on public.portfolio_items
  for update using (auth.uid() = profile_id);

create policy "Owner delete" on public.portfolio_items
  for delete using (auth.uid() = profile_id);

-- Aggregate ratings view
create or replace view public.profile_ratings as
select
  target_id as profile_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)::int as review_count
from public.reviews
group by target_id;

-- Storage bucket for portfolio uploads (run via Supabase dashboard or CLI)
-- insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true);
