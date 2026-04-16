-- ─────────────────────────────────────────────
-- GiveShop — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- Campaigns
create table if not exists public.campaigns (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null default 'Untitled Campaign',
  prize        text default '',
  prize_value  text default '',
  status       text default 'draft',
  end_date     text,
  settings     jsonb default '{}',
  created_at   timestamptz default now()
);

-- Entries
create table if not exists public.entries (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid references public.campaigns(id) on delete cascade not null,
  name          text not null,
  email         text not null,
  entries       integer default 1,
  method        text default 'email',
  suspicious    boolean default false,
  referral_code text,
  referred_by   text,
  referrals     integer default 0,
  ip            text,
  custom_fields jsonb,
  entered_at    timestamptz default now(),
  constraint entries_campaign_email_unique unique (campaign_id, email)
);

-- Winners
create table if not exists public.winners (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  entry_id    uuid references public.entries(id),
  name        text,
  email       text,
  method      text,
  entries     integer,
  proof_url   text,
  notified    boolean default false,
  picked_at   timestamptz default now()
);

-- ─── Row Level Security ───────────────────────
alter table public.campaigns enable row level security;
alter table public.entries   enable row level security;
alter table public.winners   enable row level security;

-- Users can only access their own campaigns
create policy "own_campaigns" on public.campaigns
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can access entries of their own campaigns
create policy "own_entries" on public.entries
  for all using (
    exists (
      select 1 from public.campaigns
      where id = entries.campaign_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.campaigns
      where id = entries.campaign_id and user_id = auth.uid()
    )
  );

-- Users can access winners of their own campaigns
create policy "own_winners" on public.winners
  for all using (
    exists (
      select 1 from public.campaigns
      where id = winners.campaign_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.campaigns
      where id = winners.campaign_id and user_id = auth.uid()
    )
  );

-- ─── Public Page Policies ────────────────────
-- Anyone can read any campaign by ID (for /enter/:id and /g/:id pages)
create policy "public_read_campaigns" on public.campaigns
  for select using (true);

-- Anyone can insert an entry (public entry page submission)
create policy "public_insert_entries" on public.entries
  for insert with check (
    exists (select 1 from public.campaigns where id = entries.campaign_id)
  );

-- Anyone can read non-suspicious entries (entry count display)
create policy "public_read_entry_count" on public.entries
  for select using (suspicious = false);

-- Anyone can read winners (for proof/winner announcement page)
create policy "public_read_winners" on public.winners
  for select using (
    exists (select 1 from public.campaigns where id = winners.campaign_id)
  );
