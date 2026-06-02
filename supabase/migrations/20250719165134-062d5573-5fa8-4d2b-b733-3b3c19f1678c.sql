
-- Agregar campos de seguimiento financiero a la tabla projects
ALTER TABLE public.projects 
ADD COLUMN presupuesto_total DECIMAL(15,2) DEFAULT 0,
ADD COLUMN presupuesto_ejecutado DECIMAL(15,2) DEFAULT 0;

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN public.projects.presupuesto_total IS 'Presupuesto total asignado al proyecto';
COMMENT ON COLUMN public.projects.presupuesto_ejecutado IS 'Presupuesto ejecutado del proyecto';

-- El campo metas ya existe como JSONB, lo usaremos para la nueva estructura de indicadores técnicos
COMMENT ON COLUMN public.projects.metas IS 'Indicadores técnicos del proyecto con estructura: {id, codigo, indicador, tipo, areas_reportan, meta, avance, frecuencia_reporte}';
