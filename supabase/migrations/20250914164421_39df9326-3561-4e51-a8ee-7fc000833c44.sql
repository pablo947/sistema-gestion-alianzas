-- Drop and recreate the trigger function to handle edge cases
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_role user_role;
BEGIN
  -- Get user email from NEW record
  user_email := NEW.email;
  
  -- Determine role based on email
  IF lower(user_email) IN ('santiago.martinez.castilla@gmail.com', 'jtoro@funluker.org.co') THEN
    user_role := 'admin';
  ELSE
    user_role := 'viewer';
  END IF;
  
  -- Insert into profiles (handle conflicts)
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
  
  -- Insert role (handle conflicts)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();