
-- Tighten SELECT on team_members: only admins or users with relevant permissions can read full rows (incl. correo/celular)
DROP POLICY IF EXISTS "Authenticated users can view team_members" ON public.team_members;

CREATE POLICY "Privileged users can view team_members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.has_permission(auth.uid(), 'team:read')
  OR public.has_permission(auth.uid(), 'reports:generate')
);

-- Public directory view exposing only non-sensitive identification fields,
-- so other modules can still resolve names/areas for responsables.
CREATE OR REPLACE VIEW public.team_members_directory
WITH (security_invoker = true) AS
SELECT id, nombre, apellidos, area
FROM public.team_members;

GRANT SELECT ON public.team_members_directory TO authenticated;
