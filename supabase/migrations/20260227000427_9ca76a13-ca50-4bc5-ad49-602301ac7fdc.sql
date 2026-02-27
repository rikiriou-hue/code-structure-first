
-- Generate invite code function
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _couple_id uuid;
BEGIN
  SELECT couple_id INTO _couple_id FROM public.profiles WHERE user_id = auth.uid();
  IF _couple_id IS NULL THEN
    RAISE EXCEPTION 'User has no couple';
  END IF;
  _code := upper(substr(md5(random()::text), 1, 8));
  INSERT INTO public.couple_invites (couple_id, code, invited_by)
  VALUES (_couple_id, _code, auth.uid());
  RETURN _code;
END;
$$;

-- Accept invite function
CREATE OR REPLACE FUNCTION public.accept_invite(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite record;
BEGIN
  SELECT * INTO _invite FROM public.couple_invites
  WHERE code = invite_code AND status = 'pending' AND expires_at > now();
  IF _invite IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid or expired invite code');
  END IF;
  UPDATE public.profiles SET couple_id = _invite.couple_id WHERE user_id = auth.uid();
  UPDATE public.couple_invites SET status = 'accepted', accepted_by = auth.uid()::text WHERE id = _invite.id;
  RETURN json_build_object('success', true, 'couple_id', _invite.couple_id);
END;
$$;

-- Get couple members function
CREATE OR REPLACE FUNCTION public.get_couple_members()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _couple_id uuid;
  _members json;
BEGIN
  SELECT couple_id INTO _couple_id FROM public.profiles WHERE user_id = auth.uid();
  IF _couple_id IS NULL THEN
    RETURN '[]'::json;
  END IF;
  SELECT json_agg(json_build_object(
    'user_id', p.user_id,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url
  )) INTO _members
  FROM public.profiles p WHERE p.couple_id = _couple_id;
  RETURN COALESCE(_members, '[]'::json);
END;
$$;

-- Leave couple function
CREATE OR REPLACE FUNCTION public.leave_couple()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET couple_id = NULL WHERE user_id = auth.uid();
  RETURN json_build_object('success', true);
END;
$$;

-- Kick partner function
CREATE OR REPLACE FUNCTION public.kick_partner(target_user uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _my_couple uuid;
  _target_couple uuid;
BEGIN
  SELECT couple_id INTO _my_couple FROM public.profiles WHERE user_id = auth.uid();
  SELECT couple_id INTO _target_couple FROM public.profiles WHERE user_id = target_user;
  IF _my_couple IS NULL OR _my_couple != _target_couple THEN
    RETURN json_build_object('success', false, 'message', 'Not in same couple');
  END IF;
  UPDATE public.profiles SET couple_id = NULL WHERE user_id = target_user;
  RETURN json_build_object('success', true);
END;
$$;
