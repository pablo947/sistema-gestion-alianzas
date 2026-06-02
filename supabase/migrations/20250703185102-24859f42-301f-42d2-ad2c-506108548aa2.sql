-- Llenar datos de prueba aleatorios para las columnas de actores
UPDATE public.actors 
SET 
  tipo_relacion = (ARRAY['Donante', 'Beneficiario', 'Socio Comercial', 'Co-Implementador'])[floor(random() * 4 + 1)],
  nivel_influencia = floor(random() * 5 + 1)::integer,
  nivel_interes = floor(random() * 5 + 1)::integer,
  estado_relacion = (ARRAY['Activa', 'Potencial', 'Dormida'])[floor(random() * 3 + 1)]
WHERE nombre_actor IS NOT NULL;