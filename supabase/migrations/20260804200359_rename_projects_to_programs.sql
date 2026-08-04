-- Update descriptions in permissions table from "proyectos" to "programas"
UPDATE public.permissions 
SET description = REPLACE(description, 'proyectos', 'programas')
WHERE description LIKE '%proyectos%';

UPDATE public.permissions 
SET description = REPLACE(description, 'Proyectos', 'Programas')
WHERE description LIKE '%Proyectos%';
