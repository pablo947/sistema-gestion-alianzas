import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, Building2, FolderKanban, Info } from 'lucide-react';
import type { LukerEvent } from './EventsCalendar';

interface EventDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LukerEvent;
}

export function EventDetailModal({ open, onOpenChange, event }: EventDetailModalProps) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Eventos Internacionales': return 'text-luker-green bg-luker-green/10 border-luker-green/20';
      case 'Eventos Nacionales': return 'text-luker-teal bg-luker-teal/10 border-luker-teal/20';
      case 'Eventos de la Fundación': return 'text-luker-red bg-luker-red/10 border-luker-red/20';
      case 'Convocatorias Activas': return 'text-luker-orange bg-luker-orange/10 border-luker-orange/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-background">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-heading text-luker-brown pr-4">
              {event.title}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            {event.status === 'pending_approval' && (
              <span className="ml-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border border-yellow-500/20 bg-yellow-500/10 text-yellow-700">
                Pendiente de Aprobación
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Fecha y Hora */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <CalendarIcon className="w-5 h-5 text-luker-teal" />
              <div>
                <p className="text-sm font-medium text-foreground">Inicio</p>
                <p className="text-sm">{format(startDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5 text-luker-orange" />
              <div>
                <p className="text-sm font-medium text-foreground">Hora</p>
                <p className="text-sm">
                  {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Enlaces y Entidades */}
          <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border">
            {event.actor?.name && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-luker-brown" />
                <span className="text-sm font-medium">Actor:</span>
                <span className="text-sm text-muted-foreground">{event.actor.name}</span>
              </div>
            )}
            
            {event.project?.name && (
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-luker-brown" />
                <span className="text-sm font-medium">Programa:</span>
                <span className="text-sm text-muted-foreground">{event.project.name}</span>
              </div>
            )}

            {event.external_link && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-luker-teal" />
                <span className="text-sm font-medium">Enlace:</span>
                <a href={event.external_link} target="_blank" rel="noopener noreferrer" className="text-sm text-luker-teal hover:underline truncate max-w-[200px]">
                  {event.external_link}
                </a>
              </div>
            )}
            
            {!event.actor?.name && !event.project?.name && !event.external_link && (
              <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                <Info className="w-4 h-4" /> Sin entidades o enlaces vinculados
              </div>
            )}
          </div>

          {/* Descripción */}
          {event.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Descripción</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
