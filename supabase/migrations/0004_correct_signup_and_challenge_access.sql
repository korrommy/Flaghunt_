-- Correct deployed Task 2 access controls without exposing challenge hashes.
-- Re-run supabase/seed.sql after this migration to replace prior seed hashes.

drop policy if exists "auth_admin_read_profile_usernames_for_signup" on public.profiles;
create policy "auth_admin_read_profile_usernames_for_signup"
  on public.profiles for select
  to supabase_auth_admin
  using (true);

grant select (username) on public.profiles to supabase_auth_admin;

-- Remove legacy per-column grants. The safe view is the only browser-facing
-- challenge read boundary.
revoke select (id, chapter_id, title, description, xp_reward, difficulty,
  max_hints, file_url, order_num) on public.challenges from anon, authenticated;
revoke select on public.challenges from anon, authenticated;
drop policy if exists "challenges_select_safe_projection" on public.challenges;

create or replace view public.challenges_public
with (security_barrier = true) as
  select
    id, chapter_id, title, description,
    xp_reward, difficulty, max_hints, file_url, order_num
  from public.challenges;

alter view public.challenges_public set (security_invoker = false);
grant select on public.challenges_public to anon, authenticated;
