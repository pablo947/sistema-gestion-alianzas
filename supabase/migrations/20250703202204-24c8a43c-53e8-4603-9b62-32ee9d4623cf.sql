-- Create RPC function to access the materialized view
CREATE OR REPLACE FUNCTION public.get_influence_interest_data()
RETURNS TABLE(
  x integer,
  y integer,
  total bigint,
  top3 text[],
  estrategia text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT x, y, total, top3, estrategia 
  FROM crm_luker.vw_influ_int_heat;
$$;