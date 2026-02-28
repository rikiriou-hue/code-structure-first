
-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policy allowing users to view profiles in the same couple
CREATE POLICY "Users can view couple profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR couple_id = get_user_couple_id(auth.uid())
);
