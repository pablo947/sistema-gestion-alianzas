
-- 1. Create ejes catalog table
CREATE TABLE public.ejes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  orden integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ejes TO authenticated;
GRANT ALL ON public.ejes TO service_role;

ALTER TABLE public.ejes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ejes"
  ON public.ejes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert ejes"
  ON public.ejes FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update ejes"
  ON public.ejes FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete ejes"
  ON public.ejes FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- 2. Seed the 6 official ejes
INSERT INTO public.ejes (nombre, orden) VALUES
  ('Primera Infancia', 1),
  ('Educación en el Aula', 2),
  ('Jóvenes y dinámicas más allá del aula', 3),
  ('Vida productiva', 4),
  ('Organizaciones e Iniciativas del Legado', 5),
  ('Conocimiento e Incidencia', 6);

-- 3. Add eje_id to programs (nullable first)
ALTER TABLE public.programs
  ADD COLUMN eje_id uuid REFERENCES public.ejes(id);

-- 4. Backfill according to the official mapping
UPDATE public.programs p SET eje_id = e.id
FROM public.ejes e
WHERE e.nombre = 'Primera Infancia'
  AND p.nombre IN ('Ecosistema de Primera Infancia');

UPDATE public.programs p SET eje_id = e.id
FROM public.ejes e
WHERE e.nombre = 'Educación en el Aula'
  AND p.nombre IN (
    'Aprendamos Todos a Leer',
    'Aprendamos Todos Matemáticas',
    'Bilinguismo',
    'Bilingüismo',
    'Escuela Activa',
    'La U en tu Colegio',
    'Tecnología'
  );

UPDATE public.programs p SET eje_id = e.id
FROM public.ejes e
WHERE e.nombre = 'Vida productiva'
  AND p.nombre IN ('Manizales Campus Universitario');

UPDATE public.programs p SET eje_id = e.id
FROM public.ejes e
WHERE e.nombre = 'Organizaciones e Iniciativas del Legado'
  AND p.nombre IN (
    'Ecosistema Social',
    'Manizales Intergeneracional',
    'Manizales Mayor-OMS',
    'Proyectos Especiales',
    'Manizales Más'
  );

UPDATE public.programs p SET eje_id = e.id
FROM public.ejes e
WHERE e.nombre = 'Conocimiento e Incidencia'
  AND p.nombre IN (
    'Incidencia',
    'Manizales Cómo Vamos',
    'Nido'
  );

-- 5. Sync the legacy text column for backward-compat during refactor
UPDATE public.programs p SET eje_estrategico = e.nombre
FROM public.ejes e WHERE p.eje_id = e.id;

-- 6. Index for joins
CREATE INDEX idx_programs_eje_id ON public.programs(eje_id);
