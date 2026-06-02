
-- First, convert existing values to arrays with updated names
UPDATE public.contacts 
SET tipo_contacto = NULL 
WHERE tipo_contacto IS NULL;

-- Create a temporary column for the array
ALTER TABLE public.contacts ADD COLUMN redes_alumni text[] DEFAULT '{}'::text[];

-- Migrate existing data
UPDATE public.contacts 
SET redes_alumni = ARRAY['Team Impacto Colectivo']
WHERE tipo_contacto = 'Team Impacto Colectiva';

UPDATE public.contacts 
SET redes_alumni = ARRAY['Nido: Laboratorio de Liderazgo']
WHERE tipo_contacto = 'Egresado Nido';

-- Drop old column and rename new one
ALTER TABLE public.contacts DROP COLUMN tipo_contacto;
ALTER TABLE public.contacts RENAME COLUMN redes_alumni TO tipo_contacto;
