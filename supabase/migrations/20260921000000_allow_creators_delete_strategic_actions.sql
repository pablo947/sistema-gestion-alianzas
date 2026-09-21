-- Allow users to delete their own strategic actions if they are pending approval
CREATE POLICY "Enable delete for creators if pending"
    ON public.strategic_actions
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = created_by AND status = 'pending_approval'
    );
