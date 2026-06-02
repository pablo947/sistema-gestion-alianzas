import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectsFilterState {
  ejeEstrategico: string[];
  proyecto: string[];
  actor: string[];
  anio: number[];
}

export const useFilteredProjectsReport = (filters: ProjectsFilterState) => {
  return useQuery({
    queryKey: ['filtered-programs-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('programs')
        .select(`
          *,
          actor_programs (
            actor_id,
            actors (
              actor_id,
              nombre_actor,
              sector_actor,
              nivel_influencia,
              nivel_interes,
              anios_alianza
            )
          )
        `);

      if (filters.ejeEstrategico && filters.ejeEstrategico.length > 0) {
        query = query.in('eje_estrategico', filters.ejeEstrategico);
      }

      if (filters.proyecto && filters.proyecto.length > 0) {
        query = query.in('programa_id', filters.proyecto);
      }

      const { data, error } = await query;
      if (error) throw error;

      let programs: any[] = data || [];

      if (filters.actor && filters.actor.length > 0) {
        programs = programs.filter((p: any) =>
          p.actor_programs?.some((ap: any) => filters.actor.includes(ap.actor_id))
        );
      }

      if (filters.anio && filters.anio.length > 0) {
        programs = programs.filter((p: any) => {
          const start = p.fecha_inicio ? new Date(p.fecha_inicio).getFullYear() : null;
          const end = p.fecha_cierre ? new Date(p.fecha_cierre).getFullYear() : new Date().getFullYear();
          if (start !== null) {
            return filters.anio.some(y => y >= start && y <= end);
          }
          return false;
        });
      }

      return programs;
    },
    enabled: Object.entries(filters).some(([_, v]) => Array.isArray(v) && v.length > 0),
  });
};
