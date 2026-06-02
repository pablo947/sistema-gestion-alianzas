-- Update handle_new_user function to check for pending users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  user_role user_role;
  pending_user_record record;
  permission_name text;
  permission_id uuid;
BEGIN
  -- Get user email from NEW record
  user_email := NEW.email;
  
  -- Check if there's a pending user configuration
  SELECT * INTO pending_user_record
  FROM public.pending_users
  WHERE email = user_email;
  
  IF pending_user_record IS NOT NULL THEN
    -- Use configuration from pending_users
    user_role := pending_user_record.role;
    
    -- Insert profile with pending user data
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id, 
      user_email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', pending_user_record.full_name, user_email)
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
    
    -- Insert custom permissions if role is custom
    IF user_role = 'custom' AND array_length(pending_user_record.permissions, 1) > 0 THEN
      FOREACH permission_name IN ARRAY pending_user_record.permissions
      LOOP
        -- Get permission ID
        SELECT id INTO permission_id
        FROM public.permissions
        WHERE name = permission_name;
        
        -- Insert user permission if permission exists
        IF permission_id IS NOT NULL THEN
          INSERT INTO public.user_permissions (user_id, permission_id, granted_by)
          VALUES (NEW.id, permission_id, pending_user_record.created_by)
          ON CONFLICT (user_id, permission_id) DO NOTHING;
        END IF;
      END LOOP;
    END IF;
    
    -- Delete pending user record
    DELETE FROM public.pending_users WHERE id = pending_user_record.id;
    
  ELSE
    -- Default behavior for users without pending configuration
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