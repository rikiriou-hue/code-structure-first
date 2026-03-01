ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_game_type_check;
ALTER TABLE public.game_sessions ADD CONSTRAINT game_sessions_game_type_check
CHECK (game_type = ANY (ARRAY['truth_or_love', 'love_quiz', 'whos_more_likely', 'this_or_that', 'memory_match', 'quiz', 'truth', 'would_you_rather', 'date_planner']));