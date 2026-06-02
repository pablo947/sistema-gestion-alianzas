-- ============================================================
-- MIGRACIÓN: projects → programs
-- ============================================================

-- 1. Eliminar foreign keys que apuntan a projects (para poder renombrar)
ALTER TABLE public.actor_projects DROP CONSTRAINT IF EXISTS actor_projects_project_id_fkey;
ALTER TABLE public.actor_projects DROP CONSTRAINT IF EXISTS fk_actor_projects_project_id;
ALTER TABLE public.actor_projects DROP CONSTRAINT IF EXISTS fk_actor_projects_actor_id;
ALTER TABLE public.actor_projects DROP CONSTRAINT IF EXISTS actor_projects_actor_id_fkey;

-- 2. Eliminar políticas RLS antiguas en projects
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Users with write permission can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users with write permission can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Users with write permission can update projects" ON public.projects;

-- 3. Eliminar políticas RLS antiguas en actor_projects
DROP POLICY IF EXISTS "Authenticated users can view actor_projects" ON public.actor_projects;
DROP POLICY IF EXISTS "Users with write permission can delete actor_projects" ON public.actor_projects;
DROP POLICY IF EXISTS "Users with write permission can insert actor_projects" ON public.actor_projects;
DROP POLICY IF EXISTS "Users with write permission can update actor_projects" ON public.actor_projects;

-- 4. Renombrar tablas y columnas
ALTER TABLE public.projects RENAME COLUMN proyecto_id TO programa_id;
ALTER TABLE public.projects RENAME TO programs;

ALTER TABLE public.actor_projects RENAME COLUMN project_id TO program_id;
ALTER TABLE public.actor_projects RENAME TO actor_programs;

-- 5. Recrear foreign keys con nuevos nombres
ALTER TABLE public.actor_programs
  ADD CONSTRAINT actor_programs_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES public.actors(actor_id) ON DELETE CASCADE;

ALTER TABLE public.actor_programs
  ADD CONSTRAINT actor_programs_program_id_fkey
  FOREIGN KEY (program_id) REFERENCES public.programs(programa_id) ON DELETE CASCADE;

-- 6. Recrear RLS policies para programs
CREATE POLICY "Authenticated users can view programs"
  ON public.programs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with write permission can insert programs"
  ON public.programs FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR has_permission(auth.uid(), 'programs:write'));

CREATE POLICY "Users with write permission can update programs"
  ON public.programs FOR UPDATE
  USING (is_admin(auth.uid()) OR has_permission(auth.uid(), 'programs:write'));

CREATE POLICY "Users with write permission can delete programs"
  ON public.programs FOR DELETE
  USING (is_admin(auth.uid()) OR has_permission(auth.uid(), 'programs:delete'));

-- 7. Recrear RLS policies para actor_programs
CREATE POLICY "Authenticated users can view actor_programs"
  ON public.actor_programs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with write permission can insert actor_programs"
  ON public.actor_programs FOR INSERT
  WITH CHECK (
    is_admin(auth.uid())
    OR has_permission(auth.uid(), 'actors:write')
    OR has_permission(auth.uid(), 'programs:write')
  );

CREATE POLICY "Users with write permission can update actor_programs"
  ON public.actor_programs FOR UPDATE
  USING (
    is_admin(auth.uid())
    OR has_permission(auth.uid(), 'actors:write')
    OR has_permission(auth.uid(), 'programs:write')
  );

CREATE POLICY "Users with write permission can delete actor_programs"
  ON public.actor_programs FOR DELETE
  USING (
    is_admin(auth.uid())
    OR has_permission(auth.uid(), 'actors:delete')
    OR has_permission(auth.uid(), 'programs:delete')
  );

-- 8. Renombrar permisos en la tabla permissions
UPDATE public.permissions
SET name = 'programs:write', module = 'programs'
WHERE name = 'projects:write';

UPDATE public.permissions
SET name = 'programs:delete', module = 'programs'
WHERE name = 'projects:delete';