
CREATE OR REPLACE FUNCTION public.generate_invite_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  current_user_id uuid;
  current_couple_id uuid;
BEGIN
  current_user_id := auth.uid();
  current_couple_id := get_user_couple_id(current_user_id);

  IF current_couple_id IS NULL THEN
    RAISE EXCEPTION 'User has no couple';
  END IF;

  -- Delete any existing pending invites for this couple
  DELETE FROM couple_invites WHERE couple_id = current_couple_id AND status = 'pending';

  LOOP
    new_code := upper(substr(md5(random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM couple_invites WHERE code = new_code AND status = 'pending');
  END LOOP;

  INSERT INTO couple_invites (code, couple_id, invited_by, status)
  VALUES (new_code, current_couple_id, current_user_id, 'pending');

  RETURN new_code;
END;
$function$;
