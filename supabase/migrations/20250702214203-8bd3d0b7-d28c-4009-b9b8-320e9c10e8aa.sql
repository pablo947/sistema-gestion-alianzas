-- Update actors table to match new requirements
ALTER TABLE public.actors 
  DROP COLUMN tipo_actor,
  DROP COLUMN alcance,
  DROP COLUMN relacion,
  ADD COLUMN sector TEXT NOT NULL DEFAULT 'Académico',
  ADD COLUMN ciudad_sede TEXT,
  ADD COLUMN alcance_territorial TEXT DEFAULT 'Municipal',
  ADD COLUMN proyectos_involucrado TEXT,
  ADD COLUMN tipo_relacion TEXT,
  ADD COLUMN nivel_influencia INTEGER CHECK (nivel_influencia >= 1 AND nivel_influencia <= 5),
  ADD COLUMN nivel_interes INTEGER CHECK (nivel_interes >= 1 AND nivel_interes <= 5),
  ADD COLUMN estado_relacion TEXT DEFAULT 'Potencial';