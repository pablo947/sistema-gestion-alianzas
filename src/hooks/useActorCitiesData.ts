
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActorCitiesData = () => {
  return useQuery({
    queryKey: ['actor-locations-data'],
    queryFn: async () => {
      const { data: actors } = await supabase
        .from('actors')
        .select('departamento_actuacion, municipio_actuacion, nombre_actor');

      if (!actors) return [];

      // Group actors by location (prioritize municipios over departamentos)
      const locationsData: Record<string, { count: number; actors: string[] }> = {};

      actors.forEach(actor => {
        const locations = new Set<string>();
        
        // Prioritize municipios - only use departamentos if no municipios are specified
        if (actor.municipio_actuacion && Array.isArray(actor.municipio_actuacion) && actor.municipio_actuacion.length > 0) {
          // If actor has municipios, only count by municipios
          actor.municipio_actuacion.forEach(mun => locations.add(mun));
        } else if (actor.departamento_actuacion && Array.isArray(actor.departamento_actuacion) && actor.departamento_actuacion.length > 0) {
          // Only use departamentos if no municipios are specified
          actor.departamento_actuacion.forEach(dept => locations.add(dept));
        }

        // Count actor for each unique location
        locations.forEach(location => {
          if (!locationsData[location]) {
            locationsData[location] = { count: 0, actors: [] };
          }
          locationsData[location].count++;
          locationsData[location].actors.push(actor.nombre_actor);
        });
      });

      // Convert to array format for charts and limit to top 10
      return Object.entries(locationsData)
        .map(([city, data]) => ({
          city,
          count: data.count,
          actors: data.actors
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Show only top 10 locations
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
