
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { REDES_ALUMNI_OPTIONS } from '@/components/contacts/types';

export interface ContactsFilterState {
  redAlumni: string[];
  equipo: string[];
  actor: string[];
  sector: string[];
  nivelDireccion: string[];
}

export const EQUIPO_OPTIONS = [
  'Administrativo y Jurídico',
  'Programas',
  'Conocimiento e Incidencia',
  'Gerencia',
] as const;

export const useFilteredContactsReport = (filters: ContactsFilterState) => {
  return useQuery({
    queryKey: ['filtered-contacts-report', filters],
    queryFn: async () => {
      let query = supabase
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
            anios_alianza
          )
        `)
        .order('nombre', { ascending: true });

      if (filters.actor.length > 0) {
        query = query.in('actor_id', filters.actor);
      }

      if (filters.redAlumni.length > 0) {
        query = query.overlaps('tipo_contacto', filters.redAlumni);
      }

      if (filters.nivelDireccion && filters.nivelDireccion.length > 0) {
        query = query.in('nivel_direccion', filters.nivelDireccion as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filtered = data || [];

      if (filters.sector.length > 0) {
        filtered = filtered.filter(c => {
          const sector = (c.actors as any)?.sector_actor;
          return sector && filters.sector.includes(sector);
        });
      }


      if (filters.equipo.length > 0) {
        const { data: teamMembers } = await (supabase as any)
          .from('team_members_directory')
          .select('id, area')
          .in('area', filters.equipo) as { data: { id: string; area: string }[] | null };

        if (teamMembers && teamMembers.length > 0) {
          const teamMemberIds = new Set(teamMembers.map(tm => tm.id));
          filtered = filtered.filter(contact => {
            const responsables = contact.responsable_seguimiento as string[] | null;
            if (!responsables || responsables.length === 0) return false;
            return responsables.some(id => teamMemberIds.has(id));
          });
        } else {
          filtered = [];
        }
      }

      const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

      const contactRecords = filtered.map(contact => {
        const actor = contact.actors as any;
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
        };
      });

      // Fetch team members with matching red_alumni to merge into results
      let teamRecords: any[] = [];
      if (filters.redAlumni.length > 0) {
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('id, nombre, apellidos, cargo, correo, celular, area, red_alumni');

        if (teamMembers) {
          const matchingTeam = teamMembers.filter(tm => {
            const redAlumni = (tm as any).red_alumni as string[] | null;
            if (!redAlumni || redAlumni.length === 0) return false;
            return filters.redAlumni.some(f => redAlumni.includes(f));
          });

          teamRecords = matchingTeam.map(tm => ({
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
            updated_at: null,
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
          }));
        }
      }

      // If filtering by actor only (no redAlumni), don't include team members
      const combined = [...contactRecords, ...teamRecords];

      return combined.sort((a, b) => {
        const actorCmp = collator.compare(a.actorNombre, b.actorNombre);
        if (actorCmp !== 0) return actorCmp;
        return collator.compare(a.nombreCompleto, b.nombreCompleto);
      });
    },
    enabled: filters.redAlumni.length > 0 || filters.equipo.length > 0 || filters.actor.length > 0 || filters.sector.length > 0 || (filters.nivelDireccion?.length ?? 0) > 0,
  });
};
