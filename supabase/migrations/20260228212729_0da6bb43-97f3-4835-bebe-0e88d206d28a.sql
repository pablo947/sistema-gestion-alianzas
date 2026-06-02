
-- Admin SELECT policy on profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Admin SELECT policy on user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Admin INSERT/UPDATE/DELETE on user_roles for managing roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Insert missing profiles for admin users
INSERT INTO public.profiles (id, email, full_name)
VALUES 
  ('384890b4-aa82-4b43-b358-2c922c212b44', 'santiago.martinez.castilla@gmail.com', 'Santiago Martínez Castilla'),
  ('614d9f4a-d211-40f8-8cff-7caf2f0db682', 'jtoro@funluker.org.co', 'Juliana Toro')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();

-- Insert missing roles for admin users
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('384890b4-aa82-4b43-b358-2c922c212b44', 'admin'),
  ('614d9f4a-d211-40f8-8cff-7caf2f0db682', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
