
-- Memory Map locations table
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view couple locations" ON public.memory_locations
  FOR SELECT USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert couple locations" ON public.memory_locations
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own locations" ON public.memory_locations
  FOR UPDATE USING (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can delete own locations" ON public.memory_locations
  FOR DELETE USING (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id),
  user_id UUID NOT NULL, -- who triggered the notification
  target_user_id UUID NOT NULL, -- who should see it
  type TEXT NOT NULL, -- 'memory', 'note', 'future_letter'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = target_user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = target_user_id);

CREATE POLICY "Users can insert notifications for couple" ON public.notifications
  FOR INSERT WITH CHECK (couple_id = get_user_couple_id(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = target_user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to auto-create notification for partner
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
  -- Get partner user_id
  SELECT p.user_id INTO partner_id
  FROM profiles p
  WHERE p.couple_id = NEW.couple_id AND p.user_id != NEW.user_id
  LIMIT 1;
  
  -- No partner, skip
  IF partner_id IS NULL THEN RETURN NEW; END IF;
  
  -- Get actor display name
  SELECT COALESCE(display_name, 'Pasanganmu') INTO actor_name
  FROM profiles WHERE user_id = NEW.user_id LIMIT 1;
  
  -- Determine type based on table
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

-- Triggers for auto notification
CREATE TRIGGER notify_partner_memory
  AFTER INSERT ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.notify_partner();

CREATE TRIGGER notify_partner_note
  AFTER INSERT ON public.love_notes
  FOR EACH ROW EXECUTE FUNCTION public.notify_partner();

CREATE TRIGGER notify_partner_letter
  AFTER INSERT ON public.future_letters
  FOR EACH ROW EXECUTE FUNCTION public.notify_partner();
