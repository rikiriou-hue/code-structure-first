
-- Create love_notes table
CREATE TABLE public.love_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple notes" ON public.love_notes FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert notes" ON public.love_notes FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.love_notes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.love_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create future_letters table
CREATE TABLE public.future_letters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  unlock_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple letters" ON public.future_letters FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert letters" ON public.future_letters FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON public.future_letters FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own letters" ON public.future_letters FOR DELETE
  USING (auth.uid() = user_id);

-- Create memory_locations table
CREATE TABLE public.memory_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'favorite_spot',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  memory_date date NOT NULL DEFAULT CURRENT_DATE,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple locations" ON public.memory_locations FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert locations" ON public.memory_locations FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can delete own locations" ON public.memory_locations FOR DELETE
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create date_planner_results table
CREATE TABLE public.date_planner_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  activity text NOT NULL,
  place text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.date_planner_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple results" ON public.date_planner_results FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert results" ON public.date_planner_results FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = created_by);

-- Add missing columns to game_sessions
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS question text;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS option_a text;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS option_b text;

-- Drop current_question since we use question text column instead
ALTER TABLE public.game_sessions DROP COLUMN IF EXISTS current_question;
