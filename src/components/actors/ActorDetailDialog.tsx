import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Actor } from './types';
import { useActorProjects } from '@/hooks/useProjects';
import { usePermissions } from '@/hooks/usePermissions';
import { Edit2, Users, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { RelatedContactsDialog } from './RelatedContactsDialog';
import {
  NIVEL_INFLUENCIA_PODER_OPCIONES,
  NIVEL_INTERES_OPCIONES
} from './constants';

interface ActorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: Actor | null;
  onEdit: () => void;
}

export function ActorDetailDialog({ open, onOpenChange, actor, onEdit }: ActorDetailDialogProps) {
  const [showRelatedContacts, setShowRelatedContacts] = React.useState(false);
  const { data: actorProjects } = useActorProjects(actor?.actor_id);
  const { canEditActors, canCreatePendingActors } = usePermissions();
  
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, nombre, apellidos')
        .order('nombre');
      if (error) throw error;
      return data;
    }
  });

  if (!actor) return null;

  const tipoRelacion = Array.isArray(actor.tipo_relacion) 
    ? actor.tipo_relacion 
    : actor.tipo_relacion ? [actor.tipo_relacion] : [];

  const aniosAlianza = (actor as any).anios_alianza || [];
  const responsables = (actor as any).responsable_seguimiento || [];
  
  const getInfluenciaTitle = (val?: number | null) => 
    NIVEL_INFLUENCIA_PODER_OPCIONES.find(o => o.value === val)?.title || 'No especificado';
  
  const getInteresTitle = (val?: number | null) => 
    NIVEL_INTERES_OPCIONES.find(o => o.value === val)?.title || 'No especificado';

  const canRequestModification = canEditActors() || canCreatePendingActors();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            {actor.nombre_actor}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {actor.sector_actor} • {actor.ciudad_sede || 'Ciudad no especificada'} ({actor.alcance_territorial || 'Alcance no especificado'})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {/* Tipos de Relación */}
          {tipoRelacion.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Tipos de Relación</h3>
              <div className="flex gap-2 flex-wrap">
                {tipoRelacion.map((t: string) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Contacto</h3>
               <div className="space-y-2 text-sm">
                 {(actor as any).telefono_entidad && (
                   <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {(actor as any).telefono_entidad}</div>
                 )}
                 {(actor as any).correo_entidad && (
                   <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {(actor as any).correo_entidad}</div>
                 )}
                 {(actor as any).direccion_entidad && (
                   <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {(actor as any).direccion_entidad}</div>
                 )}
                 {!((actor as any).telefono_entidad) && !((actor as any).correo_entidad) && !((actor as any).direccion_entidad) && (
                   <span className="text-muted-foreground italic">No hay información de contacto.</span>
                 )}
               </div>
            </div>
            
            {/* Matriz Influencia / Interés */}
            <div>
               <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Evaluación (Matriz)</h3>
               <div className="space-y-2 text-sm">
                 <div><span className="font-medium">Influencia:</span> {getInfluenciaTitle(actor.nivel_influencia)}</div>
                 <div><span className="font-medium">Interés:</span> {getInteresTitle(actor.nivel_interes)}</div>
               </div>
            </div>
          </div>

          {/* Proyectos y Años */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Proyectos Vinculados</h3>
               {actorProjects && actorProjects.length > 0 ? (
                 <ul className="list-disc pl-5 text-sm space-y-1">
                   {actorProjects.map((p: any) => (
                     <li key={p.programa_id}>{p.nombre}</li>
                   ))}
                 </ul>
               ) : (
                 <span className="text-muted-foreground text-sm italic">Ningún proyecto vinculado.</span>
               )}
             </div>

             <div>
               <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Años de Alianza Activa</h3>
               {aniosAlianza.length > 0 ? (
                 <div className="flex gap-1.5 flex-wrap">
                   {aniosAlianza.sort().map((y: number) => (
                     <Badge key={y} variant="outline" className="bg-muted/50">{y}</Badge>
                   ))}
                 </div>
               ) : (
                 <span className="text-muted-foreground text-sm italic">No hay registros.</span>
               )}
             </div>
          </div>

          {/* Responsables */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Responsables de Seguimiento (Equipo)</h3>
            <div className="flex gap-2 flex-wrap">
              {responsables.length > 0 ? (
                responsables.map((id: string) => {
                  const member = teamMembers.find(m => m.id === id);
                  return (
                    <Badge key={id} variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
                      {member ? `${member.nombre} ${member.apellidos}` : id}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-muted-foreground text-sm italic">Sin asignar.</span>
              )}
            </div>
          </div>

          {/* Acciones e integraciones */}
          <div className="pt-6 mt-6 border-t flex justify-between items-center">
            <Button 
              variant="secondary"
              onClick={() => setShowRelatedContacts(true)}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Contactos Relacionados
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              {canRequestModification && (
                <Button onClick={onEdit} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                  <Edit2 className="h-4 w-4" />
                  Solicitar Modificación / Editar
                </Button>
              )}
            </div>
          </div>
        </div>

        <RelatedContactsDialog
          open={showRelatedContacts}
          onOpenChange={setShowRelatedContacts}
          actorId={actor.actor_id}
          actorName={actor.nombre_actor}
        />
      </DialogContent>
    </Dialog>
  );
}
