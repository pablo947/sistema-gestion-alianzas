-- Drop duplicate SELECT policies to clean up redundancy
DROP POLICY IF EXISTS "Anyone can view actors" ON actors;
DROP POLICY IF EXISTS "Anyone can view contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view actor_projects" ON actor_projects;