-- ─────────────────────────────────────────────────────────────
-- Migration 001: Public Landing Page RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────
-- These policies allow unauthenticated visitors to:
--   1. Load a campaign by ID (for the /g/:id public page)
--   2. Submit an entry (INSERT into entries)
--   3. See the total entry count
-- ─────────────────────────────────────────────────────────────

-- Allow anyone to read campaigns that are active or draft
-- (draft campaigns are still shareable for preview/testing)
create policy "public_campaign_read" on public.campaigns
  for select using (status in ('active', 'draft'));

-- Allow anyone (unauthenticated) to insert entries
create policy "public_entry_insert" on public.entries
  for insert with check (true);

-- Allow anyone to read non-suspicious entry counts
-- (used for the "X people entered" counter on the landing page)
create policy "public_entry_count" on public.entries
  for select using (suspicious = false);

-- Prevent duplicate entries per campaign (one email per giveaway)
-- Error code 23505 is caught in PublicLanding.jsx to show "already entered"
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'entries_campaign_email_unique'
  ) then
    alter table public.entries
      add constraint entries_campaign_email_unique
      unique (campaign_id, email);
  end if;
end $$;
