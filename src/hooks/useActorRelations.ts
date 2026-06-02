import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActorRelations = () => {
  return useQuery({
    queryKey: ['actor-relations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('actors')
        .select('tipo_relacion, alcance_territorial')
        .not('tipo_relacion', 'is', null)
        .not('alcance_territorial', 'is', null);
      
      // Process each actor and their multiple relations
      const relationCounts: { [key: string]: number } = {};
      
      data?.forEach(actor => {
        const tiposRelacion = Array.isArray(actor.tipo_relacion) 
          ? actor.tipo_relacion 
          : [actor.tipo_relacion];
        
        tiposRelacion.forEach(tipo => {
          if (tipo) {
            relationCounts[tipo] = (relationCounts[tipo] || 0) + 1;
          }
        });
      });

      // Convert to chart format
      const chartData = Object.entries(relationCounts).map(([tipo, count]) => ({
        label: tipo,
        stack: 'count',
        total: count
      }));

      return chartData.sort((a, b) => b.total - a.total);
    }
  });
};