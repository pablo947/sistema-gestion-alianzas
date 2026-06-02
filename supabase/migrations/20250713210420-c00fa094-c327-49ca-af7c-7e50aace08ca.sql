-- Create team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('Gerencia', 'Área Administrativa', 'Educación', 'Proyectos Especiales', 'Estrategia e Innovación', 'Comunicaciones')),
  cargo TEXT NOT NULL,
  correo TEXT,
  celular TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team members access
CREATE POLICY "Anyone can view team_members" 
ON public.team_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert team_members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update team_members" 
ON public.team_members 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete team_members" 
ON public.team_members 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();