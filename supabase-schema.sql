-- ==========================================================================
-- OVIA GYM — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ==========================================================================

-- OFFERS -------------------------------------------------------------------
create table offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table offers enable row level security;

-- Anyone can read active offers (for the public site banner)
create policy "Public can read offers"
  on offers for select
  using (true);

-- Only logged-in users (your admin) can insert/update/delete
create policy "Authenticated can manage offers"
  on offers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- TRAINERS -------------------------------------------------------------------
create table trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  photo_url text,
  sort_order bigint default 0,
  created_at timestamptz not null default now()
);

alter table trainers enable row level security;

create policy "Public can read trainers"
  on trainers for select
  using (true);

create policy "Authenticated can manage trainers"
  on trainers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- GALLERY -------------------------------------------------------------------
create table gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order bigint default 0,
  created_at timestamptz not null default now()
);

alter table gallery enable row level security;

create policy "Public can read gallery"
  on gallery for select
  using (true);

create policy "Authenticated can manage gallery"
  on gallery for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ==========================================================================
-- STORAGE
-- After running this file, go to Storage in the Supabase dashboard and:
-- 1. Create a new bucket named exactly:  gym-images
-- 2. Make it a PUBLIC bucket (toggle "Public bucket" on when creating it)
-- This lets uploaded trainer/gallery photos be viewed on the public site.
-- ==========================================================================
