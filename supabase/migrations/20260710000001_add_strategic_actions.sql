-- Create strategic_actions table
CREATE TABLE public.strategic_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR NOT NULL CHECK (scope IN ('quadrant', 'actor')),
    quadrant_key VARCHAR NOT NULL CHECK (quadrant_key IN ('close', 'satisfied', 'informed', 'monitor')),
    actor_id UUID REFERENCES public.actors(actor_id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    created_by UUID REFERENCES auth.users(id),
    user_email VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.strategic_actions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" 
    ON public.strategic_actions FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable insert for authenticated users" 
    ON public.strategic_actions FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update for admins" 
    ON public.strategic_actions FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Enable delete for admins" 
    ON public.strategic_actions FOR DELETE
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );
