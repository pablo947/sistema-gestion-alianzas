
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useIndividualProjectReport = (projectId: string | null) => {
  return useQuery({
    queryKey: ['individual-program-report', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('programs')
        .select(`
          programa_id,
          nombre,
          objetivos,
          resultados,
          eje_estrategico,
          estado,
          fecha_inicio,
          fecha_cierre,
          presupuesto_total,
          presupuesto_ejecutado,
          metas,
          avance,
          created_at,
          actor_programs (
            actor_id,
            actors (
              nombre_actor,
              sector_actor,
              ciudad_sede,
              nivel_influencia,
              nivel_interes,
              tipo_relacion
            )
          )
        `)
        .eq('programa_id', projectId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching individual program report:', error);
        throw error;
      }
      
      if (!data) return null;
      
      const budgetExecution = (data as any).presupuesto_total > 0 
        ? Math.round(((data as any).presupuesto_ejecutado / (data as any).presupuesto_total) * 100) 
        : 0;
      
      const indicators = Array.isArray((data as any).metas) ? (data as any).metas : [];
      const totalIndicators = indicators.length;
      const completedIndicators = indicators.filter((ind: any) => {
        const target = parseFloat(ind.meta) || 0;
        const progress = parseFloat(ind.avance) || 0;
        return target > 0 && progress >= target;
      }).length;
      
      const indicatorCompletion = totalIndicators > 0 
        ? Math.round((completedIndicators / totalIndicators) * 100) 
        : 0;

      const actors = (data as any).actor_programs?.map((ap: any) => ap.actors).filter(Boolean) || [];
      
      return {
        ...(data as any),
        proyecto_id: (data as any).programa_id,
        budgetExecution,
        totalIndicators,
        completedIndicators,
        indicatorCompletion,
        relatedActors: actors
      };
    },
    enabled: !!projectId,
  });
};
