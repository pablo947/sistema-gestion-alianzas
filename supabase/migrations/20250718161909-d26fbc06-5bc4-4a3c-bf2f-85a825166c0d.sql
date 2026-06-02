-- Cambiar municipio_actuacion y departamento_actuacion a arrays para permitir múltiples valores
ALTER TABLE public.actors 
ALTER COLUMN municipio_actuacion TYPE TEXT[] USING CASE 
  WHEN municipio_actuacion IS NULL OR municipio_actuacion = '' THEN '{}'::TEXT[]
  ELSE ARRAY[municipio_actuacion]::TEXT[]
END;

ALTER TABLE public.actors 
ALTER COLUMN departamento_actuacion TYPE TEXT[] USING CASE 
  WHEN departamento_actuacion IS NULL OR departamento_actuacion = '' THEN '{}'::TEXT[]
  ELSE ARRAY[departamento_actuacion]::TEXT[]
END;

-- Establecer valores por defecto para los arrays
ALTER TABLE public.actors 
ALTER COLUMN municipio_actuacion SET DEFAULT '{}'::TEXT[];

ALTER TABLE public.actors 
ALTER COLUMN departamento_actuacion SET DEFAULT '{}'::TEXT[];