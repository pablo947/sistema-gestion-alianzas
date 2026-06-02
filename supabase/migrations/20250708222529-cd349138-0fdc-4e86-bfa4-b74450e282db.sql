-- Actualizar la columna tipo_relacion para permitir múltiples tipos de relación
ALTER TABLE public.actors 
ALTER COLUMN tipo_relacion TYPE text[] USING 
  CASE 
    WHEN tipo_relacion IS NULL THEN NULL
    WHEN tipo_relacion = '' THEN NULL
    ELSE ARRAY[tipo_relacion]
  END;