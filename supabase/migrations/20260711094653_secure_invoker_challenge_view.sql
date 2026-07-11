-- Correct deployed installations: make challenges_public SECURITY INVOKER.
-- Browser roles receive only its non-secret columns; flag_hash stays server-only.

drop policy if exists "challenges_select_safe_projection" on public.challenges;
create policy "challenges_select_safe_projection"
  on public.challenges for select
  to anon, authenticated
  using (true);

revoke select on public.challenges from anon, authenticated;
revoke select (flag_hash) on public.challenges from anon, authenticated;
grant select (id, chapter_id, title, description, xp_reward, difficulty,
  max_hints, file_url, order_num) on public.challenges to anon, authenticated;

alter view public.challenges_public set (security_invoker = true);
grant select on public.challenges_public to anon, authenticated;
