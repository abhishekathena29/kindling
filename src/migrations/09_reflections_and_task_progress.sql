-- Monthly reflections for text-based parenting check-ins
create table if not exists monthly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  period_label text not null, -- e.g. "August 2026" or "2026-08"
  answers jsonb not null, -- { win: "...", challenge: "...", focusGoal: "..." }
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists monthly_reflections_user_period_idx on monthly_reflections (user_id, period_label desc);
