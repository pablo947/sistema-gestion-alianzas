-- Eliminar el constraint existente y crear uno nuevo con los valores correctos
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_estado_check;

-- Crear el nuevo constraint con los valores correctos
ALTER TABLE public.projects ADD CONSTRAINT projects_estado_check 
CHECK (estado IN ('Planificado', 'Ejecución', 'Finalizado'));