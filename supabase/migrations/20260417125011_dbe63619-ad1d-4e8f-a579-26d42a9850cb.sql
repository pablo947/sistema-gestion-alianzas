CREATE OR REPLACE FUNCTION public.cleanup_activated_pending_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  WITH deleted AS (
    DELETE FROM public.pending_users pu
    WHERE EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE LOWER(p.email) = LOWER(pu.email)
        AND p.is_active = true
    )
    RETURNING pu.id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RETURN json_build_object(
    'success', true,
    'deleted_count', deleted_count
  );
END;
$$;