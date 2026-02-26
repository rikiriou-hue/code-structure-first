
-- Tighten the UPDATE policy - only the accept_invite function (SECURITY DEFINER) actually updates
DROP POLICY "Users can accept invites" ON public.couple_invites;

CREATE POLICY "Users can accept invites"
ON public.couple_invites FOR UPDATE TO authenticated
USING (status = 'pending' AND expires_at > now());
