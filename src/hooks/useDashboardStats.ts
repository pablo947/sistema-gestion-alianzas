import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: actors } = await supabase
        .from('actors')
        .select('actor_id');
      
      const { data: programs } = await supabase
        .from('programs')
        .select('programa_id, estado, eje_estrategico');
      
      const { data: contacts } = await supabase
        .from('contacts')
        .select('contact_id');

      const activePrograms = programs?.filter(p => p.estado === 'Ejecución')?.length || 0;
      const plannedPrograms = programs?.filter(p => p.estado === 'Planificado')?.length || 0;
      const completedPrograms = programs?.filter(p => p.estado === 'Finalizado')?.length || 0;
      const totalPrograms = programs?.length || 0;
      const completionRate = totalPrograms > 0 ? Math.round((completedPrograms / totalPrograms) * 100) : 0;

      return {
        totalActors: actors?.length || 0,
        totalContacts: contacts?.length || 0,
        activeProjects: activePrograms,
        plannedProjects: plannedPrograms,
        completedProjects: completedPrograms,
        totalProjects: totalPrograms,
        completionRate,
        projects: programs || []
      };
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
