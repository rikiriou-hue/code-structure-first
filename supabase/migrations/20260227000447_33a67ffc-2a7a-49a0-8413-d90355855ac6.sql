
-- Fix overly permissive policies on couple_invites
DROP POLICY "Anyone can view invites by code" ON public.couple_invites;
DROP POLICY "Authenticated users can update invites" ON public.couple_invites;

-- The accept_invite function is SECURITY DEFINER so it bypasses RLS.
-- We only need couple members to update their own invites.
CREATE POLICY "Couple members can update invites" ON public.couple_invites
  FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()));
