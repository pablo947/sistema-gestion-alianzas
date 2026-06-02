-- Create helper function to check admin by email (no table needed)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = user_id
      AND lower(u.email) IN (
        'santiago.martinez.castilla@gmail.com',
        'jtoro@funluker.org.co'
      )
  );
$$;