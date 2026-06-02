-- Actualizar el enum area_type para quitar Cultura y Salud
ALTER TYPE public.area_type RENAME TO area_type_old;

-- Crear el nuevo enum sin Cultura y Salud
CREATE TYPE public.area_type AS ENUM (
    'Educación',
    'Emprendimiento', 
    'Desarrollo Rural',
    'Proyectos Especiales',
    'Innovación'
);

-- Actualizar la tabla projects para usar el nuevo enum
ALTER TABLE public.projects 
ALTER COLUMN area TYPE area_type USING area::text::area_type;

-- Eliminar el enum anterior
DROP TYPE area_type_old;