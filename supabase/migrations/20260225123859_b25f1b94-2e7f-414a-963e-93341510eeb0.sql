
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

-- Create memory_locations table WITH photo_url
CREATE TABLE public.memory_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  memory_date DATE DEFAULT CURRENT_DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create couple_invites table
CREATE TABLE public.couple_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id),
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Couples policies
CREATE POLICY "Users can view their couple" ON public.couples FOR SELECT USING (id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can update their couple" ON public.couples FOR UPDATE USING (id = public.get_user_couple_id(auth.uid()));

-- Memories policies
CREATE POLICY "Users can view couple memories" ON public.memories FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert couple memories" ON public.memories FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.memories FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.memories FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Love notes policies
CREATE POLICY "Users can view couple notes" ON public.love_notes FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert couple notes" ON public.love_notes FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.love_notes FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.love_notes FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Future letters policies
CREATE POLICY "Users can view couple letters" ON public.future_letters FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert couple letters" ON public.future_letters FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON public.future_letters FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can delete own letters" ON public.future_letters FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Memory locations policies
CREATE POLICY "Users can view couple locations" ON public.memory_locations FOR SELECT USING (couple_id = get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert couple locations" ON public.memory_locations FOR INSERT WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can update own locations" ON public.memory_locations FOR UPDATE USING (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can delete own locations" ON public.memory_locations FOR DELETE USING (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Couple invites policies
CREATE POLICY "Users can view own couple invites" ON public.couple_invites FOR SELECT TO authenticated USING (couple_id = get_user_couple_id(auth.uid()));
CREATE POLICY "Users can create invites" ON public.couple_invites FOR INSERT TO authenticated WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND invited_by = auth.uid());
CREATE POLICY "Users can accept invites" ON public.couple_invites FOR UPDATE TO authenticated USING (status = 'pending' AND expires_at > now());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = target_user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = target_user_id);
CREATE POLICY "Users can insert notifications for couple" ON public.notifications FOR INSERT WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = target_user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_couple_id uuid;
BEGIN
  INSERT INTO public.couples (start_date) VALUES (CURRENT_DATE) RETURNING id INTO new_couple_id;
  INSERT INTO public.profiles (user_id, display_name, couple_id)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', new_couple_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper function to generate unique 6-char code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM couple_invites WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to accept an invite
CREATE OR REPLACE FUNCTION public.accept_invite(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record record;
  old_couple_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  SELECT * INTO invite_record FROM couple_invites
  WHERE code = invite_code AND status = 'pending' AND expires_at > now();
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;
  IF invite_record.couple_id = get_user_couple_id(current_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already in this couple');
  END IF;
  old_couple_id := get_user_couple_id(current_user_id);
  UPDATE profiles SET couple_id = invite_record.couple_id WHERE user_id = current_user_id;
  UPDATE couple_invites SET status = 'accepted', accepted_by = current_user_id WHERE id = invite_record.id;
  DELETE FROM couples WHERE id = old_couple_id AND NOT EXISTS (SELECT 1 FROM profiles WHERE couple_id = old_couple_id);
  RETURN json_build_object('success', true);
END;
$$;

-- Function to leave couple
CREATE OR REPLACE FUNCTION public.leave_couple()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  current_couple uuid;
  new_couple_id uuid;
BEGIN
  current_user_id := auth.uid();
  current_couple := get_user_couple_id(current_user_id);
  IF current_couple IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No couple found');
  END IF;
  IF (SELECT count(*) FROM profiles WHERE couple_id = current_couple) < 2 THEN
    RETURN json_build_object('success', false, 'error', 'No partner to leave');
  END IF;
  INSERT INTO couples (start_date) VALUES (CURRENT_DATE) RETURNING id INTO new_couple_id;
  UPDATE profiles SET couple_id = new_couple_id WHERE user_id = current_user_id;
  DELETE FROM couple_invites WHERE couple_id = current_couple AND status = 'pending';
  RETURN json_build_object('success', true);
END;
$$;

-- Function to kick partner
CREATE OR REPLACE FUNCTION public.kick_partner(target_user uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  current_couple uuid;
  target_couple uuid;
  new_couple_id uuid;
  host_user uuid;
BEGIN
  current_user_id := auth.uid();
  current_couple := get_user_couple_id(current_user_id);
  target_couple := get_user_couple_id(target_user);
  IF current_couple IS NULL OR current_couple != target_couple THEN
    RETURN json_build_object('success', false, 'error', 'Not in the same couple');
  END IF;
  IF current_user_id = target_user THEN
    RETURN json_build_object('success', false, 'error', 'Cannot kick yourself');
  END IF;
  SELECT invited_by INTO host_user FROM couple_invites WHERE couple_id = current_couple AND status = 'accepted' ORDER BY created_at DESC LIMIT 1;
  IF host_user IS NULL THEN
    SELECT user_id INTO host_user FROM profiles WHERE couple_id = current_couple ORDER BY created_at ASC LIMIT 1;
  END IF;
  IF current_user_id != host_user THEN
    RETURN json_build_object('success', false, 'error', 'Only the host can kick');
  END IF;
  INSERT INTO couples (start_date) VALUES (CURRENT_DATE) RETURNING id INTO new_couple_id;
  UPDATE profiles SET couple_id = new_couple_id WHERE user_id = target_user;
  DELETE FROM couple_invites WHERE couple_id = current_couple AND status = 'pending';
  RETURN json_build_object('success', true);
END;
$$;

-- Function to get couple members
CREATE OR REPLACE FUNCTION public.get_couple_members()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_couple uuid;
  host_user uuid;
  result json;
BEGIN
  current_couple := get_user_couple_id(auth.uid());
  IF current_couple IS NULL THEN
    RETURN '[]'::json;
  END IF;
  SELECT invited_by INTO host_user FROM couple_invites WHERE couple_id = current_couple AND status = 'accepted' ORDER BY created_at DESC LIMIT 1;
  IF host_user IS NULL THEN
    SELECT user_id INTO host_user FROM profiles WHERE couple_id = current_couple ORDER BY created_at ASC LIMIT 1;
  END IF;
  SELECT json_agg(json_build_object(
    'user_id', p.user_id,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'is_host', (p.user_id = host_user),
    'created_at', p.created_at
  )) INTO result
  FROM profiles p
  WHERE p.couple_id = current_couple;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Notify partner function
CREATE OR REPLACE FUNCTION public.notify_partner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  partner_id uuid;
  notif_type text;
  notif_title text;
  actor_name text;
BEGIN
  SELECT p.user_id INTO partner_id FROM profiles p WHERE p.couple_id = NEW.couple_id AND p.user_id != NEW.user_id LIMIT 1;
  IF partner_id IS NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Pasanganmu') INTO actor_name FROM profiles WHERE user_id = NEW.user_id LIMIT 1;
  IF TG_TABLE_NAME = 'memories' THEN
    notif_type := 'memory';
    notif_title := actor_name || ' menambahkan memory baru: ' || NEW.title;
  ELSIF TG_TABLE_NAME = 'love_notes' THEN
    notif_type := 'note';
    notif_title := actor_name || ' menulis love note baru 💕';
  ELSIF TG_TABLE_NAME = 'future_letters' THEN
    notif_type := 'future_letter';
    notif_title := actor_name || ' menulis future letter baru 💌';
  END IF;
  INSERT INTO notifications (couple_id, user_id, target_user_id, type, title)
  VALUES (NEW.couple_id, NEW.user_id, partner_id, notif_type, notif_title);
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_partner_memory AFTER INSERT ON public.memories FOR EACH ROW EXECUTE FUNCTION public.notify_partner();
CREATE TRIGGER notify_partner_note AFTER INSERT ON public.love_notes FOR EACH ROW EXECUTE FUNCTION public.notify_partner();
CREATE TRIGGER notify_partner_letter AFTER INSERT ON public.future_letters FOR EACH ROW EXECUTE FUNCTION public.notify_partner();

-- Storage bucket for memories
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', false);

CREATE POLICY "Users can upload to memories bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own couple files" ON storage.objects FOR SELECT USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);