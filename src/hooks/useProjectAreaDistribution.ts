import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeEje } from '@/lib/ejes';

export const useProjectAreaDistribution = () => {
  return useQuery({
    queryKey: ['program-eje-distribution'],
    queryFn: async () => {
      const { data: programs } = await supabase
        .from('programs')
        .select('eje_estrategico, nombre')
        .not('eje_estrategico', 'is', null);

      if (!programs) return [];

      const ejeData = programs.reduce((acc: Record<string, { count: number; projects: string[] }>, program: any) => {
        const eje = normalizeEje(program.eje_estrategico) || program.eje_estrategico;
        if (!eje) return acc;
        if (!acc[eje]) {
          acc[eje] = { count: 0, projects: [] };
        }
        acc[eje].count++;
        acc[eje].projects.push(program.nombre);
        return acc;
      }, {});

      return Object.entries(ejeData).map(([eje, data]) => ({
        eje,
        area: eje, // backward compat
        count: data.count,
        projects: data.projects,
      })).sort((a, b) => b.count - a.count);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
