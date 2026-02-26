
-- Table for couple invites
CREATE TABLE public.couple_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own couple invites"
ON public.couple_invites FOR SELECT TO authenticated
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Users can create invites"
ON public.couple_invites FOR INSERT TO authenticated
WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND invited_by = auth.uid());

CREATE POLICY "Users can accept invites"
ON public.couple_invites FOR UPDATE TO authenticated
USING (true);

-- Helper function to generate unique 6-char code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM couple_invites WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to accept an invite
CREATE OR REPLACE FUNCTION public.accept_invite(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record record;
  old_couple_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  SELECT * INTO invite_record FROM couple_invites
  WHERE code = invite_code AND status = 'pending' AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;
  
  IF invite_record.couple_id = get_user_couple_id(current_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already in this couple');
  END IF;
  
  old_couple_id := get_user_couple_id(current_user_id);
  
  UPDATE profiles SET couple_id = invite_record.couple_id
  WHERE user_id = current_user_id;
  
  UPDATE couple_invites SET status = 'accepted', accepted_by = current_user_id
  WHERE id = invite_record.id;
  
  DELETE FROM couples WHERE id = old_couple_id
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE couple_id = old_couple_id);
  
  RETURN json_build_object('success', true);
END;
$$;
