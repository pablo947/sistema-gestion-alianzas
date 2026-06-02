
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActorsList = () => {
  return useQuery({
    queryKey: ['actors-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('actor_id, nombre_actor, correo_entidad')
        .order('nombre_actor');
      
      if (error) {
        console.error('Error fetching actors list:', error);
        throw error;
      }
      
      return data || [];
    },
  });
};
