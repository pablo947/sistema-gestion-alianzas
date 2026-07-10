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
import { Contact } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { Edit2, MapPin, Mail, Phone, Briefcase } from 'lucide-react';

interface ContactDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  actorName?: string;
  onEdit: () => void;
}

export function ContactDetailDialog({ open, onOpenChange, contact, actorName, onEdit }: ContactDetailDialogProps) {
  const { canEditContacts } = usePermissions();
  
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

  const canRequestModification = true; // Anyone seeing this details view in these modules has right to request

  if (!contact) return null;

  const tipoContacto = Array.isArray(contact.tipo_contacto) 
    ? contact.tipo_contacto 
    : contact.tipo_contacto ? [contact.tipo_contacto] : [];

  const responsables = (contact as any).responsable_seguimiento || [];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            {contact.nombre} {contact.apellidos}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground flex flex-col gap-1 mt-1">
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {contact.cargo || 'Sin cargo'} 
              {actorName ? ` en ${actorName}` : ''}
            </span>
            <span className="flex items-center gap-2">
               Nivel de Dirección: <Badge variant="outline">{contact.nivel_direccion || 'Sin clasificar'}</Badge>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {/* Tipos de Contacto */}
          {tipoContacto.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Tipos de Contacto</h3>
              <div className="flex gap-2 flex-wrap">
                {tipoContacto.map((t: string) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Detalles</h3>
               <div className="space-y-2 text-sm">
                 {contact.telefono && (
                   <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {contact.telefono}</div>
                 )}
                 {contact.correo && (
                   <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {contact.correo}</div>
                 )}
                 {contact.ciudad && (
                   <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {contact.ciudad}</div>
                 )}
                 {!contact.telefono && !contact.correo && !contact.ciudad && (
                   <span className="text-muted-foreground italic">No hay información de contacto registrada.</span>
                 )}
               </div>
            </div>
            
            {/* Responsables */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Responsables de Seguimiento</h3>
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
          </div>

          {/* Acciones */}
          <div className="pt-6 mt-6 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            {canRequestModification && (
              <Button onClick={onEdit} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Edit2 className="h-4 w-4" />
                Actualizar Contacto
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
