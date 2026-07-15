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
security invoker
set search_path = public, extensions
as $$
declare
  base_username text;
  final_username text;
  suffix integer := 0;
begin
  base_username := split_part(new.email, '@', 1);
  loop
    final_username := base_username || case when suffix = 0 then '' else suffix::text end;
    begin
      insert into public.profiles (id, username, display_name)
      values (new.id, final_username, base_username);
      return new;
    exception when unique_violation then
      suffix := suffix + 1;
    end;
  end loop;
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
  to anon, authenticated
  using (true);

-- The Auth service inserts auth.users and fires handle_new_user. Granting its
-- internal database role this narrowly scoped insert keeps the trigger invoker.
create policy "auth_admin_create_profile"
  on public.profiles for insert
  to supabase_auth_admin
  with check (true);

create policy "auth_admin_read_profile_usernames_for_signup"
  on public.profiles for select
  to supabase_auth_admin
  using (true);


-- chapters: เนื้อหาสาธารณะ อ่านได้ทุกคน
create policy "chapters_select_all"
  on public.chapters for select
  to anon, authenticated
  using (true);

-- badges: รายการ badge สาธารณะ อ่านได้ทุกคน
create policy "badges_select_all"
  on public.badges for select
  to anon, authenticated
  using (true);

-- challenges: safe content is read through challenges_public; the hash remains
-- server-only and is compared inside the submit_flag RPC.

-- challenges: clients can only query explicitly granted safe columns; flag_hash
-- has neither a table-level nor column-level SELECT grant.
-- user_progress: เห็น/แก้ไขเฉพาะของตัวเอง
create policy "challenges_select_safe_projection"
  on public.challenges for select
  to anon, authenticated
  using (true);

create policy "user_progress_select_own"
  on public.user_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- user_badges: เห็น/รับเฉพาะของตัวเอง
create policy "user_badges_select_own"
  on public.user_badges for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- PUBLIC VIEW — challenges ที่ปลอดภัย (ไม่มี flag_hash)
-- ----------------------------------------------------------------------------

create or replace view public.challenges_public
with (security_barrier = true) as
  select
    id, chapter_id, title, description,
    xp_reward, difficulty, max_hints, file_url, order_num
  from public.challenges;

-- ให้ view เคารพ RLS ของผู้เรียก; base table ไม่มี select policy
-- จึงต้อง grant select บน view ให้ผู้ใช้อ่านคอลัมน์ที่ปลอดภัยได้
alter view public.challenges_public set (security_invoker = true);
grant select on public.challenges_public to anon, authenticated;

-- ปิด access โดยตรงต่อ base table สำหรับ client roles (กันรั่วซ้ำอีกชั้น)
-- Explicit grants avoid depending on project defaults. Progress mutations are
-- exclusively performed by submit_flag, not by browser clients.
revoke all on public.profiles, public.chapters, public.challenges,
  public.user_progress, public.badges, public.user_badges
  from anon, authenticated;
grant select on public.profiles, public.chapters, public.badges to anon, authenticated;
grant select on public.user_progress, public.user_badges to authenticated;
grant insert on public.profiles to supabase_auth_admin;
grant select (username) on public.profiles to supabase_auth_admin;
revoke select on public.challenges from anon, authenticated;
grant select (id, chapter_id, title, description, xp_reward, difficulty,
  max_hints, file_url, order_num) on public.challenges to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
