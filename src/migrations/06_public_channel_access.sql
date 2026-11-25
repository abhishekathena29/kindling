alter table channel_messages disable row level security;

alter table channel_messages enable row level security;
drop policy if exists "Members can read messages" on channel_messages;
drop policy if exists "Members can post messages" on channel_messages;
drop policy if exists "Authors can update their messages" on channel_messages;
drop policy if exists "Authors can delete their messages" on channel_messages;

create policy "Authenticated users can read messages" on channel_messages
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can write messages" on channel_messages
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update messages" on channel_messages
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete messages" on channel_messages
  for delete using (auth.role() = 'authenticated');
