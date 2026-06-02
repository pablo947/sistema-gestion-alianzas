
-- Add foreign key constraints to actor_projects table
ALTER TABLE public.actor_projects
ADD CONSTRAINT fk_actor_projects_actor_id
FOREIGN KEY (actor_id) REFERENCES public.actors(actor_id) ON DELETE CASCADE;

ALTER TABLE public.actor_projects
ADD CONSTRAINT fk_actor_projects_project_id
FOREIGN KEY (project_id) REFERENCES public.projects(proyecto_id) ON DELETE CASCADE;
