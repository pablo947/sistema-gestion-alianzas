-- Update handle_new_user function to link existing profiles by email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  user_role user_role;
  existing_profile_id uuid;
  existing_temp_user_id uuid;
BEGIN
  -- Get user email from NEW record
  user_email := NEW.email;
  
  -- Check if there's already a profile with this email (pre-created by admin)
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE email = user_email AND id != NEW.id;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update the existing profile with the real user ID
    UPDATE public.profiles 
    SET id = NEW.id,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        updated_at = now()
    WHERE email = user_email AND id = existing_profile_id;
    
    -- Update user_roles to use the real user ID
    UPDATE public.user_roles
    SET user_id = NEW.id
    WHERE user_id = existing_profile_id;
    
    -- Update user_permissions to use the real user ID
    UPDATE public.user_permissions
    SET user_id = NEW.id
    WHERE user_id = existing_profile_id;
    
  ELSE
    -- Determine role based on email for new registrations
    IF lower(user_email) IN ('santiago.martinez.castilla@gmail.com', 'jtoro@funluker.org.co') THEN
      user_role := 'admin';
    ELSE
      user_role := 'viewer';
    END IF;
    
    -- Insert new profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id, 
      user_email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', user_email)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = now();
    
    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role;
  END IF;
  
  RETURN NEW;
END;
$function$;