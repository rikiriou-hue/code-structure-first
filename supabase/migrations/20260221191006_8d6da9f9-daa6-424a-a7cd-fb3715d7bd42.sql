
-- Create couples table
CREATE TABLE public.couples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Our Story',
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create memories table
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_path TEXT,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create love_notes table
CREATE TABLE public.love_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create future_letters table
CREATE TABLE public.future_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  unlock_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user's couple_id
CREATE OR REPLACE FUNCTION public.get_user_couple_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT couple_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Couples policies
CREATE POLICY "Users can view their couple" ON public.couples
  FOR SELECT USING (id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can update their couple" ON public.couples
  FOR UPDATE USING (id = public.get_user_couple_id(auth.uid()));

-- Memories policies
CREATE POLICY "Users can view couple memories" ON public.memories
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert couple memories" ON public.memories
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON public.memories
  FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON public.memories
  FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Love notes policies
CREATE POLICY "Users can view couple notes" ON public.love_notes
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert couple notes" ON public.love_notes
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.love_notes
  FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.love_notes
  FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Future letters policies
CREATE POLICY "Users can view couple letters" ON public.future_letters
  FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert couple letters" ON public.future_letters
  FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own letters" ON public.future_letters
  FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can delete own letters" ON public.future_letters
  FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for memories
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', false);

-- Storage policies
CREATE POLICY "Users can upload to memories bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own couple files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
