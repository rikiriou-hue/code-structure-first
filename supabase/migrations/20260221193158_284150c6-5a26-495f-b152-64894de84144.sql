
-- Update handle_new_user to auto-create a couple and link profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_couple_id uuid;
BEGIN
  -- Create a couple for the new user
  INSERT INTO public.couples (start_date) VALUES (CURRENT_DATE) RETURNING id INTO new_couple_id;
  
  -- Create profile linked to the couple
  INSERT INTO public.profiles (user_id, display_name, couple_id)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', new_couple_id);
  
  RETURN NEW;
END;
$$;

-- Also allow authenticated users to insert couples (needed for the trigger with SECURITY DEFINER)
-- And update existing profiles that have no couple_id
