-- Drop the existing function and create a new one that queries directly from actors table
DROP FUNCTION IF EXISTS public.get_influence_interest_data();

CREATE OR REPLACE FUNCTION public.get_influence_interest_data()
RETURNS TABLE(x integer, y integer, total bigint, top3 text[], estrategia text)
LANGUAGE sql
SECURITY DEFINER
AS $function$
  WITH grid_data AS (
    SELECT 
      nivel_interes as x,
      nivel_influencia as y,
      COUNT(*) as total,
      array_agg(nombre_actor ORDER BY nombre_actor) as all_actors
    FROM actors 
    WHERE nivel_influencia IS NOT NULL AND nivel_interes IS NOT NULL
    GROUP BY nivel_interes, nivel_influencia
  ),
  grid_with_strategy AS (
    SELECT 
      x, y, total,
      CASE 
        WHEN array_length(all_actors, 1) <= 3 THEN all_actors
        ELSE all_actors[1:3]
      END as top3,
      CASE 
        WHEN y >= 4 AND x >= 4 THEN 'Gestionar de cerca'
        WHEN y <= 2 AND x >= 4 THEN 'Mantener satisfechos'
        WHEN y >= 4 AND x <= 2 THEN 'Mantener informados'
        WHEN y <= 2 AND x <= 2 THEN 'Monitorear'
        ELSE 'Monitorear'
      END as estrategia
    FROM grid_data
  )
  SELECT x, y, total, top3, estrategia
  FROM grid_with_strategy
  ORDER BY y DESC, x ASC;
$function$