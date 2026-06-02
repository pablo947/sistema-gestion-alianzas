-- Primero verificar si hay un trigger que cause problemas
-- Llenar datos de prueba aleatorios para las columnas de actores (sin disparar triggers)
WITH random_data AS (
  SELECT 
    actor_id,
    (ARRAY['Donante', 'Beneficiario', 'Socio Comercial', 'Co-Implementador'])[floor(random() * 4 + 1)] as new_tipo_relacion,
    floor(random() * 5 + 1)::integer as new_nivel_influencia,
    floor(random() * 5 + 1)::integer as new_nivel_interes,
    (ARRAY['Activa', 'Potencial', 'Dormida'])[floor(random() * 3 + 1)] as new_estado_relacion
  FROM public.actors
  WHERE nombre_actor IS NOT NULL
)
UPDATE public.actors 
SET 
  tipo_relacion = random_data.new_tipo_relacion,
  nivel_influencia = random_data.new_nivel_influencia,
  nivel_interes = random_data.new_nivel_interes,
  estado_relacion = random_data.new_estado_relacion
FROM random_data
WHERE actors.actor_id = random_data.actor_id;