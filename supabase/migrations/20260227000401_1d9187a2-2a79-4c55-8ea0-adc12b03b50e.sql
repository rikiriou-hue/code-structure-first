
-- Couples table
CREATE TABLE public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Our Story',
  start_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  display_name text,
  avatar_url text,
  theme text NOT NULL DEFAULT 'romantic-rose',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Couple invites
CREATE TABLE public.couple_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  accepted_by uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- Memories
CREATE TABLE public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  image_path text,
  memory_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Love notes
CREATE TABLE public.love_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Future letters
CREATE TABLE public.future_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  unlock_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Memory locations
CREATE TABLE public.memory_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  category text NOT NULL DEFAULT 'other',
  memory_date date,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Game sessions table
CREATE TABLE public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  game_type text NOT NULL,
  question text,
  option_a text,
  option_b text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Game answers table
CREATE TABLE public.game_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answer text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Date planner results table
CREATE TABLE public.date_planner_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  activity text NOT NULL,
  place text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on all tables
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_planner_results ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's couple_id
CREATE OR REPLACE FUNCTION public.get_user_couple_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT couple_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their couple" ON public.profiles
  FOR SELECT USING (
    couple_id IS NULL AND user_id = auth.uid()
    OR couple_id = public.get_user_couple_id(auth.uid())
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for couples
CREATE POLICY "Couple members can view their couple" ON public.couples
  FOR SELECT USING (id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Authenticated users can create couples" ON public.couples
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Couple members can update their couple" ON public.couples
  FOR UPDATE USING (id = public.get_user_couple_id(auth.uid()));

-- RLS for couple_invites
CREATE POLICY "Couple members can view invites" ON public.couple_invites
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can create invites" ON public.couple_invites
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Anyone can view invites by code" ON public.couple_invites
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update invites" ON public.couple_invites
  FOR UPDATE USING (true);

-- RLS for memories, love_notes, future_letters, memory_locations, notifications (couple-scoped)
CREATE POLICY "Couple members can view memories" ON public.memories
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert memories" ON public.memories
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can update own memories" ON public.memories
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own memories" ON public.memories
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Couple members can view love notes" ON public.love_notes
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert love notes" ON public.love_notes
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can delete own love notes" ON public.love_notes
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Couple members can view future letters" ON public.future_letters
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert future letters" ON public.future_letters
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Couple members can view memory locations" ON public.memory_locations
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert memory locations" ON public.memory_locations
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can update own memory locations" ON public.memory_locations
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own memory locations" ON public.memory_locations
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (target_user_id = auth.uid());
CREATE POLICY "Couple members can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (target_user_id = auth.uid());

-- RLS for game tables
CREATE POLICY "Couple members can view game sessions" ON public.game_sessions
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can create game sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can update game sessions" ON public.game_sessions
  FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can delete game sessions" ON public.game_sessions
  FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can view game answers" ON public.game_answers
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.game_sessions WHERE couple_id = public.get_user_couple_id(auth.uid())
    )
  );
CREATE POLICY "Users can insert own game answers" ON public.game_answers
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND session_id IN (
      SELECT id FROM public.game_sessions WHERE couple_id = public.get_user_couple_id(auth.uid())
    )
  );

CREATE POLICY "Couple members can view date planner results" ON public.date_planner_results
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can create date planner results" ON public.date_planner_results
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
