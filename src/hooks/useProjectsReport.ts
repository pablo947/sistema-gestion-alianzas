
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectsReport = () => {
  return useQuery({
    queryKey: ['programs-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          programa_id,
          nombre,
          objetivos,
          resultados,
          area,
          eje_estrategico,
          estado,
          fecha_inicio,
          fecha_cierre,
          presupuesto_total,
          presupuesto_ejecutado,
          metas,
          avance,
          created_at,
          updated_at,
          actor_programs (
            actor_id,
            actors (
              nombre_actor,
              sector_actor
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching programs report:', error);
        throw error;
      }
      
      return data?.map((program: any) => {
        const budgetExecution = program.presupuesto_total > 0 
          ? Math.round((program.presupuesto_ejecutado / program.presupuesto_total) * 100) 
          : 0;
        
        const indicators = Array.isArray(program.metas) ? program.metas : [];
        const totalIndicators = indicators.length;
        const completedIndicators = indicators.filter((ind: any) => {
          const target = parseFloat(ind.meta) || 0;
          const progress = parseFloat(ind.avance_actual) || 0;
          return target > 0 && progress >= target;
        }).length;
        
        const indicatorCompletion = totalIndicators > 0 
          ? Math.round((completedIndicators / totalIndicators) * 100) 
          : 0;

        const actors = program.actor_programs?.map((ap: any) => ap.actors?.nombre_actor).filter(Boolean) || [];
        
        return {
          ...program,
          budgetExecution,
          totalIndicators,
          completedIndicators,
          indicatorCompletion,
          actorsInvolved: actors.join(', ')
        };
      }) || [];
    },
  });
};
