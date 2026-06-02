-- Extend user_role enum to include more roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'custom';

-- Create permissions table
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL,
  action text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_permissions table for granular permissions
CREATE TABLE public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by uuid,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_id)
);

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for permissions table
CREATE POLICY "Everyone can view permissions" 
ON public.permissions 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS policies for user_permissions table
CREATE POLICY "Admins can view all user permissions" 
ON public.user_permissions 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert user permissions" 
ON public.user_permissions 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update user permissions" 
ON public.user_permissions 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete user permissions" 
ON public.user_permissions 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Insert default permissions
INSERT INTO public.permissions (name, description, module, action) VALUES
('actors:read', 'Ver actores', 'actors', 'read'),
('actors:write', 'Crear y editar actores', 'actors', 'write'),
('actors:delete', 'Eliminar actores', 'actors', 'delete'),
('contacts:read', 'Ver contactos', 'contacts', 'read'),
('contacts:write', 'Crear y editar contactos', 'contacts', 'write'),
('contacts:delete', 'Eliminar contactos', 'contacts', 'delete'),
('projects:read', 'Ver proyectos', 'projects', 'read'),
('projects:write', 'Crear y editar proyectos', 'projects', 'write'),
('projects:delete', 'Eliminar proyectos', 'projects', 'delete'),
('reports:read', 'Ver reportes', 'reports', 'read'),
('reports:generate', 'Generar reportes', 'reports', 'generate'),
('team:read', 'Ver equipo', 'team', 'read'),
('team:write', 'Gestionar equipo', 'team', 'write'),
('admin:users', 'Administrar usuarios', 'admin', 'users'),
('admin:permissions', 'Administrar permisos', 'admin', 'permissions');

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user is admin (has all permissions)
  SELECT CASE 
    WHEN is_admin(user_id) THEN true
    ELSE EXISTS (
      SELECT 1 
      FROM public.user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = $1 AND p.name = $2
    )
  END;
$$;