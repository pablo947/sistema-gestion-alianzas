import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EventFormData {
  title: string;
  category: string;
  start_date: string;
  end_date: string;
  description: string;
  external_link: string;
  actor_id: string;
  project_id: string;
}

export function EventFormDialog({ open, onOpenChange, onSuccess }: EventFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userProfile, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: actors } = useQuery({
    queryKey: ['actors-list-calendar'],
    queryFn: async () => {
      const { data } = await supabase.from('actors').select('id, name').order('name');
      return data || [];
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-list-calendar'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('id, name').order('name');
      return data || [];
    }
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      const status = isAdmin ? 'approved' : 'pending_approval';

      const { error } = await supabase.from('events').insert({
        title: data.title,
        category: data.category,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        description: data.description || null,
        external_link: data.external_link || null,
        actor_id: data.actor_id || null,
        project_id: data.project_id || null,
        status,
        created_by: userProfile?.id,
      });

      if (error) throw error;

      toast({
        title: isAdmin ? "Evento creado" : "Evento enviado a revisión",
        description: isAdmin 
          ? "El evento ha sido publicado en el calendario."
          : "El evento está pendiente de aprobación por auditoría.",
      });

      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error al crear evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-foreground">Crear Nuevo Evento</DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? 'Los eventos se publicarán inmediatamente en el calendario.'
              : 'Los eventos creados serán revisados por auditoría antes de ser publicados.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Título del evento *</Label>
            <Input {...register('title', { required: true })} placeholder="Ej. Congreso Anual" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select onValueChange={(val) => setValue('category', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eventos Internacionales">Eventos Internacionales</SelectItem>
                  <SelectItem value="Eventos Nacionales">Eventos Nacionales</SelectItem>
                  <SelectItem value="Eventos de la Fundación">Eventos de la Fundación</SelectItem>
                  <SelectItem value="Convocatorias Activas">Convocatorias Activas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Enlace externo (opcional)</Label>
              <Input type="url" {...register('external_link')} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha y hora de inicio *</Label>
              <Input type="datetime-local" {...register('start_date', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Fecha y hora de fin *</Label>
              <Input type="datetime-local" {...register('end_date', { required: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea {...register('description')} rows={3} placeholder="Detalles del evento..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label>Vincular a Actor (opcional)</Label>
              <Select onValueChange={(val) => setValue('actor_id', val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {actors?.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vincular a Programa (opcional)</Label>
              <Select onValueChange={(val) => setValue('project_id', val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn-animate bg-luker-teal text-white hover:bg-luker-teal/90">
              {isSubmitting ? 'Guardando...' : (isAdmin ? 'Publicar Evento' : 'Enviar a Revisión')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
