-- Add responsable_seguimiento column to actors table
ALTER TABLE public.actors 
ADD COLUMN responsable_seguimiento text[] DEFAULT '{}';

-- Add responsable_seguimiento column to contacts table  
ALTER TABLE public.contacts
ADD COLUMN responsable_seguimiento text[] DEFAULT '{}';