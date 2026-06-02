
-- Agregar las nuevas columnas municipio_actuación y departamento_actuación a la tabla actors
ALTER TABLE public.actors 
ADD COLUMN municipio_actuacion TEXT,
ADD COLUMN departamento_actuacion TEXT;
