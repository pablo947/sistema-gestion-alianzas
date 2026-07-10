-- Migration: Añadir tabla de solicitudes de cambio para contactos y estado pending_approval

-- 1. Añadir campo status a la tabla 'contacts'
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. Crear tabla de solicitudes de cambio (contact_change_requests)
CREATE TABLE IF NOT EXISTS public.contact_change_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id uuid REFERENCES public.contacts(contact_id) ON DELETE CASCADE,
    requested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text NOT NULL,
    payload jsonb NOT NULL,
    justification text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Configurar RLS (Row Level Security) para la nueva tabla
ALTER TABLE public.contact_change_requests ENABLE ROW LEVEL SECURITY;

-- Crear políticas para contact_change_requests
CREATE POLICY "Enable read access for all authenticated users"
ON public.contact_change_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.contact_change_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Enable update for admin and auditor"
ON public.contact_change_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'
    )
);

CREATE POLICY "Enable delete for admin"
ON public.contact_change_requests
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'
    )
);
