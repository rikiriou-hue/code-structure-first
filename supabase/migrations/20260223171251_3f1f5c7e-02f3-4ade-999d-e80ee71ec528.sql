
-- Function to leave couple (for the joined partner)
CREATE OR REPLACE FUNCTION public.leave_couple()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  current_couple uuid;
  new_couple_id uuid;
  is_joiner boolean;
BEGIN
  current_user_id := auth.uid();
  current_couple := get_user_couple_id(current_user_id);
  
  IF current_couple IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No couple found');
  END IF;

  -- Check if there are 2 members
  IF (SELECT count(*) FROM profiles WHERE couple_id = current_couple) < 2 THEN
    RETURN json_build_object('success', false, 'error', 'No partner to leave');
  END IF;

  -- Create new couple for leaving user
  INSERT INTO couples (start_date) VALUES (CURRENT_DATE) RETURNING id INTO new_couple_id;
  
  -- Move user to new couple
  UPDATE profiles SET couple_id = new_couple_id WHERE user_id = current_user_id;
  
  -- Clean up pending invites for old couple
  DELETE FROM couple_invites WHERE couple_id = current_couple AND status = 'pending';
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to kick partner (host only)
CREATE OR REPLACE FUNCTION public.kick_partner(target_user uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  current_couple uuid;
  target_couple uuid;
  new_couple_id uuid;
  host_user uuid;
BEGIN
  current_user_id := auth.uid();
  current_couple := get_user_couple_id(current_user_id);
  target_couple := get_user_couple_id(target_user);
  
  -- Verify same couple
  IF current_couple IS NULL OR current_couple != target_couple THEN
    RETURN json_build_object('success', false, 'error', 'Not in the same couple');
  END IF;
  
  -- Cannot kick yourself
  IF current_user_id = target_user THEN
    RETURN json_build_object('success', false, 'error', 'Cannot kick yourself');
  END IF;

  -- Determine host: the one who invited (check couple_invites)
  SELECT invited_by INTO host_user FROM couple_invites 
  WHERE couple_id = current_couple AND status = 'accepted'
  ORDER BY created_at DESC LIMIT 1;
  
  -- If no invite record found, host is the one with earliest profile for this couple
  IF host_user IS NULL THEN
    SELECT user_id INTO host_user FROM profiles 
    WHERE couple_id = current_couple 
    ORDER BY created_at ASC LIMIT 1;
  END IF;
  
  IF current_user_id != host_user THEN
    RETURN json_build_object('success', false, 'error', 'Only the host can kick');
  END IF;
  
  -- Create new couple for kicked user
  INSERT INTO couples (start_date) VALUES (CURRENT_DATE) RETURNING id INTO new_couple_id;
  
  -- Move kicked user
  UPDATE profiles SET couple_id = new_couple_id WHERE user_id = target_user;
  
  -- Clean up pending invites
  DELETE FROM couple_invites WHERE couple_id = current_couple AND status = 'pending';
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to get couple members
CREATE OR REPLACE FUNCTION public.get_couple_members()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_couple uuid;
  host_user uuid;
  result json;
BEGIN
  current_couple := get_user_couple_id(auth.uid());
  
  IF current_couple IS NULL THEN
    RETURN '[]'::json;
  END IF;
  
  -- Determine host
  SELECT invited_by INTO host_user FROM couple_invites 
  WHERE couple_id = current_couple AND status = 'accepted'
  ORDER BY created_at DESC LIMIT 1;
  
  IF host_user IS NULL THEN
    SELECT user_id INTO host_user FROM profiles 
    WHERE couple_id = current_couple 
    ORDER BY created_at ASC LIMIT 1;
  END IF;
  
  SELECT json_agg(json_build_object(
    'user_id', p.user_id,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'is_host', (p.user_id = host_user),
    'created_at', p.created_at
  )) INTO result
  FROM profiles p
  WHERE p.couple_id = current_couple;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;
