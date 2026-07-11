-- Run after 0001_initial_schema.sql, seed.sql, and 0002_submit_flag_rpc.sql.
-- The transaction rolls back the test user and all progress changes.
begin;

do $$
declare
  test_user_id uuid := gen_random_uuid();
  challenge_to_submit integer;
  challenge_hash text;
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
  if has_table_privilege('authenticated', 'public.challenges', 'select') then
    raise exception 'Assertion failed: challenges table-level SELECT is granted';
  end if;
  if has_column_privilege('authenticated', 'public.challenges', 'flag_hash', 'select') then
    raise exception 'Assertion failed: flag_hash column is selectable';
  end if;
end;
$$;

rollback;
