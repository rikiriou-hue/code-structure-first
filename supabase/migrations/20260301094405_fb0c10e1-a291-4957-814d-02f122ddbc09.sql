
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS answerer_id uuid;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS guesser_id uuid;
