
-- Step 1: Remove actor_projects associations for "Generación R" and "Formare"
DELETE FROM actor_projects 
WHERE project_id IN (
  '3098ddc2-140d-4179-a722-d6d996a54cfc',
  'd8072887-58ae-4008-842f-9defeb9ae742'
);

-- Step 2: Delete contacts of actors that now have NO project associations
DELETE FROM contacts 
WHERE actor_id IN (
  SELECT a.actor_id FROM actors a
  WHERE NOT EXISTS (
    SELECT 1 FROM actor_projects ap WHERE ap.actor_id = a.actor_id
  )
);

-- Delete those orphaned actors
DELETE FROM actors 
WHERE actor_id IN (
  SELECT a.actor_id FROM actors a
  WHERE NOT EXISTS (
    SELECT 1 FROM actor_projects ap WHERE ap.actor_id = a.actor_id
  )
);

-- Step 3: Clean relation types
UPDATE actors 
SET tipo_relacion = array_remove(tipo_relacion, 'Cliente Formare')
WHERE tipo_relacion IS NOT NULL AND 'Cliente Formare' = ANY(tipo_relacion);

UPDATE actors 
SET tipo_relacion = array_remove(tipo_relacion, 'Proveedor Estratégico')
WHERE tipo_relacion IS NOT NULL AND 'Proveedor Estratégico' = ANY(tipo_relacion);

-- Step 4: Delete actors whose tipo_relacion is now empty
DELETE FROM contacts 
WHERE actor_id IN (
  SELECT actor_id FROM actors 
  WHERE tipo_relacion = '{}' OR tipo_relacion IS NULL
);

DELETE FROM actor_projects 
WHERE actor_id IN (
  SELECT actor_id FROM actors 
  WHERE tipo_relacion = '{}' OR tipo_relacion IS NULL
);

DELETE FROM actors 
WHERE tipo_relacion = '{}' OR tipo_relacion IS NULL;

-- Step 5: Final cleanup - actors with no projects AND no relation types
DELETE FROM contacts 
WHERE actor_id IN (
  SELECT a.actor_id FROM actors a
  WHERE NOT EXISTS (
    SELECT 1 FROM actor_projects ap WHERE ap.actor_id = a.actor_id
  )
  AND (a.tipo_relacion IS NULL OR a.tipo_relacion = '{}')
);

DELETE FROM actor_projects 
WHERE actor_id IN (
  SELECT a.actor_id FROM actors a
  WHERE NOT EXISTS (
    SELECT 1 FROM actor_projects ap WHERE ap.actor_id = a.actor_id
  )
  AND (a.tipo_relacion IS NULL OR a.tipo_relacion = '{}')
);

DELETE FROM actors 
WHERE actor_id IN (
  SELECT a.actor_id FROM actors a
  WHERE NOT EXISTS (
    SELECT 1 FROM actor_projects ap WHERE ap.actor_id = a.actor_id
  )
  AND (a.tipo_relacion IS NULL OR a.tipo_relacion = '{}')
);
