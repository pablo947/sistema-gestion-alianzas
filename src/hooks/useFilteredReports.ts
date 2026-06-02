
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportFilters {
  municipio?: string[];
  tipoRelacion?: string[];
  proyecto?: string[];
  actor?: string[];
  eje?: string[];
  sector?: string[];
  sinContactos?: boolean;
  estrategia?: string[];
}

export const useFilteredReports = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['filtered-reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('actors')
        .select(`
          *,
          contacts(*),
          actor_programs(
            programs(*)
          )
        `);

      if (filters.municipio && filters.municipio.length > 0) {
        query = query.overlaps('municipio_actuacion', filters.municipio);
      }

      if (filters.tipoRelacion && filters.tipoRelacion.length > 0) {
        query = query.overlaps('tipo_relacion', filters.tipoRelacion);
      }

      if (filters.actor && filters.actor.length > 0) {
        query = query.in('actor_id', filters.actor);
      }

      if (filters.sector && filters.sector.length > 0) {
        query = query.in('sector_actor', filters.sector);
      }

      const { data: actors, error } = await query;

      if (error) {
        console.error('Error fetching filtered reports:', error);
        throw error;
      }

      let filteredActors: any[] = actors || [];
      if (filters.proyecto && filters.proyecto.length > 0) {
        filteredActors = (actors as any[])?.filter(actor =>
          actor.actor_programs?.some((ap: any) =>
            filters.proyecto?.includes(ap.programs?.programa_id)
          )
        ) || [];
      }

      if (filters.eje && filters.eje.length > 0) {
        filteredActors = filteredActors.filter(actor =>
          actor.actor_programs?.some((ap: any) =>
            filters.eje?.includes(ap.programs?.eje_estrategico)
          )
        );
      }

      if (filters.sinContactos) {
        filteredActors = filteredActors.filter(actor =>
          !actor.contacts || actor.contacts.length === 0
        );
      }

      if (filters.estrategia && filters.estrategia.length > 0) {
        filteredActors = filteredActors.filter(actor => {
          const influencia = actor.nivel_influencia;
          const interes = actor.nivel_interes;
          if (!influencia || !interes) return false;

          let actorStrategy = '';
          if (influencia >= 4 && interes >= 4) actorStrategy = 'Gestionar de Cerca';
          else if (influencia <= 2 && interes >= 4) actorStrategy = 'Mantener Satisfechos';
          else if (influencia >= 4 && interes <= 2) actorStrategy = 'Mantener Informados';
          else actorStrategy = 'Monitorear';

          return filters.estrategia!.includes(actorStrategy);
        });
      }

      return filteredActors;
    },
    enabled: Object.entries(filters).some(([key, value]) => {
      if (key === 'sinContactos') return value === true;
      return Array.isArray(value) && value.length > 0;
    })
  });
};
