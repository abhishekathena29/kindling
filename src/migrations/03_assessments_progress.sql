create extension if not exists pgcrypto;

-- Store completed assessments so we can track history without exposing styles in the UI
create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  dominant_style text not null,
  scores jsonb not null,
  confidence numeric not null,
  confidence_level text not null,
  is_mixed boolean not null,
  mixed_styles text[],
  answers jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on assessments (user_id, created_at desc);

-- Weekly tasks for each user so we can save and load the exact plan/in-progress items
create table weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  tasks jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index on weekly_tasks (user_id, week_start);

-- Progress snapshot metadata so dashboards can show streaks/completion counts
create table progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  week_start date not null,
  completed_challenges integer not null default 0,
  total_challenges integer not null default 5,
  streak_days integer not null default 0,
  weeks_active integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on progress_snapshots (user_id, week_start desc);
