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

-- Actors table policies
DROP POLICY IF EXISTS "Anyone can delete actors" ON public.actors;
DROP POLICY IF EXISTS "Anyone can insert actors" ON public.actors;
DROP POLICY IF EXISTS "Anyone can update actors" ON public.actors;
DROP POLICY IF EXISTS "Anyone can view actors" ON public.actors;

CREATE POLICY "Everyone can view actors"
  ON public.actors FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert actors"
  ON public.actors FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update actors"
  ON public.actors FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete actors"
  ON public.actors FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Contacts table policies
DROP POLICY IF EXISTS "Anyone can delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Anyone can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Anyone can view contacts" ON public.contacts;

CREATE POLICY "Everyone can view contacts"
  ON public.contacts FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update contacts"
  ON public.contacts FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete contacts"
  ON public.contacts FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Projects table policies
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

CREATE POLICY "Everyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update projects"
  ON public.projects FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete projects"
  ON public.projects FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Team members table policies
DROP POLICY IF EXISTS "Anyone can delete team_members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can view team_members" ON public.team_members;

CREATE POLICY "Everyone can view team_members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert team_members"
  ON public.team_members FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update team_members"
  ON public.team_members FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete team_members"
  ON public.team_members FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Actor projects table policies
DROP POLICY IF EXISTS "Anyone can delete actor_projects" ON public.actor_projects;
DROP POLICY IF EXISTS "Anyone can insert actor_projects" ON public.actor_projects;
DROP POLICY IF EXISTS "Anyone can update actor_projects" ON public.actor_projects;
DROP POLICY IF EXISTS "Anyone can view actor_projects" ON public.actor_projects;

CREATE POLICY "Everyone can view actor_projects"
  ON public.actor_projects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert actor_projects"
  ON public.actor_projects FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update actor_projects"
  ON public.actor_projects FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete actor_projects"
  ON public.actor_projects FOR DELETE
  USING (public.is_admin(auth.uid()));