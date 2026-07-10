import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, FileEdit, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export function PendingRequestsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch actor change requests
  const { data: changeRequests = [], isLoading: isLoadingChanges } = useQuery({
    queryKey: ['pending-change-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actor_change_requests')
        .select(`*, actors(nombre_actor)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch pending new actors
  const { data: newActors = [], isLoading: isLoadingNew } = useQuery({
    queryKey: ['pending-new-actors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('*')
        .eq('status', 'pending_approval')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch contact change requests
  const { data: contactChangeRequests = [], isLoading: isLoadingContactChanges } = useQuery({
    queryKey: ['pending-contact-change-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_change_requests')
        .select(`*, contacts(nombre, apellidos)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch pending new contacts
  const { data: newContacts = [], isLoading: isLoadingNewContacts } = useQuery({
    queryKey: ['pending-new-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'pending_approval')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveChangeMutation = useMutation({
    mutationFn: async (request: any) => {
      // 1. Update the actor with the payload
      const { error: updateError } = await supabase
        .from('actors')
        .update(request.payload)
        .eq('actor_id', request.actor_id);
      if (updateError) throw updateError;

      // 2. Mark request as approved
      const { error: statusError } = await supabase
        .from('actor_change_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);
      if (statusError) throw statusError;
    },
    onSuccess: () => {
      toast({ title: 'Cambio Aprobado', description: 'Los datos del actor han sido actualizados.' });
      queryClient.invalidateQueries({ queryKey: ['pending-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    },
  });

  const rejectChangeMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('actor_change_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Cambio Rechazado', description: 'La solicitud ha sido descartada.' });
      queryClient.invalidateQueries({ queryKey: ['pending-change-requests'] });
    },
  });

  const approveNewActorMutation = useMutation({
    mutationFn: async (actorId: string) => {
      const { error } = await supabase
        .from('actors')
        .update({ status: 'active' })
        .eq('actor_id', actorId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Actor Aprobado', description: 'El nuevo actor ahora es público.' });
      queryClient.invalidateQueries({ queryKey: ['pending-new-actors'] });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    },
  });

  const rejectNewActorMutation = useMutation({
    mutationFn: async (actorId: string) => {
      const { error } = await supabase
        .from('actors')
        .update({ status: 'rejected' })
        .eq('actor_id', actorId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Actor Rechazado', description: 'La solicitud del nuevo actor ha sido rechazada.' });
      queryClient.invalidateQueries({ queryKey: ['pending-new-actors'] });
    },
  });

  const approveContactChangeMutation = useMutation({
    mutationFn: async (request: any) => {
      const { error: updateError } = await supabase
        .from('contacts')
        .update(request.payload)
        .eq('contact_id', request.contact_id);
      if (updateError) throw updateError;

      const { error: statusError } = await supabase
        .from('contact_change_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);
      if (statusError) throw statusError;
    },
    onSuccess: () => {
      toast({ title: 'Cambio Aprobado', description: 'Los datos del contacto han sido actualizados.' });
      queryClient.invalidateQueries({ queryKey: ['pending-contact-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const rejectContactChangeMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('contact_change_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Cambio Rechazado', description: 'La solicitud ha sido descartada.' });
      queryClient.invalidateQueries({ queryKey: ['pending-contact-change-requests'] });
    },
  });

  const approveNewContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'active' })
        .eq('contact_id', contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Contacto Aprobado', description: 'El nuevo contacto ahora es público.' });
      queryClient.invalidateQueries({ queryKey: ['pending-new-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const rejectNewContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'rejected' })
        .eq('contact_id', contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Contacto Rechazado', description: 'La solicitud del nuevo contacto ha sido rechazada.' });
      queryClient.invalidateQueries({ queryKey: ['pending-new-contacts'] });
    },
  });

  const isLoading = isLoadingChanges || isLoadingNew || isLoadingContactChanges || isLoadingNewContacts;
  const totalPending = changeRequests.length + newActors.length + contactChangeRequests.length + newContacts.length;

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">Cargando solicitudes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Solicitudes Pendientes
          {totalPending > 0 && (
            <Badge variant="destructive" className="ml-2">{totalPending}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Nuevos actores y solicitudes de modificación que requieren aprobación
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalPending === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay solicitudes pendientes en este momento.
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              
              {/* Rendering New Actors */}
              {newActors.map((actor: any) => (
                <div key={actor.actor_id} className="flex items-start gap-3 p-4 rounded-lg border bg-card shadow-sm">
                  <div className="mt-0.5 rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                    <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          Nuevo Actor
                        </Badge>
                        <span className="text-base font-semibold">{actor.nombre_actor}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {actor.updated_at ? format(new Date(actor.updated_at), "d MMM yyyy, HH:mm", { locale: es }) : ''}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveNewActorMutation.mutate(actor.actor_id)}
                        disabled={approveNewActorMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectNewActorMutation.mutate(actor.actor_id)}
                        disabled={rejectNewActorMutation.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rendering Change Requests */}
              {changeRequests.map((req: any) => (
                <div key={req.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card shadow-sm">
                  <div className="mt-0.5 rounded-full p-2 bg-orange-100 dark:bg-orange-900/30">
                    <FileEdit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                          Modificación de Actor
                        </Badge>
                        <span className="text-base font-semibold">{req.actors?.nombre_actor || 'Actor Desconocido'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        por {req.user_email} · {format(new Date(req.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>
                    {req.justification && (
                      <div className="bg-muted/50 p-2 text-sm rounded border border-muted mt-2">
                        <strong>Justificación:</strong> {req.justification}
                      </div>
                    )}
                    <div className="bg-muted/30 p-2 text-xs rounded font-mono overflow-x-auto mt-2">
                      {JSON.stringify(req.payload, null, 2)}
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveChangeMutation.mutate(req)}
                        disabled={approveChangeMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectChangeMutation.mutate(req.id)}
                        disabled={rejectChangeMutation.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rendering New Contacts */}
              {newContacts.map((contact: any) => (
                <div key={contact.contact_id} className="flex items-start gap-3 p-4 rounded-lg border bg-card shadow-sm">
                  <div className="mt-0.5 rounded-full p-2 bg-indigo-100 dark:bg-indigo-900/30">
                    <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                          Nuevo Contacto
                        </Badge>
                        <span className="text-base font-semibold">{contact.nombre} {contact.apellidos}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {contact.updated_at ? format(new Date(contact.updated_at), "d MMM yyyy, HH:mm", { locale: es }) : ''}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveNewContactMutation.mutate(contact.contact_id)}
                        disabled={approveNewContactMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectNewContactMutation.mutate(contact.contact_id)}
                        disabled={rejectNewContactMutation.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rendering Contact Change Requests */}
              {contactChangeRequests.map((req: any) => (
                <div key={req.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card shadow-sm">
                  <div className="mt-0.5 rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/30">
                    <FileEdit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Modificación de Contacto
                        </Badge>
                        <span className="text-base font-semibold">
                          {req.contacts ? `${req.contacts.nombre} ${req.contacts.apellidos}` : 'Contacto Desconocido'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        por {req.user_email} · {format(new Date(req.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>
                    {req.justification && (
                      <div className="bg-muted/50 p-2 text-sm rounded border border-muted mt-2">
                        <strong>Justificación:</strong> {req.justification}
                      </div>
                    )}
                    <div className="bg-muted/30 p-2 text-xs rounded font-mono overflow-x-auto mt-2">
                      {JSON.stringify(req.payload, null, 2)}
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveContactChangeMutation.mutate(req)}
                        disabled={approveContactChangeMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectContactChangeMutation.mutate(req.id)}
                        disabled={rejectContactChangeMutation.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
