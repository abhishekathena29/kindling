-- Add a language preference column so we can persist Hindi/English choices
alter table profiles add column language_preference text not null default 'en';

alter table profiles add constraint profiles_language_preference_check check (language_preference in ('en', 'hi'));

-- Ensure new profiles created by the auth trigger include the preference
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, language_preference)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'en');
  return new;
end;
$$ language plpgsql security definer;
