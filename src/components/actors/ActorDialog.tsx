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
import { useActorsList } from '@/hooks/useActorsList';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { DuplicateWarning } from '@/components/DuplicateWarning';
import { sanitizeFormData } from '@/lib/textUtils';
import { ChangeRequestDialog } from './ChangeRequestDialog';
import { RecommendationsDialog } from './RecommendationsDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

const getActorSchema = (isAdmin: boolean) => z.object({
  nombre_actor: z.string().min(1, 'El nombre es requerido'),
  sector_actor: isAdmin ? z.string().optional() : z.string().min(1, 'El sector es requerido'),
  ciudad_sede: isAdmin ? z.string().optional() : z.string().min(1, 'La ciudad sede es requerida'),
  alcance_territorial: isAdmin ? z.string().optional() : z.string().min(1, 'El alcance es requerido'),
  tipo_relacion: isAdmin ? z.array(z.string()).optional() : z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo'),
  nivel_influencia: isAdmin ? z.number().optional() : z.number({ required_error: 'Requerido' }).min(1).max(5),
  nivel_interes: isAdmin ? z.number().optional() : z.number({ required_error: 'Requerido' }).min(1).max(5),
  
  programa_ids: z.array(z.string()).default([]),
  responsable_seguimiento: z.array(z.string()).default([]),
  telefono_entidad: z.string().default(''),
  direccion_entidad: z.string().default(''),
  correo_entidad: z.string().email('Formato de correo inválido').or(z.literal('')).default(''),
  anios_alianza: z.array(z.number()).default([]),
});

export function ActorDialog({ open, onOpenChange, actor, onSuccess }: ActorDialogProps) {
  const queryClient = useQueryClient();
  const [showRelatedContacts, setShowRelatedContacts] = React.useState(false);
  const [acknowledgedDuplicateSignature, setAcknowledgedDuplicateSignature] = useState<string | null>(null);
  const { data: allActors = [] } = useActorsList();
  const { canEdit, canEditActors, canDeleteActors, canCreatePendingActors } = usePermissions();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [changeRequestPayload, setChangeRequestPayload] = useState<any>(null);
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);

  const isStrategicEdit = !canEdit('actors') && canCreatePendingActors() && !!actor;
  const isStrategicCreate = !canEdit('actors') && canCreatePendingActors() && !actor;

  const isSuperAdmin = userProfile?.role === 'admin' || userProfile?.email === 'jtoro@funluker.org.co' || userProfile?.email === 'jgaviria@funluker.org.co';
  const { log } = useAuditLog();
  const currentSchema = React.useMemo(() => getActorSchema(isSuperAdmin), [isSuperAdmin]);

  const form = useForm<z.infer<ReturnType<typeof getActorSchema>>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      nombre_actor: '',
      sector_actor: '',
      ciudad_sede: '',
      alcance_territorial: 'Municipal',
      tipo_relacion: [],
      nivel_interes: undefined,
      
      programa_ids: [],
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
        
        programa_ids: actor.programas?.map((p: any) => p.id) || [],
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
        
        programa_ids: [],
        responsable_seguimiento: [],
        telefono_entidad: '',
        direccion_entidad: '',
        correo_entidad: '',
        anios_alianza: [],
      });
    }
  }, [actor, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<ReturnType<typeof getActorSchema>>) => {
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
        
        if (isSuperAdmin) {
          await log('direct_edit', 'actor', actor.actor_id, actorData.nombre_actor, {
            direct_update_by_admin: true,
            payload: actorData
          });
        }
      } else {
        // Create new actor
        const newActorData = {
          ...actorData,
          status: isSuperAdmin ? 'active' : 'pending_approval'
        };
        const { data, error } = await supabase
          .from('actors')
          .insert(newActorData)
          .select('actor_id')
          .single();
        if (error) throw error;
        actorId = data.actor_id;

        if (isSuperAdmin) {
          await log('direct_create', 'actor', actorId, actorData.nombre_actor, {
            direct_create_by_admin: true,
            payload: actorData
          });
        }
      }

      // Handle program associations
      if (actorId) {
        const { error: deleteError } = await (supabase as any)
          .from('actor_programs')
          .delete()
          .eq('actor_id', actorId);
          
        if (deleteError) {
          console.error('Error deleting previous programs:', deleteError);
          throw deleteError;
        }

        if (values.programa_ids && values.programa_ids.length > 0) {
          const associations = values.programa_ids.map(programId => ({
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
      if (isSuperAdmin) {
        toast({
          title: "Éxito",
          description: "Cambios guardados e implementados directamente",
        });
      }
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving actor:', error);
    }
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

  const onSubmit = (values: z.infer<ReturnType<typeof getActorSchema>>) => {
    if (actor && !isSuperAdmin) {
      setChangeRequestPayload(values);
      setIsChangeRequestOpen(true);
      return;
    }
    
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
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                {actor && isStrategicEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => setIsRecommendationsOpen(true)}
                  >
                    Agregar Recomendaciones
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {canEdit('actors') || (canCreatePendingActors() && !actor) ? 'Cancelar' : 'Cerrar'}
                </Button>
                {(canEdit('actors') || canCreatePendingActors() || isSuperAdmin) && (
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className={actor ? "bg-orange-600 hover:bg-orange-700 text-white" : "btn-animate"}
                  >
                    {mutation.isPending ? 'Procesando...' : (actor ? (isSuperAdmin ? 'Guardar y Aplicar' : 'Actualizar Actor') : (isSuperAdmin ? 'Crear y Aplicar' : 'Crear Actor'))}
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
        
        {actor && (
          <ChangeRequestDialog
            open={isChangeRequestOpen}
            onOpenChange={setIsChangeRequestOpen}
            actorId={actor.actor_id}
            payload={changeRequestPayload}
            onSuccess={() => onOpenChange(false)}
          />
        )}
        
        {actor && (
          <RecommendationsDialog
            open={isRecommendationsOpen}
            onOpenChange={setIsRecommendationsOpen}
            actor={actor}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
