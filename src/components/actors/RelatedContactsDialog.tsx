import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, User, Plus } from 'lucide-react';
import { useActorContacts } from '@/hooks/useActorContacts';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface RelatedContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actorId: string | null;
  actorName: string;
}

export const RelatedContactsDialog: React.FC<RelatedContactsDialogProps> = ({
  open,
  onOpenChange,
  actorId,
  actorName
}) => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { data: contacts = [], isLoading } = useActorContacts(actorId);
  const { data: teamMembers } = useTeamMembers();
  const queryClient = useQueryClient();

  const getTeamMemberNames = (memberIds: string[]) => {
    if (!memberIds?.length || !teamMembers) return [];
    return memberIds
      .map(id => teamMembers.find(member => member.id === id))
      .filter(Boolean)
      .map(member => `${member!.nombre} ${member!.apellidos}`);
  };

  const handleContactSuccess = () => {
    setContactDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['actor-contacts', actorId] });
    queryClient.invalidateQueries({ queryKey: ['actors-with-contacts'] });
    toast({
      title: "Contacto creado",
      description: "El contacto ha sido agregado exitosamente.",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contactos Relacionados - {actorName}
              </div>
              <Button
                onClick={() => setContactDialogOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Contacto
              </Button>
            </DialogTitle>
          </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay contactos registrados para este actor.
          </div>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.contact_id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {contact.nombre} {contact.apellidos}
                      </h3>
                      {contact.cargo && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {contact.cargo}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {contact.correo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-primary" />
                            <a href={`mailto:${contact.correo}`} className="hover:underline">
                              {contact.correo}
                            </a>
                          </div>
                        )}
                        
                        {contact.telefono && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-primary" />
                            <a href={`tel:${contact.telefono}`} className="hover:underline">
                              {contact.telefono}
                            </a>
                          </div>
                        )}
                        
                        {contact.ciudad && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{contact.ciudad}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {Array.isArray(contact.tipo_contacto) && contact.tipo_contacto.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {contact.tipo_contacto.map((red: string) => (
                            <Badge key={red} variant="secondary" className="text-xs mb-1">
                              {red}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {contact.responsable_seguimiento && contact.responsable_seguimiento.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Responsables de Seguimiento:</p>
                          <div className="flex flex-wrap gap-1">
                            {getTeamMemberNames(contact.responsable_seguimiento).map((nombre, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {nombre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {contact.notas && (
                        <div>
                          <p className="text-sm font-medium mb-1">Notas:</p>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {contact.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </DialogContent>
      </Dialog>

      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSuccess={handleContactSuccess}
        preselectedActorId={actorId}
      />
    </>
  );
};