import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useContactsReport = () => {
  return useQuery({
    queryKey: ['contacts-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          contact_id,
          nombre,
          apellidos,
          cargo,
          correo,
          telefono,
          ciudad,
          tipo_contacto,
          responsable_seguimiento,
          notas,
          actor_id,
          updated_at,
          nivel_direccion,
          nivel_direccion_auto,
          actors (
            nombre_actor,
            sector_actor,
            ciudad_sede,
            tipo_relacion,
            municipio_actuacion,
            departamento_actuacion,
            telefono_entidad,
            direccion_entidad,
            correo_entidad,
            anios_alianza,
            actor_programs (
              programs (
                nombre,
                eje_estrategico
              )
            )

          )
        `)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching contacts report:', error);
        throw error;
      }

      const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
      const mapped = data?.map((contact: any) => {
        const actor = contact.actors as any;
        const programs = actor?.actor_programs?.map((ap: any) => ap.programs).filter(Boolean) || [];
        const uniqueEjes = [...new Set(programs.map((p: any) => p?.eje_estrategico).filter(Boolean))] as string[];
        const uniqueProyectos = [...new Set(programs.map((p: any) => p?.nombre).filter(Boolean))] as string[];

        return {
          ...contact,
          _source: 'contact' as const,
          nombreCompleto: `${contact.nombre || ''} ${contact.apellidos || ''}`.trim(),
          actorNombre: actor?.nombre_actor || 'Sin actor',
          actorSector: actor?.sector_actor || '',
          actorCiudad: actor?.ciudad_sede || '',
          municipios: Array.isArray(actor?.municipio_actuacion) ? actor.municipio_actuacion.join(', ') : '',
          departamentos: Array.isArray(actor?.departamento_actuacion) ? actor.departamento_actuacion.join(', ') : '',
          actorTipoRelacion: Array.isArray(actor?.tipo_relacion) ? actor.tipo_relacion.join(', ') : '',
          actorTelefono: actor?.telefono_entidad || '',
          actorDireccion: actor?.direccion_entidad || '',
          actorCorreo: actor?.correo_entidad || '',
          actorAniosAlianza: Array.isArray(actor?.anios_alianza) ? actor.anios_alianza.join(', ') : '',
          ejes: uniqueEjes.join(', '),
          proyectos: uniqueProyectos.join(', '),
        };
      }) || [];


      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('id, nombre, apellidos, cargo, correo, celular, area, red_alumni, updated_at');

      const teamRecords = (teamMembers || [])
        .filter(tm => {
          const redAlumni = (tm as any).red_alumni as string[] | null;
          return redAlumni && redAlumni.length > 0;
        })
        .map(tm => ({
          contact_id: `team-${tm.id}`,
          nombre: tm.nombre,
          apellidos: tm.apellidos,
          cargo: tm.cargo,
          correo: tm.correo || '',
          telefono: tm.celular || '',
          ciudad: '',
          tipo_contacto: (tm as any).red_alumni || [],
          responsable_seguimiento: [],
          notas: '',
          actor_id: null,
          updated_at: tm.updated_at,
          _source: 'team' as const,
          nombreCompleto: `${tm.nombre || ''} ${tm.apellidos || ''}`.trim(),
          actorNombre: 'Fundación Luker',
          actorSector: '',
          actorCiudad: '',
          municipios: '',
          departamentos: '',
          actorTipoRelacion: '',
          actorTelefono: '',
          actorDireccion: '',
          actorCorreo: '',
          actorAniosAlianza: '',
          ejes: '',
          proyectos: '',

        }));

      const combined = [...mapped, ...teamRecords];

      return combined.sort((a, b) => {
        const actorCmp = collator.compare(a.actorNombre, b.actorNombre);
        if (actorCmp !== 0) return actorCmp;
        return collator.compare(a.nombreCompleto, b.nombreCompleto);
      });
    },
  });
};
