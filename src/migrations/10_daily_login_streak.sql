-- Daily login streak support: persist last login date on the profile
-- so consecutive-day streak survives reinstalls and devices.
alter table profiles
  add column if not exists last_login_date date;

comment on column profiles.last_login_date is
  'UTC calendar date of the user’s last recorded Kindling open; used for streak_days.';
