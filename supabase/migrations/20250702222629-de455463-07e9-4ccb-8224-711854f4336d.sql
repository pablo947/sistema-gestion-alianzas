-- Remove user_id column from actors table
-- WARNING: This will break existing RLS policies and authentication-based access control

-- First, drop existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own actors" ON public.actors;
DROP POLICY IF EXISTS "Users can insert their own actors" ON public.actors;
DROP POLICY IF EXISTS "Users can update their own actors" ON public.actors;
DROP POLICY IF EXISTS "Users can delete their own actors" ON public.actors;

-- Remove the user_id column
ALTER TABLE public.actors DROP COLUMN user_id;

-- Create new permissive policies (WARNING: This makes all actors publicly accessible)
CREATE POLICY "Anyone can view actors" ON public.actors FOR SELECT USING (true);
CREATE POLICY "Anyone can insert actors" ON public.actors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update actors" ON public.actors FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete actors" ON public.actors FOR DELETE USING (true);