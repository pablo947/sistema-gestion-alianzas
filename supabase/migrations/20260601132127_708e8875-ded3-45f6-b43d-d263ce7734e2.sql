ALTER TYPE public.nivel_direccion ADD VALUE IF NOT EXISTS 'Responsable de Comunicaciones';

COMMIT;

CREATE OR REPLACE FUNCTION public.sugerir_nivel_direccion(_cargo text, _sector text DEFAULT NULL::text)
 RETURNS nivel_direccion
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- RESPONSABLE DE COMUNICACIONES (check first so it overrides generic jefe/coordinador/analista)
  IF norm ~ '(comunicacion|comunicaciones|\mprensa\M|relaciones publicas|community manager|social media|marketing y comunicaciones|jefe de marketing|coordinador de marketing|director de comunicaciones|directora de comunicaciones|gerente de comunicaciones|head of communications|chief communications|cco\M)' THEN
    RETURN 'Responsable de Comunicaciones'::public.nivel_direccion;
  -- ESTRATÉGICO
  ELSIF norm ~ '(\mpresidente\M|\mpresidenta\M|vicepresidente ejecutiv|\mceo\M|co-ceo|chief executive|chairman|director(a)? ejecutiv|director(a)? general|director(a)? de pais|country director|\mrector\M|\mrectora\M|gerente general|\mfundador\M|\mfundadora\M|cofundador|\malcalde\M|\malcaldesa\M|\mgobernador\M|\mgobernadora\M|\mministro\M|\mministra\M|secretari[oa] de )' THEN
    RETURN 'Estratégico';
  -- DIRECTIVO
  ELSIF norm ~ '(\mvicepresidente\M|\mvicepresidenta\M|vicerrector|vicerrectora|\mdecano\M|\mdecana\M|secretari[oa] general|^director\M|^directora\M|^direccion |^director$|^directora$|^gerente\M|^gerencia |\mchief\M)' THEN
    RETURN 'Directivo';
  -- MANDO MEDIO
  ELSIF norm ~ '(\mjefe\M|\mjefa\M|coordinador|coordinadora|coodinadora|\mlider\M|supervisor|supervisora|project manager|program manager|grant manager|program officer)' THEN
    RETURN 'Mando Medio';
  -- OPERATIVO
  ELSIF norm ~ '(analista|asistente|auxiliar|tecnico|practicante|pasante|docente|profesor|profesora|investigador|investigadora|profesional|comunicador|comunicadora|periodista|abogado|abogada|economista|\msecretari[oa]\M|superiora)' THEN
    RETURN 'Operativo';
  -- ASESOR
  ELSIF norm ~ '(consultor|consultora|\masesor\M|\masesora\M|miembro de junta|junta directiva|\mboard\M)' THEN
    RETURN 'Asesor';
  END IF;

  RETURN 'Sin clasificar';
END;
$function$;