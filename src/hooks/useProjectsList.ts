
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectsList = () => {
  return useQuery({
    queryKey: ['programs-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('programa_id, nombre')
        .order('nombre');
      
      if (error) {
        console.error('Error fetching programs list:', error);
        throw error;
      }
      
      return data || [];
    },
  });
};
