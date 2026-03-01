
-- Enable realtime for game_answers
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;

-- Create game_scores table for tracking scores per user per game type
CREATE TABLE public.game_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id),
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  draws int NOT NULL DEFAULT 0,
  total_points int NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(couple_id, user_id, game_type)
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple scores"
ON public.game_scores FOR SELECT
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert own scores"
ON public.game_scores FOR INSERT
WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update own scores"
ON public.game_scores FOR UPDATE
USING (user_id = auth.uid());
