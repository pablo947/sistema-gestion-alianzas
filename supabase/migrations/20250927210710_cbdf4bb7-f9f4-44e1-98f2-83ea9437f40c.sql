-- Fix the ambiguous column reference error in manually_activate_user function
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
  perm_id uuid;  -- Renamed from permission_id to avoid ambiguity
  result json;
BEGIN
  -- Only admins can call this function
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Check if there's a pending user configuration
  SELECT * INTO pending_user_record
  FROM public.pending_users
  WHERE email = user_email;
  
  IF pending_user_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No pending user configuration found');
  END IF;
  
  -- Find the user in auth.users
  SELECT * INTO target_user
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user IS NULL THEN
    -- User hasn't registered yet, just return information about pending status
    RETURN json_build_object(
      'success', false, 
      'error', 'User has not registered yet. They need to complete the signup process first.',
      'pending', true,
      'email', user_email,
      'role', pending_user_record.role
    );
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
        -- Get permission ID with explicit alias
        SELECT p.id INTO perm_id
        FROM public.permissions p
        WHERE p.name = permission_name;
        
        -- Insert user permission if permission exists
        IF perm_id IS NOT NULL THEN
          INSERT INTO public.user_permissions (user_id, permission_id, granted_by)
          VALUES (target_user.id, perm_id, pending_user_record.created_by)
          ON CONFLICT (user_id, permission_id) DO NOTHING;
        ELSE
          RAISE LOG 'Permission not found: %', permission_name;
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
      -- Log the failed manual activation with more details
      INSERT INTO public.user_activation_logs (user_id, email, status, error_message)
      VALUES (COALESCE(target_user.id, gen_random_uuid()), user_email, 'manual_failed', SQLERRM);
      
      result := json_build_object('success', false, 'error', SQLERRM);
  END;
  
  RETURN result;
END;
$function$;