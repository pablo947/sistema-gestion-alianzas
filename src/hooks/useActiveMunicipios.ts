
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActiveMunicipios = () => {
  return useQuery({
    queryKey: ['active-municipios'],
    queryFn: async () => {
      const { data: actors } = await supabase
        .from('actors')
        .select('municipio_actuacion');

      if (!actors) return [];

      // Get all unique municipalities where actors are currently active
      const allMunicipios = new Set<string>();
      
      actors.forEach(actor => {
        if (actor.municipio_actuacion && Array.isArray(actor.municipio_actuacion)) {
          actor.municipio_actuacion.forEach(municipio => {
            if (municipio && municipio.trim()) {
              allMunicipios.add(municipio);
            }
          });
        }
      });

      // Return sorted array of unique municipalities
      return Array.from(allMunicipios).sort();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
