-- Remove unique constraint on email field to allow multiple empty emails
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_email_key;
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_correo_key;