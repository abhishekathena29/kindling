-- Create shared resources for channel-based community features

create table channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null default 'Community',
  is_public boolean not null default true,
  auto_join boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on channels (category);

alter table channels enable row level security;

create policy "Public channels are discoverable" on channels
  for select using (is_public);

create policy "Admins can manage channels (update)" on channels
  for update using (true)
  with check (true);

create policy "Admins can manage channels (delete)" on channels
  for delete using (true);


create table channel_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  channel_id uuid not null references channels(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index on channel_members (user_id, channel_id);
create index on channel_members (channel_id);

alter table channel_members enable row level security;

create policy "Users can see their memberships" on channel_members
  for select using (auth.uid() = user_id);

create policy "Users can join public channels" on channel_members
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from channels c where c.id = channel_id and c.is_public
    )
  );

create policy "Users can delete their membership" on channel_members
  for delete using (auth.uid() = user_id);


create table channel_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on channel_messages (channel_id, created_at desc);

alter table channel_messages enable row level security;

create policy "Members can read messages" on channel_messages
  for select using (
    exists (
      select 1
      from channel_members
      where channel_members.channel_id = channel_messages.channel_id
        and channel_members.user_id = auth.uid()
    )
  );

create policy "Members can post messages" on channel_messages
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1
      from channel_members
      where channel_members.channel_id = channel_messages.channel_id
        and channel_members.user_id = auth.uid()
    )
  );

create policy "Authors can update their messages" on channel_messages
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Authors can delete their messages" on channel_messages
  for delete using (auth.uid() = author_id);


create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on notifications (user_id, created_at desc);

alter table notifications enable row level security;

create policy "Users can read their notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can insert personal notifications" on notifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their notifications" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their notifications" on notifications
  for delete using (auth.uid() = user_id);


-- Seed a general channel so new parents have something to enter right away
insert into channels (slug, name, description, category, is_public, auto_join)
values
  ('general', 'Kindling Lounge', 'Community channel for every parent to share wins, questions, and tips.', 'Community', true, true)
on conflict (slug) do update set name = excluded.name, description = excluded.description, category = excluded.category, is_public = excluded.is_public, auto_join = excluded.auto_join;


-- Give every existing user membership to the auto-join channels
insert into channel_members (user_id, channel_id)
select p.id, c.id
from profiles p
cross join channels c
where c.auto_join
  and not exists (
    select 1 from channel_members cm where cm.user_id = p.id and cm.channel_id = c.id
  );


-- Rebuild the auth trigger so new signups automatically create profile + language preference + join auto-join channels + get a welcome notification
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, language_preference)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'en');

  insert into public.channel_members (user_id, channel_id)
  select new.id, c.id
  from public.channels c
  where c.auto_join
  on conflict (user_id, channel_id) do nothing;

  insert into public.notifications (user_id, title, body)
  values (
    new.id,
    'Welcome to Kindling! 🎉',
    'Start your parenting journey with our assessment quiz and explore our community channels.'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Keep the auth trigger pointing to the refreshed function
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
