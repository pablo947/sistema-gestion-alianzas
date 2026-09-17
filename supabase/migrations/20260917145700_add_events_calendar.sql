CREATE TYPE public.event_category AS ENUM (
  'Eventos Internacionales',
  'Eventos Nacionales',
  'Eventos de la Fundación',
  'Convocatorias Activas'
);

CREATE TYPE public.event_status AS ENUM (
  'approved',
  'pending_approval',
  'rejected'
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category public.event_category NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  description text,
  external_link text,
  actor_id uuid REFERENCES public.actors(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  status public.event_status DEFAULT 'pending_approval' NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura
CREATE POLICY "Cualquier usuario autenticado puede ver eventos aprobados"
  ON public.events FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Los creadores pueden ver sus propios eventos pendientes o rechazados"
  ON public.events FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Los administradores pueden ver todos los eventos"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Políticas de inserción
CREATE POLICY "Gestor Estratégico y Administrador pueden crear eventos"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'strategic')
    )
  );

-- Políticas de actualización
CREATE POLICY "Gestores Estratégicos pueden editar sus eventos pendientes"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() 
    AND status IN ('pending_approval', 'rejected')
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'strategic'
    )
  );

CREATE POLICY "Administradores pueden actualizar todos los eventos"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Políticas de borrado
CREATE POLICY "Administradores pueden borrar eventos"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
