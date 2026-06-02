-- Drop existing trigger and recreate with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with improved error handling
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
  error_details text;
BEGIN
  -- Enhanced error handling with detailed logging
  BEGIN
    -- Get user email from NEW record
    user_email := NEW.email;
    
    -- Log the attempt
    RAISE LOG 'Processing new user registration for email: %', user_email;
    
    -- Check if there's a pending user configuration
    SELECT * INTO pending_user_record
    FROM public.pending_users
    WHERE email = user_email;
    
    IF pending_user_record IS NOT NULL THEN
      -- Use configuration from pending_users
      user_role := pending_user_record.role;
      
      RAISE LOG 'Found pending user configuration for %, role: %', user_email, user_role;
      
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
      IF user_role = 'custom' AND pending_user_record.permissions IS NOT NULL AND array_length(pending_user_record.permissions, 1) > 0 THEN
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
          ELSE
            RAISE LOG 'Permission not found: %', permission_name;
          END IF;
        END LOOP;
      END IF;
      
      -- Delete pending user record
      DELETE FROM public.pending_users WHERE id = pending_user_record.id;
      
      RAISE LOG 'Successfully processed pending user: %', user_email;
      
    ELSE
      -- Default behavior for users without pending configuration
      -- Determine role based on email for new registrations
      IF lower(user_email) IN ('santiago.martinez.castilla@gmail.com', 'jtoro@funluker.org.co') THEN
        user_role := 'admin';
      ELSE
        user_role := 'viewer';
      END IF;
      
      RAISE LOG 'No pending configuration found for %, assigning default role: %', user_email, user_role;
      
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
        
      RAISE LOG 'Successfully processed new user: %', user_email;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error with full details
      GET STACKED DIAGNOSTICS error_details = PG_EXCEPTION_DETAIL;
      RAISE LOG 'Error in handle_new_user for %: % - %', user_email, SQLERRM, error_details;
      
      -- Don't block the user creation, just log the error
      -- The user will be created in auth.users but without profile/role
      -- This allows manual intervention later
      RAISE WARNING 'Failed to process user profile for %: %', user_email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a table to track user activation issues for admin intervention
CREATE TABLE IF NOT EXISTS public.user_activation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  status text NOT NULL, -- 'success', 'failed', 'manual_required'
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on the new table
ALTER TABLE public.user_activation_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage activation logs
CREATE POLICY "Admins can manage activation logs"
ON public.user_activation_logs
FOR ALL
USING (is_admin(auth.uid()));

-- Create a function to manually activate pending users (fallback mechanism)
CREATE OR REPLACE FUNCTION public.manually_activate_user(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user record;
  pending_user_record record;
  permission_name text;
  permission_id uuid;
  result json;
BEGIN
  -- Only admins can call this function
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Find the user in auth.users
  SELECT * INTO target_user
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if there's a pending user configuration
  SELECT * INTO pending_user_record
  FROM public.pending_users
  WHERE email = user_email;
  
  IF pending_user_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No pending user configuration found');
  END IF;
  
  BEGIN
    -- Insert profile with pending user data
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      target_user.id, 
      user_email, 
      COALESCE(target_user.raw_user_meta_data->>'full_name', pending_user_record.full_name, user_email)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = now();
    
    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user.id, pending_user_record.role)
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role;
    
    -- Insert custom permissions if role is custom
    IF pending_user_record.role = 'custom' AND pending_user_record.permissions IS NOT NULL AND array_length(pending_user_record.permissions, 1) > 0 THEN
      FOREACH permission_name IN ARRAY pending_user_record.permissions
      LOOP
        -- Get permission ID
        SELECT id INTO permission_id
        FROM public.permissions
        WHERE name = permission_name;
        
        -- Insert user permission if permission exists
        IF permission_id IS NOT NULL THEN
          INSERT INTO public.user_permissions (user_id, permission_id, granted_by)
          VALUES (target_user.id, permission_id, pending_user_record.created_by)
          ON CONFLICT (user_id, permission_id) DO NOTHING;
        END IF;
      END LOOP;
    END IF;
    
    -- Delete pending user record
    DELETE FROM public.pending_users WHERE id = pending_user_record.id;
    
    -- Log successful manual activation
    INSERT INTO public.user_activation_logs (user_id, email, status, resolved_by)
    VALUES (target_user.id, user_email, 'manual_success', auth.uid());
    
    result := json_build_object(
      'success', true, 
      'message', 'User activated successfully',
      'user_id', target_user.id,
      'role', pending_user_record.role
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the failed manual activation
      INSERT INTO public.user_activation_logs (user_id, email, status, error_message)
      VALUES (target_user.id, user_email, 'manual_failed', SQLERRM);
      
      result := json_build_object('success', false, 'error', SQLERRM);
  END;
  
  RETURN result;
END;
$function$;