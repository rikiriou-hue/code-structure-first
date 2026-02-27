
-- Fix overly permissive notifications INSERT policy
DROP POLICY "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
