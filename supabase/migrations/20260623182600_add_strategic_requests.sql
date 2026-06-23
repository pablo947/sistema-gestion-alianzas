-- Migration: Añadir campos de recomendaciones a actores y tabla de solicitudes de cambio

-- 1. Añadir campos a la tabla 'actors'
ALTER TABLE public.actors
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS directrices_trato text,
ADD COLUMN IF NOT EXISTS exigencias_contractuales boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS detalles_exigencias text,
ADD COLUMN IF NOT EXISTS criticidad text,
ADD COLUMN IF NOT EXISTS fecha_revision date,
ADD COLUMN IF NOT EXISTS responsable_relacion text;

-- 2. Crear tabla de solicitudes de cambio (actor_change_requests)
CREATE TABLE IF NOT EXISTS public.actor_change_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id uuid REFERENCES public.actors(actor_id) ON DELETE CASCADE,
    requested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text NOT NULL,
    payload jsonb NOT NULL,
    justification text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Configurar RLS (Row Level Security) para la nueva tabla
ALTER TABLE public.actor_change_requests ENABLE ROW LEVEL SECURITY;

-- Crear políticas para actor_change_requests
CREATE POLICY "Enable read access for all authenticated users"
ON public.actor_change_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.actor_change_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Enable update for admin and auditor"
ON public.actor_change_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'auditor')
    )
);

CREATE POLICY "Enable delete for admin"
ON public.actor_change_requests
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);
