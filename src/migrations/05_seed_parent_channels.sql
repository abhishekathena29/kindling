alter table channels add column if not exists icon_name text;

with seeds as (
  select * from (values
    ('mood-swing-central', 'Mood Swing Central', 'Understanding teen emotional volatility, silence, and outbursts', 'Emotional & Mental Well-Being', 'heart'),
    ('worth-beyond-comparison', 'Worth Beyond Comparison', 'Navigating self-worth in the age of peers, cousins and influencers', 'Emotional & Mental Well-Being', 'star'),
    ('burnout-before-boards', 'Burnout Before Boards', 'Emotional exhaustion in high-achieving teens', 'Education, Pressure & Performance', 'book-open'),
    ('career-maze', 'Career Maze', 'Stream selection, career confusion, and “what next?” conversations', 'Education, Pressure & Performance', 'compass'),
    ('scroll-patrol', 'Scroll Patrol', 'Screen time, phone addiction, and daily tech conflicts', 'Digital Life & Tech Challenges', 'smartphone'),
    ('online-not-alone', 'Online, Not Alone?', 'Social media, validation, and teen self-esteem', 'Digital Life & Tech Challenges', 'globe'),
    ('digital-footprints', 'Digital Footprints', 'Online safety, privacy, and boundaries', 'Digital Life & Tech Challenges', 'shield'),
    ('miles-apart-hearts-connected', 'Miles Apart, Hearts Connected', 'Parenting when children live away from home or parents travel frequently', 'Family Structures & Distance', 'map-pin'),
    ('two-homes-one-teen', 'Two Homes, One Teen', 'Co-parenting and dual-household dynamics', 'Family Structures & Distance', 'home'),
    ('back-in-our-day', 'Back in Our Day…', 'Bridging the generational gap with understanding', 'Cultural, Social & Generational Gaps', 'clock'),
    ('raising-kids-without-a-village', 'Raising Kids Without a Village', 'Parenting without extended family support', 'Cultural, Social & Generational Gaps', 'users'),
    ('friends-fallouts-fomo', 'Friends, Fallouts & FOMO', 'Navigating shifting social circles, FOMO, and comparison culture', 'Social Life & Belonging', 'user-group'),
    ('bullies-banter-boundaries', 'Bullies, Banter & Boundaries', 'Understanding social harm, assertiveness, and healthy conflict', 'Social Life & Belonging', 'shield-alert'),
    ('lets-talk', 'Let’s Talk (No Panic Mode)', 'How to start trust-based conversations about dating', 'Talking About Dating (Without Panic)', 'message-square'),
    ('guidance-over-ground-rules', 'Guidance Over Ground Rules', 'Setting boundaries without pushing teens away', 'Talking About Dating (Without Panic)', 'handshake')
  ) as channel(slug, name, description, category, icon_name)
)
insert into channels (slug, name, description, category, is_public, auto_join, icon_name)
select slug, name, description, category, true, true, icon_name from seeds
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      category = excluded.category,
      is_public = true,
      auto_join = true,
      icon_name = excluded.icon_name;

-- ensure every existing user is a member of each auto-join channel
insert into channel_members (user_id, channel_id)
select p.id, c.id
from profiles p
cross join channels c
where c.auto_join
  and not exists (
    select 1 from channel_members cm where cm.user_id = p.id and cm.channel_id = c.id
  );
