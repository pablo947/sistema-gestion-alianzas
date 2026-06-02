
-- Enum
CREATE TYPE public.nivel_direccion AS ENUM ('Estratégico','Directivo','Mando Medio','Operativo','Asesor','Sin clasificar');

-- unaccent extension for normalization
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Catalog table
CREATE TABLE public.cargo_clasificacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_normalizado text NOT NULL,
  sector text,
  nivel public.nivel_direccion NOT NULL,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX cargo_clasificacion_unico
  ON public.cargo_clasificacion (cargo_normalizado, COALESCE(sector, ''));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cargo_clasificacion TO authenticated;
GRANT ALL ON public.cargo_clasificacion TO service_role;

ALTER TABLE public.cargo_clasificacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view cargo_clasificacion"
  ON public.cargo_clasificacion FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert cargo_clasificacion"
  ON public.cargo_clasificacion FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update cargo_clasificacion"
  ON public.cargo_clasificacion FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete cargo_clasificacion"
  ON public.cargo_clasificacion FOR DELETE TO authenticated USING (is_admin(auth.uid()));

CREATE TRIGGER trg_cargo_clasificacion_updated_at
  BEFORE UPDATE ON public.cargo_clasificacion
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Columns on contacts
ALTER TABLE public.contacts
  ADD COLUMN nivel_direccion public.nivel_direccion,
  ADD COLUMN nivel_direccion_auto boolean NOT NULL DEFAULT true;

-- Suggestion function
CREATE OR REPLACE FUNCTION public.sugerir_nivel_direccion(_cargo text, _sector text DEFAULT NULL)
RETURNS public.nivel_direccion
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm text;
  found public.nivel_direccion;
BEGIN
  IF _cargo IS NULL OR length(trim(_cargo)) = 0 THEN
    RETURN 'Sin clasificar'::public.nivel_direccion;
  END IF;

  norm := lower(unaccent(trim(_cargo)));

  -- 1. Exact match with sector
  IF _sector IS NOT NULL THEN
    SELECT nivel INTO found FROM public.cargo_clasificacion
      WHERE cargo_normalizado = norm AND sector = _sector LIMIT 1;
    IF found IS NOT NULL THEN RETURN found; END IF;
  END IF;

  -- 2. Exact match without sector
  SELECT nivel INTO found FROM public.cargo_clasificacion
    WHERE cargo_normalizado = norm AND sector IS NULL LIMIT 1;
  IF found IS NOT NULL THEN RETURN found; END IF;

  -- 3. Keyword rules (priority order)
  IF norm ~ '(presidente|^ceo$|director ejecutivo|rector|gerente general|fundador|chief executive)' THEN
    RETURN 'Estratégico';
  ELSIF norm ~ '(vicepresidente|decano|secretario general|^director|^gerente|chief )' THEN
    RETURN 'Directivo';
  ELSIF norm ~ '(jefe|coordinador|coordinadora|lider|líder|supervisor)' THEN
    RETURN 'Mando Medio';
  ELSIF norm ~ '(analista|asistente|auxiliar|tecnico|técnico|practicante|pasante)' THEN
    RETURN 'Operativo';
  ELSIF norm ~ '(consultor|asesor|miembro de junta|junta directiva|board)' THEN
    RETURN 'Asesor';
  END IF;

  RETURN 'Sin clasificar';
END;
$$;

GRANT EXECUTE ON FUNCTION public.sugerir_nivel_direccion(text, text) TO authenticated;

-- Backfill existing contacts
UPDATE public.contacts c
SET nivel_direccion = public.sugerir_nivel_direccion(c.cargo, a.sector_actor),
    nivel_direccion_auto = true
FROM public.actors a
WHERE c.actor_id = a.actor_id;

UPDATE public.contacts
SET nivel_direccion = public.sugerir_nivel_direccion(cargo, NULL)
WHERE nivel_direccion IS NULL;
