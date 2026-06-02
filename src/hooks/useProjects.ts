import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjects = () => {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('programa_id, nombre')
        .order('nombre');
      
      if (error) {
        console.error('Error fetching programs:', error);
        throw error;
      }
      
      return data || [];
    },
  });
};

export const useActorProjects = (actorId?: string) => {
  return useQuery({
    queryKey: ['actor-programs', actorId],
    queryFn: async () => {
      if (!actorId) return [];
      
      const { data, error } = await supabase
        .from('actor_programs')
        .select(`
          program_id,
          programs (
            programa_id,
            nombre,
            area,
            estado
          )
        `)
        .eq('actor_id', actorId);
      
      if (error) {
        console.error('Error fetching actor programs:', error);
        throw error;
      }
      
      return data?.map(item => item.programs).filter(Boolean) || [];
    },
    enabled: !!actorId,
  });
};

export const useProjectActors = (projectId?: string) => {
  return useQuery({
    queryKey: ['program-actors', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('actor_programs')
        .select(`
          actor_id,
          actors (
            actor_id,
            nombre_actor,
            sector_actor,
            tipo_relacion
          )
        `)
        .eq('program_id', projectId);
      
      if (error) {
        console.error('Error fetching program actors:', error);
        throw error;
      }
      
      return data?.map(item => item.actors).filter(Boolean) || [];
    },
    enabled: !!projectId,
  });
};
