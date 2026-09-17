-- Add new recommendation fields to strategic_actions table
ALTER TABLE public.strategic_actions 
ADD COLUMN IF NOT EXISTS directrices_trato TEXT,
ADD COLUMN IF NOT EXISTS exigencias_contractuales BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS detalles_exigencias TEXT,
ADD COLUMN IF NOT EXISTS criticidad VARCHAR,
ADD COLUMN IF NOT EXISTS responsable_relacion VARCHAR,
ADD COLUMN IF NOT EXISTS fecha_revision DATE;
