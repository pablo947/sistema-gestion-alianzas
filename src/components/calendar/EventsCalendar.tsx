import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventFormDialog } from './EventFormDialog';
import { EventDetailModal } from './EventDetailModal';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface LukerEvent {
  id: string;
  title: string;
  category: string;
  start_date: string;
  end_date: string;
  description: string | null;
  external_link: string | null;
  actor_id: string | null;
  project_id: string | null;
  status: string;
  actor?: { name: string };
  project?: { name: string };
}

export function EventsCalendar() {
  const { userProfile, isAdmin } = useAuth();
  const isStrategic = userProfile?.role === 'strategic';
  const canCreate = isAdmin || isStrategic;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LukerEvent | null>(null);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Query events. RLS will filter automatically what user can see
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          actor:actors(name),
          project:projects(name)
        `);
      if (error) throw error;
      return data as LukerEvent[];
    }
  });

  const parsedEvents = (events || []).map(event => ({
    ...event,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
  }));

  const getEventStyle = (event: LukerEvent) => {
    let backgroundColor = '#8ebc22'; // Default Luker Green
    
    switch (event.category) {
      case 'Eventos Internacionales':
        backgroundColor = '#8ebc22'; // Green
        break;
      case 'Eventos Nacionales':
        backgroundColor = '#009eae'; // Teal
        break;
      case 'Eventos de la Fundación':
        backgroundColor = '#ff7c80'; // Coral
        break;
      case 'Convocatorias Activas':
        backgroundColor = '#fbb03f'; // Orange
        break;
    }

    if (event.status === 'pending_approval') {
      return {
        style: {
          backgroundColor,
          opacity: 0.6,
          border: '2px dashed #623e19',
          color: 'white',
          borderRadius: '4px',
        }
      };
    }

    return {
      style: {
        backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        boxShadow: '0 2px 4px -1px rgba(98, 62, 25, 0.2)',
      }
    };
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground">Calendario de Eventos</h2>
          <p className="text-sm text-muted-foreground mt-1">Eventos y convocatorias de la Fundación Luker</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 btn-animate bg-luker-teal text-white hover:bg-luker-teal/90">
            <Plus className="w-4 h-4" /> Nuevo Evento
          </Button>
        )}
      </div>

      <div className="h-[600px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">Cargando eventos...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={parsedEvents}
            startAccessor="start"
            endAccessor="end"
            culture="es"
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día"
            }}
            eventPropGetter={getEventStyle as any}
            onSelectEvent={(event) => setSelectedEvent(event as unknown as LukerEvent)}
            className="font-sans"
          />
        )}
      </div>

      <EventFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          setIsFormOpen(false);
          refetch();
        }}
      />

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
