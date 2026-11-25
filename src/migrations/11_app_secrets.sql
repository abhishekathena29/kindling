-- Store server-managed secrets (e.g. the OpenAI API key) in the database
-- instead of bundling them into the app via .env.
--
-- The table has RLS enabled with NO policies, so it cannot be read directly
-- through the REST API. Signed-in users can only fetch the OpenAI key via the
-- get_openai_api_key() RPC below.

create table if not exists app_secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_secrets enable row level security;

-- Make sure no role can read the table directly.
revoke all on table app_secrets from anon, authenticated;

create or replace function get_openai_api_key()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  secret text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select value into secret from app_secrets where name = 'openai_api_key';
  return secret;
end;
$$;

revoke all on function get_openai_api_key() from public, anon;
grant execute on function get_openai_api_key() to authenticated;

-- Set / rotate the key (run in the Supabase SQL editor, not from the app):
-- insert into app_secrets (name, value) values ('openai_api_key', 'sk-...')
-- on conflict (name) do update set value = excluded.value, updated_at = now();
