import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, User, Plus, Search, Edit, Star } from 'lucide-react';
import { useActorContacts } from '@/hooks/useActorContacts';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/components/contacts/types';

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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      title: "Operación exitosa",
      description: "El contacto ha sido guardado exitosamente.",
    });
  };

  const handleAddClick = () => {
    setSelectedContact(null);
    setContactDialogOpen(true);
  };

  const openEditDialog = (contact: any) => {
    setSelectedContact(contact);
    setContactDialogOpen(true);
  };

  const toggleStrategic = async (contactId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    const previousContacts = queryClient.getQueryData(['actor-contacts', actorId]);
    queryClient.setQueryData(['actor-contacts', actorId], (old: any) => {
      if (!old) return old;
      return old.map((c: any) => c.contact_id === contactId ? { ...c, es_estrategico: newStatus } : c);
    });

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ es_estrategico: newStatus })
        .eq('contact_id', contactId);
        
      if (error) throw error;
      
      toast({
        title: "Estado actualizado",
        description: newStatus ? "Marcado como contacto estratégico." : "Desmarcado como contacto estratégico.",
      });
    } catch (err) {
      // Revert on error
      queryClient.setQueryData(['actor-contacts', actorId], previousContacts);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter((c: any) => 
      c.nombre?.toLowerCase().includes(query) ||
      c.apellidos?.toLowerCase().includes(query) ||
      c.cargo?.toLowerCase().includes(query) ||
      c.correo?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

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
                onClick={handleAddClick}
                size="sm"
                className="flex items-center gap-2 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Agregar Contacto
              </Button>
            </DialogTitle>
          </DialogHeader>
        
          {/* Módulo 1: Buscador */}
          <div className="relative mt-2 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, cargo o correo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 transition-shadow focus-visible:ring-1"
            />
          </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No se encontraron contactos que coincidan con la búsqueda.' : 'No hay contactos registrados para este actor.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.contact_id} className="group transition-all duration-300 hover:shadow-md border-muted/60 hover:border-border">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {/* Módulo 2: Botón de Edición Inline */}
                    <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary bg-background/50 backdrop-blur-sm shadow-sm"
                        onClick={() => openEditDialog(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      {/* Módulo 3: Flag Contacto Estratégico */}
                      <div className="flex items-center gap-2 mb-1 pr-10">
                        <button
                          onClick={() => toggleStrategic(contact.contact_id, !!contact.es_estrategico)}
                          className={`transition-all duration-300 p-1 -ml-1 rounded-full hover:bg-accent hover:scale-110 ${contact.es_estrategico ? 'text-yellow-500' : 'text-muted-foreground/40 hover:text-yellow-500/70'}`}
                          title={contact.es_estrategico ? "Desmarcar como estratégico" : "Marcar como estratégico"}
                        >
                          <Star className={`h-5 w-5 transition-all duration-300 ${contact.es_estrategico ? 'fill-current' : ''}`} />
                        </button>
                        <h3 className="font-semibold text-lg leading-none">
                          {contact.nombre} {contact.apellidos}
                        </h3>
                      </div>
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
        contact={selectedContact}
      />
    </>
  );
};