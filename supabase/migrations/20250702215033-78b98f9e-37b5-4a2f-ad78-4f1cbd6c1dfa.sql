-- Update contacts table to match new requirements
ALTER TABLE public.contacts 
  ADD COLUMN apellidos TEXT,
  ADD COLUMN ciudad TEXT,
  ALTER COLUMN actor_id DROP NOT NULL;