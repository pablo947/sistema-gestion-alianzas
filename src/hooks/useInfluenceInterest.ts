import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInfluenceInterest = () => {
  return useQuery({
    queryKey: ['influence-interest'],
    queryFn: async () => {
      // Use RPC function to access the materialized view
      const { data, error } = await supabase.rpc('get_influence_interest_data');
      
      if (error) {
        console.error('Error fetching influence-interest data:', error);
        return [];
      }
      
      // Transform data to match HeatMap component interface
      return (data || []).map((item: any) => ({
        x: item.x,
        y: item.y,
        total: item.total,
        actores: item.top3 || [],
        estrategia: item.estrategia
      }));
    }
  });
};