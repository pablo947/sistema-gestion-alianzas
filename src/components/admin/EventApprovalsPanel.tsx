import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import type { LukerEvent } from '@/components/calendar/EventsCalendar';

export function EventApprovalsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingEvents, isLoading } = useQuery({
    queryKey: ['pending-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          actor:actors(name),
          project:projects(name)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as LukerEvent[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      if (status === 'rejected') {
        // Hard delete on reject based on plan
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').update({ status }).eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: status === 'approved' ? "Evento aprobado" : "Evento rechazado y eliminado",
        description: status === 'approved' 
          ? "El evento ahora es visible en el calendario." 
          : "El evento ha sido eliminado del sistema.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div className="p-4">Cargando eventos pendientes...</div>;
  }

  return (
    <div className="space-y-4">
      {pendingEvents?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>No hay eventos pendientes de aprobación.</p>
          </CardContent>
        </Card>
      ) : (
        pendingEvents?.map(event => (
          <Card key={event.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-heading text-luker-brown">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground">
                      {event.category}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => updateStatusMutation.mutate({ id: event.id, status: 'rejected' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1" /> Rechazar
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-luker-green hover:bg-luker-green/90"
                    onClick={() => updateStatusMutation.mutate({ id: event.id, status: 'approved' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" /> Aprobar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <p className="font-semibold text-foreground">Fecha y Hora:</p>
                  <p className="text-muted-foreground">
                    {format(new Date(event.start_date), "dd/MM/yyyy HH:mm", { locale: es })} - {format(new Date(event.end_date), "HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Vínculos:</p>
                  <ul className="text-muted-foreground">
                    {event.actor?.name && <li>Actor: {event.actor.name}</li>}
                    {event.project?.name && <li>Programa: {event.project.name}</li>}
                    {!event.actor?.name && !event.project?.name && <li>Ninguno</li>}
                  </ul>
                </div>
                {event.description && (
                  <div className="col-span-full">
                    <p className="font-semibold text-foreground">Descripción:</p>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
