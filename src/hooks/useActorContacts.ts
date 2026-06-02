import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActorContacts = (actorId: string | null) => {
  return useQuery({
    queryKey: ['actor-contacts', actorId],
    queryFn: async () => {
      if (!actorId) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('actor_id', actorId)
        .order('nombre', { ascending: true });
      
      if (error) {
        console.error('Error fetching actor contacts:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!actorId
  });
};