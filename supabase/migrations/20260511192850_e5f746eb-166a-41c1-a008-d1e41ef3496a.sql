UPDATE public.actors SET sector_actor = CASE sector_actor
  WHEN 'Empresarial' THEN 'Privado'
  WHEN 'Gremio Empresarial' THEN 'Gremio empresarial'
  WHEN 'Organismos Internacionales' THEN 'Organismos internacionales'
  WHEN 'Medio de Comunicación' THEN 'Medio de comunicación'
  WHEN 'Redes y Plataformas Multiactor' THEN 'Redes y plataformas multiactor'
  WHEN 'Académico' THEN 'Académico — Academia (Otros)'
  WHEN 'Fundaciones y Corporaciones de la Sociedad Civil' THEN 'Fundaciones y corporaciones de la sociedad civil'
  ELSE sector_actor
END
WHERE sector_actor IN (
  'Empresarial','Gremio Empresarial','Organismos Internacionales','Medio de Comunicación',
  'Redes y Plataformas Multiactor','Académico','Fundaciones y Corporaciones de la Sociedad Civil'
);