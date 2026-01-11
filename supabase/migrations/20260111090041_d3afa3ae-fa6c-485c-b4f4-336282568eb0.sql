-- Remove email column from profiles table to fix public email exposure
-- Emails are already securely stored in Supabase's auth.users table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update the handle_new_user function to not insert email anymore
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  
  INSERT INTO public.reminder_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;