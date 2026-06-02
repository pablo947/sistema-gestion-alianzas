-- Create actor_projects junction table for many-to-many relationship
CREATE TABLE public.actor_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES public.actors(actor_id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(proyecto_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(actor_id, project_id)
);

-- Enable Row Level Security on the new table
ALTER TABLE public.actor_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for the junction table
CREATE POLICY "Anyone can view actor_projects" 
ON public.actor_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert actor_projects" 
ON public.actor_projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update actor_projects" 
ON public.actor_projects 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete actor_projects" 
ON public.actor_projects 
FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_actor_projects_actor_id ON public.actor_projects(actor_id);
CREATE INDEX idx_actor_projects_project_id ON public.actor_projects(project_id);