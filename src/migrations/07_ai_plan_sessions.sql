create table ai_plan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  assessment_id uuid not null references assessments(id) on delete cascade,
  prompt text not null,
  question_answers jsonb not null,
  response jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on ai_plan_sessions (user_id, created_at desc);
