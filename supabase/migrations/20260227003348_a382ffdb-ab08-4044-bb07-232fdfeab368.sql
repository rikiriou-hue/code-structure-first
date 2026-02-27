
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view couple profiles"
  ON public.profiles FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- COUPLES policies
CREATE POLICY "Users can view own couple"
  ON public.couples FOR SELECT
  USING (id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Authenticated users can create couple"
  ON public.couples FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own couple"
  ON public.couples FOR UPDATE
  USING (id = public.get_user_couple_id(auth.uid()));

-- MEMORIES policies
CREATE POLICY "Users can view couple memories"
  ON public.memories FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert couple memories"
  ON public.memories FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- COUPLE_INVITES policies
CREATE POLICY "Users can view own invites"
  ON public.couple_invites FOR SELECT
  USING (invited_by = auth.uid());

CREATE POLICY "Users can create invites"
  ON public.couple_invites FOR INSERT
  WITH CHECK (invited_by = auth.uid());

-- GAME TABLES
CREATE TABLE public.game_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_question jsonb,
  current_round int NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.game_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  round int NOT NULL DEFAULT 1,
  answer jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id, round)
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple game sessions"
  ON public.game_sessions FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can create game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Users can update couple game sessions"
  ON public.game_sessions FOR UPDATE
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can delete couple game sessions"
  ON public.game_sessions FOR DELETE
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can view couple game answers"
  ON public.game_answers FOR SELECT
  USING (session_id IN (SELECT id FROM public.game_sessions WHERE couple_id = public.get_user_couple_id(auth.uid())));

CREATE POLICY "Users can insert own game answers"
  ON public.game_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game answers"
  ON public.game_answers FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;
