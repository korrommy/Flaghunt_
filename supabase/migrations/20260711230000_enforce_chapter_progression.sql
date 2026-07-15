-- Correct existing deployments without exposing challenge hashes. Fresh
-- environments receive the same check directly from 0002_submit_flag_rpc.sql.
alter function public.submit_flag(integer, text) rename to submit_flag_unchecked;

create or replace function public.submit_flag(
  p_challenge_id integer,
  p_submitted_flag_hash text
)
returns table (
  correct boolean,
  already_solved boolean,
  xp_earned integer,
  new_total_xp integer,
  new_level integer,
  newly_earned_badges jsonb
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_user_id uuid := auth.uid();
  current_chapter_order integer;
  previous_chapter_id integer;
begin
  if current_user_id is null then
    raise exception 'กรุณาเข้าสู่ระบบก่อนส่ง FLAG';
  end if;

  select chapter.order_num into current_chapter_order
  from public.challenges as challenge
  join public.chapters as chapter on chapter.id = challenge.chapter_id
  where challenge.id = p_challenge_id;

  if current_chapter_order is null then
    raise exception 'ไม่พบโจทย์ที่เลือก';
  end if;

  select previous_chapter.id into previous_chapter_id
  from public.chapters as previous_chapter
  where previous_chapter.order_num < current_chapter_order
  order by previous_chapter.order_num desc
  limit 1;

  if previous_chapter_id is not null and exists (
    select 1
    from public.challenges as prerequisite_challenge
    where prerequisite_challenge.chapter_id = previous_chapter_id
      and not exists (
        select 1
        from public.user_progress as prerequisite_progress
        where prerequisite_progress.user_id = current_user_id
          and prerequisite_progress.challenge_id = prerequisite_challenge.id
          and prerequisite_progress.is_solved
      )
  ) then
    raise exception 'กรุณาทำภารกิจในบทก่อนหน้าให้ครบก่อน';
  end if;

  return query select * from public.submit_flag_unchecked(p_challenge_id, p_submitted_flag_hash);
end;
$$;

revoke execute on function public.submit_flag_unchecked(integer, text) from public, anon, authenticated;
revoke execute on function public.submit_flag(integer, text) from public, anon;
grant execute on function public.submit_flag(integer, text) to authenticated;

-- The original trigger's check-then-insert can race. Retry on the unique
-- username constraint so simultaneous registrations receive distinct handles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  base_username text := split_part(new.email, '@', 1);
  final_username text;
  suffix integer := 0;
begin
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
