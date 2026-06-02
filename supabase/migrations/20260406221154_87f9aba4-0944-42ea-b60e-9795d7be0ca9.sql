
-- 1. Restrict SELECT policies to authenticated users only

-- contacts
DROP POLICY IF EXISTS "Everyone can view contacts" ON public.contacts;
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT TO authenticated USING (true);

-- actors
DROP POLICY IF EXISTS "Everyone can view actors" ON public.actors;
CREATE POLICY "Authenticated users can view actors" ON public.actors
  FOR SELECT TO authenticated USING (true);

-- projects
DROP POLICY IF EXISTS "Everyone can view projects" ON public.projects;
CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- team_members (remove duplicate SELECT policies)
DROP POLICY IF EXISTS "Anyone can view team_members" ON public.team_members;
DROP POLICY IF EXISTS "Everyone can view team_members" ON public.team_members;
CREATE POLICY "Authenticated users can view team_members" ON public.team_members
  FOR SELECT TO authenticated USING (true);

-- actor_projects
DROP POLICY IF EXISTS "Everyone can view actor_projects" ON public.actor_projects;
CREATE POLICY "Authenticated users can view actor_projects" ON public.actor_projects
  FOR SELECT TO authenticated USING (true);

-- permissions
DROP POLICY IF EXISTS "Everyone can view permissions" ON public.permissions;
CREATE POLICY "Authenticated users can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (true);

-- 2. Update is_admin() to use user_roles table
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
      AND role = 'admin'
  );
$$;

-- 3. Simplify handle_new_user error warning
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
  BEGIN
    user_email := NEW.email;
    RAISE LOG 'Processing new user registration for email: %', user_email;
    
    SELECT * INTO pending_user_record
    FROM public.pending_users
    WHERE email = user_email;
    
    IF pending_user_record IS NOT NULL THEN
      user_role := pending_user_record.role;
      RAISE LOG 'Found pending user configuration for %, role: %', user_email, user_role;
      
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (NEW.id, user_email, COALESCE(NEW.raw_user_meta_data->>'full_name', pending_user_record.full_name, user_email))
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = COALESCE(EXCLUDED.full_name, profiles.full_name), updated_at = now();
      
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, user_role)
      ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
      
      IF user_role = 'custom' AND pending_user_record.permissions IS NOT NULL AND array_length(pending_user_record.permissions, 1) > 0 THEN
        FOREACH permission_name IN ARRAY pending_user_record.permissions
        LOOP
          SELECT id INTO permission_id FROM public.permissions WHERE name = permission_name;
          IF permission_id IS NOT NULL THEN
            INSERT INTO public.user_permissions (user_id, permission_id, granted_by)
            VALUES (NEW.id, permission_id, pending_user_record.created_by)
            ON CONFLICT (user_id, permission_id) DO NOTHING;
          ELSE
            RAISE LOG 'Permission not found: %', permission_name;
          END IF;
        END LOOP;
      END IF;
      
      DELETE FROM public.pending_users WHERE id = pending_user_record.id;
      RAISE LOG 'Successfully processed pending user: %', user_email;
    ELSE
      user_role := 'viewer';
      RAISE LOG 'No pending configuration found for %, assigning default role: %', user_email, user_role;
      
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (NEW.id, user_email, COALESCE(NEW.raw_user_meta_data->>'full_name', user_email))
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = COALESCE(EXCLUDED.full_name, profiles.full_name), updated_at = now();
      
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, user_role)
      ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
      
      RAISE LOG 'Successfully processed new user: %', user_email;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS error_details = PG_EXCEPTION_DETAIL;
      RAISE LOG 'Error in handle_new_user for %: % - %', user_email, SQLERRM, error_details;
      RAISE WARNING 'Failed to process user profile. Please contact administrator.';
  END;
  RETURN NEW;
END;
$function$;
