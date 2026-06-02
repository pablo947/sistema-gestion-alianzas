
-- Actualizar tipos de relación existentes y agregar nuevo tipo
UPDATE public.actors 
SET tipo_relacion = array_replace(tipo_relacion, 'Socio Comercial', 'Proveedor Estratégico')
WHERE 'Socio Comercial' = ANY(tipo_relacion);

-- Para casos donde tipo_relacion no es array (compatibilidad)
UPDATE public.actors 
SET tipo_relacion = ARRAY['Proveedor Estratégico']
WHERE tipo_relacion::text = 'Socio Comercial';
