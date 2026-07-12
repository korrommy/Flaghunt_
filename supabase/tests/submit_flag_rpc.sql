-- Run after 0001_initial_schema.sql, seed.sql, and 0002_submit_flag_rpc.sql.
-- The transaction rolls back the test user and all progress changes.
begin;

-- The Management API test runner cannot SET LOCAL ROLE supabase_auth_admin.
-- Verify the production role's grants and RLS policies here; exercise the
-- auth.users trigger through a deployed Auth signup integration test.
do $$
begin
  if (select prosecdef from pg_proc where oid = 'public.handle_new_user()'::regprocedure) then
    raise exception 'Assertion failed: handle_new_user must be SECURITY INVOKER';
  end if;
  if not has_table_privilege('supabase_auth_admin', 'public.profiles', 'insert') then
    raise exception 'Assertion failed: Auth role cannot insert signup profiles';
  end if;
  if not has_column_privilege('supabase_auth_admin', 'public.profiles', 'username', 'select') then
    raise exception 'Assertion failed: Auth role cannot read usernames for signup';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'auth_admin_create_profile' and cmd = 'INSERT'
      and roles @> array['supabase_auth_admin']::name[]
  ) then
    raise exception 'Assertion failed: Auth profile INSERT RLS policy is missing';
  end if;
end;
$$;

do $$
declare
  test_user_id uuid := gen_random_uuid();
  challenge_to_submit integer;
  challenge_hash text;
  locked_challenge_id integer;
  locked_challenge_hash text;
  result record;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated',
    'authenticated', 'submit-flag-rpc-test-' || test_user_id::text || '@example.invalid',
    'not-used-by-this-test', now(), '{"provider":"email","providers":["email"]}',
    '{}', now(), now(), '', '', '', ''
  );

  select id, flag_hash into challenge_to_submit, challenge_hash
  from public.challenges
  order by id
  limit 1;

  if challenge_to_submit is null then
    raise exception 'Assertion failed: seed challenge is missing';
  end if;

  select challenge.id, challenge.flag_hash into locked_challenge_id, locked_challenge_hash
  from public.challenges as challenge
  join public.chapters as chapter on chapter.id = challenge.chapter_id
  where chapter.order_num > (select min(order_num) from public.chapters)
  order by chapter.order_num, challenge.order_num
  limit 1;

  perform set_config('request.jwt.claim.sub', '', true);
  begin
    perform public.submit_flag(challenge_to_submit, challenge_hash);
    raise exception 'Assertion failed: unauthenticated call did not fail';
  exception when others then
    if sqlerrm not like '%กรุณาเข้าสู่ระบบ%' then
      raise;
    end if;
  end;

  perform set_config('request.jwt.claim.sub', test_user_id::text, true);
  begin
    perform public.submit_flag(locked_challenge_id, locked_challenge_hash);
    raise exception 'Assertion failed: locked chapter submission did not fail';
  exception when others then
    if sqlerrm not like '%กรุณาทำภารกิจในบทก่อนหน้าให้ครบก่อน%' then
      raise;
    end if;
  end;

  select * into result from public.submit_flag(challenge_to_submit, repeat('0', 64));
  if result.correct or result.already_solved or result.xp_earned <> 0 then
    raise exception 'Assertion failed: wrong hash response was unexpected';
  end if;

  select * into result from public.submit_flag(challenge_to_submit, challenge_hash);
  if not result.correct or result.already_solved or result.xp_earned <= 0 then
    raise exception 'Assertion failed: first correct answer did not award XP once';
  end if;

  select * into result from public.submit_flag(challenge_to_submit, challenge_hash);
  if not result.correct or not result.already_solved or result.xp_earned <> 0 then
    raise exception 'Assertion failed: repeat correct answer awarded XP';
  end if;

  if (select attempts from public.user_progress where user_id = test_user_id and challenge_id = challenge_to_submit) <> 3 then
    raise exception 'Assertion failed: attempts were not recorded for every submission';
  end if;
end;
$$;

do $$
begin
  if pg_get_function_arguments('public.submit_flag(integer, text)'::regprocedure)
    not like '%p_challenge_id integer%' then
    raise exception 'Assertion failed: submit_flag inputs are not prefixed';
  end if;
  if has_function_privilege('anon', 'public.submit_flag(integer, text)', 'execute') then
    raise exception 'Assertion failed: anon can execute submit_flag';
  end if;
  if not has_function_privilege('authenticated', 'public.submit_flag(integer, text)', 'execute') then
    raise exception 'Assertion failed: authenticated cannot execute submit_flag';
  end if;
  if not has_column_privilege('authenticated', 'public.challenges', 'id', 'select') then
    raise exception 'Assertion failed: safe challenge columns are not selectable';
  end if;
  if has_column_privilege('authenticated', 'public.challenges', 'flag_hash', 'select') then
    raise exception 'Assertion failed: flag_hash column is selectable';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'challenges'
      and policyname = 'challenges_select_safe_projection' and cmd = 'SELECT'
  ) then
    raise exception 'Assertion failed: challenges safe-read RLS policy is missing';
  end if;
  if not coalesce((select reloptions @> array['security_invoker=true']
    from pg_class where oid = 'public.challenges_public'::regclass), false) then
    raise exception 'Assertion failed: challenges_public must be SECURITY INVOKER';
  end if;
end;
$$;

set local role authenticated;

-- SECURITY INVOKER requires a safe base-table projection. flag_hash remains
-- inaccessible to browser roles.
select id from public.challenges limit 1;

do $$
begin
  execute 'select flag_hash from public.challenges limit 1';
  raise exception 'Assertion failed: flag_hash SELECT succeeded';
exception
  when insufficient_privilege then null;
end;
$$;

-- The browser can still read the intentionally safe projection.
select count(*) from public.challenges_public;

set local role none;

rollback;
