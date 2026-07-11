-- Atomic flag submission. This is the only SECURITY DEFINER function in the
-- schema because it must read the server-only hash and update progression.
create or replace function public.submit_flag(
  challenge_id integer,
  submitted_flag_hash text
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
  challenge_row public.challenges%rowtype;
  profile_row public.profiles%rowtype;
  progress_was_solved boolean;
  is_correct boolean;
  awarded_xp integer := 0;
  badges_awarded jsonb := '[]'::jsonb;
begin
  if current_user_id is null then
    raise exception 'กรุณาเข้าสู่ระบบก่อนส่ง FLAG';
  end if;

  select * into profile_row
  from public.profiles
  where id = current_user_id
  for update;

  if not found then
    raise exception 'ไม่พบข้อมูลผู้ใช้';
  end if;

  select * into challenge_row
  from public.challenges
  where id = $1;

  if not found then
    raise exception 'ไม่พบโจทย์ที่เลือก';
  end if;

  is_correct := submitted_flag_hash is not null
    and submitted_flag_hash = challenge_row.flag_hash;

  insert into public.user_progress (user_id, challenge_id, attempts)
  values (current_user_id, $1, 1)
  on conflict (user_id, challenge_id) do update
    set attempts = public.user_progress.attempts + 1
  returning is_solved into progress_was_solved;

  if not is_correct then
    return query select false, progress_was_solved, 0,
      profile_row.total_xp, profile_row.level, badges_awarded;
    return;
  end if;

  if progress_was_solved then
    return query select true, true, 0,
      profile_row.total_xp, profile_row.level, badges_awarded;
    return;
  end if;

  update public.user_progress
  set is_solved = true,
      solved_at = now()
  where user_id = current_user_id
    and public.user_progress.challenge_id = $1;

  awarded_xp := challenge_row.xp_reward;
  update public.profiles
  set total_xp = total_xp + awarded_xp,
      level = floor(sqrt((total_xp + awarded_xp)::numeric / 100))::integer + 1
  where id = current_user_id
  returning * into profile_row;

  with inserted_badges as (
    insert into public.user_badges (user_id, badge_id)
    select current_user_id, badge.id
    from public.badges as badge
    where badge.required_level <= profile_row.level
      and (
        badge.chapter_id is null
        or (
          badge.chapter_id = challenge_row.chapter_id
          and not exists (
            select 1
            from public.challenges as chapter_challenge
            where chapter_challenge.chapter_id = badge.chapter_id
              and not exists (
                select 1
                from public.user_progress as chapter_progress
                where chapter_progress.user_id = current_user_id
                  and chapter_progress.challenge_id = chapter_challenge.id
                  and chapter_progress.is_solved
              )
          )
        )
      )
    on conflict do nothing
    returning badge_id
  )
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'id', badge.id,
      'name', badge.name,
      'description', badge.description,
      'icon', badge.icon
    )),
    '[]'::jsonb
  )
  into badges_awarded
  from inserted_badges
  join public.badges as badge on badge.id = inserted_badges.badge_id;

  return query select true, false, awarded_xp,
    profile_row.total_xp, profile_row.level, badges_awarded;
end;
$$;

revoke execute on function public.submit_flag(integer, text)
  from public, anon;
grant execute on function public.submit_flag(integer, text) to authenticated;
