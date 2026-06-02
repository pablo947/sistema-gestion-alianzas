import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type TeamDirectoryEntry = { id: string; nombre: string; apellidos: string; area?: string };

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('team_members_directory')
        .select('id, nombre, apellidos')
        .order('nombre');
      
      if (error) throw error;
      return (data || []) as TeamDirectoryEntry[];
    }
  });
}

export function useTeamMemberNames(memberIds: string[]) {
  const { data: teamMembers } = useTeamMembers();
  
  if (!teamMembers || !memberIds?.length) return [];
  
  return memberIds
    .map(id => teamMembers.find(member => member.id === id))
    .filter(Boolean)
    .map(member => `${member!.nombre} ${member!.apellidos}`);
}