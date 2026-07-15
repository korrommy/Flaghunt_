-- Correct deployed Task 2 access controls without exposing challenge hashes.
-- Re-run supabase/seed.sql after this migration to replace prior seed hashes.

drop policy if exists "auth_admin_read_profile_usernames_for_signup" on public.profiles;
create policy "auth_admin_read_profile_usernames_for_signup"
  on public.profiles for select
  to supabase_auth_admin
  using (true);

grant select (username) on public.profiles to supabase_auth_admin;

-- Reset legacy grants, then allow the safe projection required by the
-- SECURITY INVOKER view. flag_hash remains excluded.
revoke select (id, chapter_id, title, description, xp_reward, difficulty,
  max_hints, file_url, order_num) on public.challenges from anon, authenticated;
revoke select on public.challenges from anon, authenticated;
drop policy if exists "challenges_select_safe_projection" on public.challenges;
create policy "challenges_select_safe_projection"
  on public.challenges for select
  to anon, authenticated
  using (true);

create or replace view public.challenges_public
with (security_barrier = true) as
  select
    id, chapter_id, title, description,
    xp_reward, difficulty, max_hints, file_url, order_num
  from public.challenges;

alter view public.challenges_public set (security_invoker = true);
grant select on public.challenges_public to anon, authenticated;
grant select (id, chapter_id, title, description, xp_reward, difficulty,
  max_hints, file_url, order_num) on public.challenges to anon, authenticated;
