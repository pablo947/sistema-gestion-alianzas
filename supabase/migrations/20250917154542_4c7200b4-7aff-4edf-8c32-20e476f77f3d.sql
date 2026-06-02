-- Add RLS policy to allow super admins to insert profiles
CREATE POLICY "Super admins can insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (is_admin(auth.uid()));