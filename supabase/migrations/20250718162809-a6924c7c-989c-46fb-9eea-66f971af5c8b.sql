
-- Add new column for the hierarchical structure of places of action
ALTER TABLE public.actors 
ADD COLUMN lugares_actuacion JSONB DEFAULT '[]'::JSONB;

-- Update existing data to convert current arrays to new structure
UPDATE public.actors 
SET lugares_actuacion = (
  SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'departamento', dept,
      'municipios', ARRAY(
        SELECT UNNEST(municipio_actuacion) 
        WHERE UNNEST(municipio_actuacion) = ANY(
          CASE dept
            WHEN 'Caldas' THEN ARRAY['Manizales', 'Villamaría', 'Chinchiná', 'Palestina', 'Neira', 'Riosucio', 'Anserma', 'Aguadas', 'Aranzazu', 'Belalcázar', 'Filadelfia', 'La Dorada', 'La Merced', 'Manzanares', 'Marmato', 'Marquetalia', 'Marulanda', 'Pensilvania', 'Pácora', 'Risaralda', 'Salamina', 'Samaná', 'San José', 'Supía', 'Victoria', 'Viterbo']
            WHEN 'Antioquia' THEN ARRAY['Medellín']
            WHEN 'Cundinamarca' THEN ARRAY['Bogotá']
            WHEN 'Valle del Cauca' THEN ARRAY['Cali']
            WHEN 'Atlántico' THEN ARRAY['Barranquilla']
            WHEN 'Bolívar' THEN ARRAY['Cartagena']
            WHEN 'Santander' THEN ARRAY['Bucaramanga']
            WHEN 'Huila' THEN ARRAY['Neiva']
            WHEN 'Risaralda' THEN ARRAY['Pereira']
            WHEN 'Quindío' THEN ARRAY['Armenia']
            WHEN 'Tolima' THEN ARRAY['Ibagué']
            WHEN 'Nariño' THEN ARRAY['Pasto']
            WHEN 'Meta' THEN ARRAY['Villavicencio']
            WHEN 'Norte de Santander' THEN ARRAY['Cúcuta']
            WHEN 'Córdoba' THEN ARRAY['Montería']
            WHEN 'Magdalena' THEN ARRAY['Santa Marta']
            WHEN 'Sucre' THEN ARRAY['Sincelejo']
            WHEN 'Cesar' THEN ARRAY['Valledupar']
            WHEN 'La Guajira' THEN ARRAY['Riohacha']
            WHEN 'Chocó' THEN ARRAY['Quibdó']
            WHEN 'Cauca' THEN ARRAY['Popayán']
            WHEN 'Boyacá' THEN ARRAY['Tunja']
            WHEN 'Casanare' THEN ARRAY['Yopal']
            WHEN 'Arauca' THEN ARRAY['Arauca']
            WHEN 'Putumayo' THEN ARRAY['Mocoa']
            WHEN 'Caquetá' THEN ARRAY['Florencia']
            WHEN 'Guainía' THEN ARRAY['Inírida']
            WHEN 'Guaviare' THEN ARRAY['San José del Guaviare']
            WHEN 'Vaupés' THEN ARRAY['Mitú']
            WHEN 'Vichada' THEN ARRAY['Puerto Carreño']
            WHEN 'Amazonas' THEN ARRAY['Leticia']
            WHEN 'San Andrés y Providencia' THEN ARRAY['San Andrés']
            ELSE ARRAY[]::TEXT[]
          END
        )
      )
    )
  )
  FROM UNNEST(departamento_actuacion) AS dept
  WHERE departamento_actuacion IS NOT NULL AND array_length(departamento_actuacion, 1) > 0
)
WHERE departamento_actuacion IS NOT NULL AND array_length(departamento_actuacion, 1) > 0;

-- For actors with no department/municipality data, set empty array
UPDATE public.actors 
SET lugares_actuacion = '[]'::JSONB
WHERE lugares_actuacion IS NULL;

-- Set not null constraint and default
ALTER TABLE public.actors 
ALTER COLUMN lugares_actuacion SET NOT NULL,
ALTER COLUMN lugares_actuacion SET DEFAULT '[]'::JSONB;
