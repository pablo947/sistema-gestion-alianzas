-- Update RLS policies for actors table to respect custom permissions
DROP POLICY IF EXISTS "Only admins can insert actors" ON actors;
CREATE POLICY "Users with write permission can insert actors" ON actors
  FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'actors:write')
  );

DROP POLICY IF EXISTS "Only admins can update actors" ON actors;
CREATE POLICY "Users with write permission can update actors" ON actors
  FOR UPDATE
  USING (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'actors:write')
  );

DROP POLICY IF EXISTS "Only admins can delete actors" ON actors;
CREATE POLICY "Users with write permission can delete actors" ON actors
  FOR DELETE
  USING (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'actors:delete')
  );

-- Update RLS policies for contacts table to respect custom permissions
DROP POLICY IF EXISTS "Only admins can insert contacts" ON contacts;
CREATE POLICY "Users with write permission can insert contacts" ON contacts
  FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'contacts:write')
  );

DROP POLICY IF EXISTS "Only admins can update contacts" ON contacts;
CREATE POLICY "Users with write permission can update contacts" ON contacts
  FOR UPDATE
  USING (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'contacts:write')
  );

DROP POLICY IF EXISTS "Only admins can delete contacts" ON contacts;
CREATE POLICY "Users with write permission can delete contacts" ON contacts
  FOR DELETE
  USING (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'contacts:delete')
  );

-- Update RLS policies for projects table to respect custom permissions
DROP POLICY IF EXISTS "Only admins can insert projects" ON projects;
CREATE POLICY "Users with write permission can insert projects" ON projects
  FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'projects:write')
  );

DROP POLICY IF EXISTS "Only admins can update projects" ON projects;
CREATE POLICY "Users with write permission can update projects" ON projects
  FOR UPDATE
  USING (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'projects:write')
  );

DROP POLICY IF EXISTS "Only admins can delete projects" ON projects;
CREATE POLICY "Users with write permission can delete projects" ON projects
  FOR DELETE
  USING (
    is_admin(auth.uid()) OR has_permission(auth.uid(), 'projects:delete')
  );

-- Update RLS policies for actor_projects table to respect custom permissions
DROP POLICY IF EXISTS "Only admins can insert actor_projects" ON actor_projects;
CREATE POLICY "Users with write permission can insert actor_projects" ON actor_projects
  FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'actors:write') OR 
    has_permission(auth.uid(), 'projects:write')
  );

DROP POLICY IF EXISTS "Only admins can update actor_projects" ON actor_projects;
CREATE POLICY "Users with write permission can update actor_projects" ON actor_projects
  FOR UPDATE
  USING (
    is_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'actors:write') OR 
    has_permission(auth.uid(), 'projects:write')
  );

DROP POLICY IF EXISTS "Only admins can delete actor_projects" ON actor_projects;
CREATE POLICY "Users with write permission can delete actor_projects" ON actor_projects
  FOR DELETE
  USING (
    is_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'actors:delete') OR 
    has_permission(auth.uid(), 'projects:delete')
  );

-- Grant projects:write permission to Andrea Mantilla
INSERT INTO user_permissions (user_id, permission_id, granted_by)
SELECT 
  '4cee6754-b184-4d63-bb39-20fcb7cb0c29',
  p.id,
  (SELECT id FROM profiles WHERE email IN ('santiago.martinez.castilla@gmail.com', 'jtoro@funluker.org.co') LIMIT 1)
FROM permissions p
WHERE p.name = 'projects:write'
ON CONFLICT (user_id, permission_id) DO NOTHING;