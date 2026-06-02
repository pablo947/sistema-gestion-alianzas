-- Agregar columna updated_at a la tabla actors si no existe
ALTER TABLE public.actors 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Crear trigger para actualizar timestamp automáticamente
DROP TRIGGER IF EXISTS update_actors_updated_at ON public.actors;
CREATE TRIGGER update_actors_updated_at
  BEFORE UPDATE ON public.actors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ahora actualizar con datos aleatorios
UPDATE public.actors 
SET 
  tipo_relacion = (ARRAY['Donante', 'Beneficiario', 'Socio Comercial', 'Co-Implementador'])[floor(random() * 4 + 1)],
  nivel_influencia = floor(random() * 5 + 1)::integer,
  nivel_interes = floor(random() * 5 + 1)::integer,
  estado_relacion = (ARRAY['Activa', 'Potencial', 'Dormida'])[floor(random() * 3 + 1)]
WHERE nombre_actor IS NOT NULL;