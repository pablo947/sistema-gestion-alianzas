
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useIndividualActorReport = (actorId: string | null) => {
  return useQuery({
    queryKey: ['individual-actor-report', actorId],
    queryFn: async () => {
      if (!actorId) return null;

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
          actor_programs (
            program_id,
            programs (
              nombre,
              eje_estrategico,
              estado,
              presupuesto_total,
              presupuesto_ejecutado,
              fecha_inicio,
              fecha_cierre
            )
          )
        `)
        .eq('actor_id', actorId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching individual actor report:', error);
        throw error;
      }
      
      if (!data) return null;
      
      const getInfluenceInterestStrategy = (influence: number | null, interest: number | null) => {
        if (!influence || !interest) return 'Sin clasificar';
        if (influence >= 4 && interest >= 4) return 'Gestionar de cerca';
        if (influence <= 2 && interest >= 4) return 'Mantener satisfechos';
        if (influence >= 4 && interest <= 2) return 'Mantener informados';
        if (influence <= 2 && interest <= 2) return 'Monitorear';
        return 'Monitorear';
      };

      const strategy = getInfluenceInterestStrategy(data.nivel_influencia, data.nivel_interes);
      const programs = (data as any).actor_programs?.map((ap: any) => ap.programs).filter(Boolean) || [];
      const municipalities = Array.isArray(data.municipio_actuacion) ? data.municipio_actuacion.join(', ') : '';
      const departments = Array.isArray(data.departamento_actuacion) ? data.departamento_actuacion.join(', ') : '';
      const relationTypes = Array.isArray(data.tipo_relacion) ? data.tipo_relacion.join(', ') : data.tipo_relacion || '';
      const responsables = Array.isArray(data.responsable_seguimiento)
        ? data.responsable_seguimiento.map((id: string) => responsableMap.get(id) || '').filter(Boolean).join(', ')
        : '';
      
      return {
        ...data,
        strategy,
        relatedProjects: programs,
        municipalities,
        departments,
        relationTypes,
        responsables
      };
    },
    enabled: !!actorId,
  });
};
