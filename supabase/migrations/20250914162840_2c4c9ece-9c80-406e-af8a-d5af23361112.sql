-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Function to handle new user registration
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
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Determine role based on email
  IF user_email IN ('santiago.martinez.castilla@gmail.com', 'jtoro@funluker.org.co') THEN
    user_role := 'admin';
  ELSE
    user_role := 'viewer';
  END IF;
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, user_email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Update existing table policies to check admin role
-- Actors table policies
DROP POLICY IF EXISTS "Anyone can delete actors" ON public.actors;
DROP POLICY IF EXISTS "Anyone can insert actors" ON public.actors;
DROP POLICY IF EXISTS "Anyone can update actors" ON public.actors;

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