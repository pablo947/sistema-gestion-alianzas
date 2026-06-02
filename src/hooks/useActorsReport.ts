
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActorsReport = () => {
  return useQuery({
    queryKey: ['actors-report'],
    queryFn: async () => {
      const { data: teamData } = await supabase
        .from('team_members')
        .select('id, nombre, apellidos');
      const responsableMap = new Map(
        (teamData || []).map((tm: any) => [tm.id, `${tm.nombre || ''} ${tm.apellidos || ''}`.trim()])
      );


      const { data, error } = await supabase
        .from('actors')
        .select(`
          actor_id,
          nombre_actor,
          sector_actor,
          ciudad_sede,
          alcance_territorial,
          tipo_relacion,
          estado_relacion,
          responsable_seguimiento,
          municipio_actuacion,
          departamento_actuacion,
          nivel_influencia,
          nivel_interes,
          telefono_entidad,
          direccion_entidad,
          correo_entidad,
          anios_alianza,
          importance_internal,
          importance_sna,
          importance_index,
          importance_updated_at,

          actor_programs (
            program_id,
            programs (
              nombre,
              eje_estrategico
            )
          )
        `)
        .order('nombre_actor');
      
      if (error) {
        console.error('Error fetching actors report:', error);
        throw error;
      }
      
      return data?.map((actor: any) => {
        const getInfluenceInterestStrategy = (influence: number | null, interest: number | null) => {
          if (!influence || !interest) return 'Sin clasificar';
          if (influence >= 4 && interest >= 4) return 'Gestionar de cerca';
          if (influence <= 2 && interest >= 4) return 'Mantener satisfechos';
          if (influence >= 4 && interest <= 2) return 'Mantener informados';
          if (influence <= 2 && interest <= 2) return 'Monitorear';
          return 'Monitorear';
        };

        const strategy = getInfluenceInterestStrategy(actor.nivel_influencia, actor.nivel_interes);
        const programs = actor.actor_programs?.map((ap: any) => ap.programs?.nombre).filter(Boolean) || [];
        const municipalities = Array.isArray(actor.municipio_actuacion) ? actor.municipio_actuacion.join(', ') : '';
        const departments = Array.isArray(actor.departamento_actuacion) ? actor.departamento_actuacion.join(', ') : '';
        const relationTypes = Array.isArray(actor.tipo_relacion) ? actor.tipo_relacion.join(', ') : actor.tipo_relacion || '';
        const responsables = Array.isArray(actor.responsable_seguimiento)
          ? actor.responsable_seguimiento.map((id: string) => responsableMap.get(id) || '').filter(Boolean).join(', ')
          : '';
        
        return {
          ...actor,
          strategy,
          projectsInvolved: programs.join(', '),
          municipalities,
          departments,
          relationTypes,
          responsables,
          aniosAlianza: Array.isArray(actor.anios_alianza) ? actor.anios_alianza.join(', ') : '',
        };
      }) || [];
    },
  });
};
