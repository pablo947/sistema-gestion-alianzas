-- Drop old check constraint
ALTER TABLE public.team_members DROP CONSTRAINT team_members_area_check;

-- Migrate data to new area names
UPDATE public.team_members SET area = 'Administrativo y Jurídico' WHERE area = 'Área Administrativa';
UPDATE public.team_members SET area = 'Programas' WHERE area = 'Educación';
UPDATE public.team_members SET area = 'Conocimiento e Incidencia' WHERE area = 'Estrategia e Innovación';
UPDATE public.team_members SET area = 'Programas' WHERE area IN ('Proyectos Especiales', 'Comunicaciones');

-- Add new check constraint with updated area names
ALTER TABLE public.team_members ADD CONSTRAINT team_members_area_check 
  CHECK (area = ANY (ARRAY['Gerencia'::text, 'Administrativo y Jurídico'::text, 'Programas'::text, 'Conocimiento e Incidencia'::text]));