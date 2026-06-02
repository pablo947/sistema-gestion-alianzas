-- Create schema for CRM Luker
CREATE TYPE public.area_type AS ENUM ('Educación', 'Emprendimiento', 'Cultura', 'Salud');

-- Create actors table
CREATE TABLE public.actors (
  actor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo_actor TEXT NOT NULL,
  alcance TEXT,
  relacion TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create contacts table
CREATE TABLE public.contacts (
  contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.actors(actor_id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  cargo TEXT,
  email TEXT UNIQUE,
  telefono TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
  proyecto_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  objetivos TEXT,
  resultados TEXT,
  area area_type NOT NULL,
  actor_id UUID REFERENCES public.actors(actor_id) ON DELETE SET NULL,
  metas JSONB DEFAULT '{}',
  avance JSONB DEFAULT '{}',
  fecha_inicio DATE,
  fecha_cierre DATE,
  estado TEXT DEFAULT 'Planificado' CHECK (estado IN ('Planificado', 'En curso', 'Finalizado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for actors
CREATE POLICY "Users can view their own actors" ON public.actors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actors" ON public.actors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actors" ON public.actors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actors" ON public.actors
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON public.contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON public.contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_actors_user_id ON public.actors(user_id);
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_actor_id ON public.contacts(actor_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_actor_id ON public.projects(actor_id);
CREATE INDEX idx_projects_estado ON public.projects(estado);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at columns
ALTER TABLE public.actors ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.contacts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_actors_updated_at
  BEFORE UPDATE ON public.actors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();