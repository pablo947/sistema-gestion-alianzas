import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { ActorFormFields } from './ActorFormFields';
import { TagsManager } from './TagsManager';
import { RelatedContactsDialog } from './RelatedContactsDialog';
import { Actor, ActorDialogProps } from './types';
import { useActorProjects } from '@/hooks/useProjects';
import { useActorsList } from '@/hooks/useActorsList';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { DuplicateWarning } from '@/components/DuplicateWarning';
import { sanitizeFormData } from '@/lib/textUtils';

const actorSchema = z.object({
  nombre_actor: z.string().min(1, 'El nombre es requerido'),
  sector_actor: z.string().min(1, 'El sector es requerido'),
  ciudad_sede: z.string().default(''),
  alcance_territorial: z.string().default('Municipal'),
  tipo_relacion: z.array(z.string()).default([]),
  nivel_influencia: z.number().min(1).max(5).optional(),
  nivel_interes: z.number().min(1).max(5).optional(),
  
  proyecto_ids: z.array(z.string()).default([]),
  responsable_seguimiento: z.array(z.string()).default([]),
  telefono_entidad: z.string().default(''),
  direccion_entidad: z.string().default(''),
  correo_entidad: z.string().email('Formato de correo inválido').or(z.literal('')).default(''),
  anios_alianza: z.array(z.number()).default([]),
});

export function ActorDialog({ open, onOpenChange, actor, onSuccess }: ActorDialogProps) {
  const queryClient = useQueryClient();
  const { data: actorProjects } = useActorProjects(actor?.actor_id);
  const [showRelatedContacts, setShowRelatedContacts] = React.useState(false);
  const [acknowledgedDuplicateSignature, setAcknowledgedDuplicateSignature] = useState<string | null>(null);
  const { data: allActors = [] } = useActorsList();
  const { canEditActors, canDeleteActors } = usePermissions();
  const { userProfile } = useAuth();

  const form = useForm<z.infer<typeof actorSchema>>({
    resolver: zodResolver(actorSchema),
    defaultValues: {
      nombre_actor: '',
      sector_actor: '',
      ciudad_sede: '',
      alcance_territorial: 'Municipal',
      tipo_relacion: [],
      nivel_influencia: undefined,
      nivel_interes: undefined,
      proyecto_ids: [],
      responsable_seguimiento: [],
      telefono_entidad: '',
      direccion_entidad: '',
      correo_entidad: '',
      anios_alianza: [],
    },
  });

  const actorNameValue = form.watch('nombre_actor');
  const actorEmailValue = form.watch('correo_entidad');
  const duplicates = useDuplicateDetection(
    actorNameValue,
    allActors.map(a => ({ id: a.actor_id, name: a.nombre_actor, email: (a as any).correo_entidad })),
    actor?.actor_id,
    actorEmailValue
  );
  const duplicateSignature = `${actorNameValue}|${actorEmailValue}|${duplicates.map(d => d.id).join(',')}`;
  const hasDuplicates = duplicates.length > 0 && !actor && acknowledgedDuplicateSignature !== duplicateSignature;

  // Reset form with actor data when actor changes
  useEffect(() => {
    if (actor) {
      form.reset({
        nombre_actor: actor.nombre_actor || '',
        sector_actor: actor.sector_actor || '',
        ciudad_sede: actor.ciudad_sede || '',
        alcance_territorial: actor.alcance_territorial || 'Municipal',
        tipo_relacion: Array.isArray(actor.tipo_relacion) 
          ? actor.tipo_relacion 
          : actor.tipo_relacion 
            ? [actor.tipo_relacion] 
            : [],
        nivel_influencia: actor.nivel_influencia || undefined,
        nivel_interes: actor.nivel_interes || undefined,
        
        proyecto_ids: actorProjects?.map((p: any) => p.programa_id) || [],
        responsable_seguimiento: Array.isArray(actor.responsable_seguimiento) ? actor.responsable_seguimiento : [],
        telefono_entidad: (actor as any).telefono_entidad || '',
        direccion_entidad: (actor as any).direccion_entidad || '',
        correo_entidad: (actor as any).correo_entidad || '',
        anios_alianza: (actor as any).anios_alianza || [],
      });
    } else {
      form.reset({
        nombre_actor: '',
        sector_actor: '',
        ciudad_sede: '',
        alcance_territorial: 'Municipal',
        tipo_relacion: [],
        nivel_influencia: undefined,
        nivel_interes: undefined,
        
        proyecto_ids: [],
        responsable_seguimiento: [],
        telefono_entidad: '',
        direccion_entidad: '',
        correo_entidad: '',
        anios_alianza: [],
      });
    }
  }, [actor, actorProjects, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof actorSchema>) => {
      const sanitized = sanitizeFormData(values);
      const actorData = {
        nombre_actor: sanitized.nombre_actor,
        sector_actor: sanitized.sector_actor,
        ciudad_sede: sanitized.ciudad_sede,
        alcance_territorial: sanitized.alcance_territorial,
        tipo_relacion: sanitized.tipo_relacion,
        nivel_influencia: sanitized.nivel_influencia || null,
        nivel_interes: sanitized.nivel_interes || null,
        
        responsable_seguimiento: sanitized.responsable_seguimiento,
        telefono_entidad: sanitized.telefono_entidad || null,
        direccion_entidad: sanitized.direccion_entidad || null,
        correo_entidad: sanitized.correo_entidad || null,
        anios_alianza: sanitized.anios_alianza,
        // Status only sent for creations, not updates (Auditor updates status via Actors page)
      };

      console.log('Sending actor data:', actorData);

      let actorId = actor?.actor_id;

      if (actor) {
        // Update existing actor
        const { error } = await supabase
          .from('actors')
          .update(actorData)
          .eq('actor_id', actor.actor_id);
        if (error) throw error;
      } else {
        // Create new actor
        const newActorData = {
          ...actorData,
          status: userProfile?.role === 'strategic' ? 'pending_approval' : 'active'
        };
        const { data, error } = await supabase
          .from('actors')
          .insert(newActorData)
          .select('actor_id')
          .single();
        if (error) throw error;
        actorId = data.actor_id;
      }

      // Handle program associations
      if (actorId) {
        await (supabase as any)
          .from('actor_programs')
          .delete()
          .eq('actor_id', actorId);

        if (values.proyecto_ids && values.proyecto_ids.length > 0) {
          const associations = values.proyecto_ids.map(programId => ({
            actor_id: actorId,
            program_id: programId,
          }));

          const { error: insertError } = await (supabase as any)
            .from('actor_programs')
            .insert(associations);
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      queryClient.invalidateQueries({ queryKey: ['actor-programs'] });
      onSuccess();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const { error } = await supabase
        .from('actors')
        .delete()
        .eq('actor_id', actor.actor_id);
      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (values: z.infer<typeof actorSchema>) => {
    mutation.mutate(values);
  };

  const handleDelete = () => {
    if (actor && window.confirm(`¿Estás seguro de que quieres eliminar el actor "${actor.nombre_actor}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {actor ? 'Editar Actor' : 'Nuevo Actor'}
          </DialogTitle>
          <DialogDescription>
            {actor 
              ? 'Modifica la información del actor.'
              : 'Agrega un nuevo actor al sistema.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <ActorFormFields
              control={form.control}
              setValue={form.setValue}
              duplicateWarning={hasDuplicates ? (
              <DuplicateWarning
                duplicates={duplicates}
                entityType="actor"
                onViewExisting={(id) => {
                  window.open(`/actors?actorId=${id}`, '_blank', 'noopener,noreferrer');
                }}
                onAcknowledge={() => setAcknowledgedDuplicateSignature(duplicateSignature)}
              />
              ) : null}
            />

            <div className="flex justify-between items-center pt-4 sticky bottom-0 bg-background">
              {actor && (
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowRelatedContacts(true)}
                  >
                    Contactos Relacionados
                  </Button>
                  {canDeleteActors() && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="btn-animate"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              )}
              <div className="flex space-x-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {canEditActors() || (userProfile?.role === 'strategic' && !actor) ? 'Cancelar' : 'Cerrar'}
                </Button>
                {(canEditActors() || (userProfile?.role === 'strategic' && !actor)) && (
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn-animate"
                  >
                    {actor ? 'Actualizar' : 'Crear'} Actor
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>

        <RelatedContactsDialog
          open={showRelatedContacts}
          onOpenChange={setShowRelatedContacts}
          actorId={actor?.actor_id || null}
          actorName={actor?.nombre_actor || ''}
        />
      </DialogContent>
    </Dialog>
  );
}
