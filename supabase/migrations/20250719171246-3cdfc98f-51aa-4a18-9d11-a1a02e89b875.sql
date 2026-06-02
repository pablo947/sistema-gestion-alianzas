-- Update the projects table metas field to support new indicator types
-- Since metas is stored as JSONB, we don't need to alter the column structure
-- But we should create a comment to document the expected types

COMMENT ON COLUMN projects.metas IS 'JSONB field containing technical indicators with tipo values: gestión, impacto, resultado';

-- Optional: If you want to add a check constraint for future validation
-- Note: This is just documentation since JSONB fields are flexible
COMMENT ON TABLE projects IS 'Projects table with metas field supporting indicator types: gestión, impacto, resultado';