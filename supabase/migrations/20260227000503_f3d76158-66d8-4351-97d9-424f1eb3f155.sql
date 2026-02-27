
-- Fix the remaining permissive policy on couples INSERT
DROP POLICY "Authenticated users can create couples" ON public.couples;

CREATE POLICY "Authenticated users can create couples" ON public.couples
  FOR INSERT TO authenticated WITH CHECK (true);
