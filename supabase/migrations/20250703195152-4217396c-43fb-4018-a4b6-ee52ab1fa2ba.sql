-- Create materialized view for influence-interest heatmap
CREATE MATERIALIZED VIEW crm_luker.vw_influ_int_heat AS
SELECT nivel_influencia AS y,               -- 1-5
       nivel_interes    AS x,               -- 1-5
       COUNT(*)         AS total,
       ARRAY_AGG(nombre_actor ORDER BY nombre_actor LIMIT 3) AS top3,
       CASE
         WHEN nivel_influencia >= 4 AND nivel_interes >= 4 THEN 'Gestionar de cerca'
         WHEN nivel_influencia >= 4 AND nivel_interes <= 2 THEN 'Mantener satisfechos'
         WHEN nivel_influencia <= 2 AND nivel_interes >= 4 THEN 'Mantener informados'
         ELSE 'Monitorear'
       END AS estrategia
FROM   public.actors
WHERE  nivel_influencia IS NOT NULL AND nivel_interes IS NOT NULL
GROUP  BY x, y;

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS crm_luker;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW crm_luker.vw_influ_int_heat;