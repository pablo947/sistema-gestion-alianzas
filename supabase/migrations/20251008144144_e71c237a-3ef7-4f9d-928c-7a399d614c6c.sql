-- Add tipo_contacto column to contacts table
ALTER TABLE contacts 
ADD COLUMN tipo_contacto text 
CHECK (tipo_contacto IN ('Team Impacto Colectiva', 'Egresado Nido'));

-- Add comment for documentation
COMMENT ON COLUMN contacts.tipo_contacto IS 'Categoriza el contacto como parte del equipo de Impacto Colectiva o como egresado del programa Nido';