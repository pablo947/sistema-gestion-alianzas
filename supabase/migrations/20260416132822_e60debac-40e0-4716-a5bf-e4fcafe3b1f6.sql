ALTER TABLE public.team_members
ADD COLUMN red_alumni text[] NOT NULL DEFAULT '{}'::text[];