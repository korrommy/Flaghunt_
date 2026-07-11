-- ============================================================================
-- FlagHunt — Initial schema (ส่วนที่ 1)
-- Tables + RLS + trigger + public view (ซ่อน flag_hash)
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  username      text unique not null,
  display_name  text not null default 'Anonymous',
  total_xp      integer not null default 0,
  level         integer not null default 1,
  created_at    timestamptz not null default now()
);

create table if not exists public.chapters (
  id            serial primary key,
  title         text not null,
  description   text not null,
  domain        text not null,
  order_num     integer not null,
  icon          text not null default '🔒',
  color_accent  text not null default '#00ff88'
);

create table if not exists public.challenges (
  id            serial primary key,
  chapter_id    integer references public.chapters(id) on delete cascade,
  title         text not null,
  description   text not null,
  flag_hash     text not null,          -- SHA-256 hex ONLY — ห้าม expose ฝั่ง client
  xp_reward     integer not null default 100,
  difficulty    text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  max_hints     integer not null default 3,
  file_url      text,
  order_num     integer not null default 1
);

create table if not exists public.user_progress (
  id            serial primary key,
  user_id       uuid references public.profiles(id) on delete cascade,
  challenge_id  integer references public.challenges(id) on delete cascade,
  is_solved     boolean not null default false,
  hints_used    integer not null default 0,
  attempts      integer not null default 0,
  solved_at     timestamptz,
  unique(user_id, challenge_id)
);

create table if not exists public.badges (
  id             serial primary key,
  chapter_id     integer references public.chapters(id),
  name           text not null,
  description    text not null,
  icon           text not null,
  required_level integer default 1
);

create table if not exists public.user_badges (
  user_id   uuid references public.profiles(id) on delete cascade,
  badge_id  integer references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------

create index if not exists idx_challenges_chapter on public.challenges(chapter_id);
create index if not exists idx_user_progress_user on public.user_progress(user_id);
create index if not exists idx_user_progress_challenge on public.user_progress(challenge_id);
create index if not exists idx_profiles_total_xp on public.profiles(total_xp desc);

-- ----------------------------------------------------------------------------
-- AUTO-CREATE PROFILE ON SIGNUP
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix integer := 0;
begin
  base_username := split_part(new.email, '@', 1);
  final_username := base_username;

  -- กัน username ซ้ำ โดยต่อท้ายด้วยตัวเลข
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, base_username);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.chapters      enable row level security;
alter table public.challenges    enable row level security;
alter table public.user_progress enable row level security;
alter table public.badges        enable row level security;
alter table public.user_badges   enable row level security;

-- profiles: อ่านได้ทุกคน (จำเป็นสำหรับ Leaderboard — เปิดเผยเฉพาะ username/level/xp)
--           แก้ไข/เพิ่มได้เฉพาะแถวของตัวเอง
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- chapters: เนื้อหาสาธารณะ อ่านได้ทุกคน
create policy "chapters_select_all"
  on public.chapters for select
  using (true);

-- badges: รายการ badge สาธารณะ อ่านได้ทุกคน
create policy "badges_select_all"
  on public.badges for select
  using (true);

-- challenges: ไม่มี policy select → client อ่าน base table ไม่ได้เลย (กัน flag_hash รั่ว)
--             ให้ client อ่านผ่าน view challenges_public แทน
--             การเทียบ flag ทำฝั่ง server ด้วย service role key เท่านั้น

-- user_progress: เห็น/แก้ไขเฉพาะของตัวเอง
create policy "user_progress_select_own"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "user_progress_insert_own"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "user_progress_update_own"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_badges: เห็น/รับเฉพาะของตัวเอง
create policy "user_badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "user_badges_insert_own"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PUBLIC VIEW — challenges ที่ปลอดภัย (ไม่มี flag_hash)
-- ----------------------------------------------------------------------------

create or replace view public.challenges_public as
  select
    id, chapter_id, title, description,
    xp_reward, difficulty, max_hints, file_url, order_num
  from public.challenges;

-- ให้ view เคารพ RLS ของผู้เรียก; base table ไม่มี select policy
-- จึงต้อง grant select บน view ให้ผู้ใช้อ่านคอลัมน์ที่ปลอดภัยได้
alter view public.challenges_public set (security_invoker = false);
grant select on public.challenges_public to anon, authenticated;

-- ปิด access โดยตรงต่อ base table สำหรับ client roles (กันรั่วซ้ำอีกชั้น)
revoke select on public.challenges from anon, authenticated;
