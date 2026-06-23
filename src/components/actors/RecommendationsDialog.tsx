import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const recommendationsSchema = z.object({
  directrices_trato: z.string().optional(),
  exigencias_contractuales: z.boolean().default(false),
  detalles_exigencias: z.string().optional(),
  criticidad: z.string().optional(),
  fecha_revision: z.string().optional(),
  responsable_relacion: z.string().optional(),
});

interface RecommendationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: any;
}

export function RecommendationsDialog({ open, onOpenChange, actor }: RecommendationsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof recommendationsSchema>>({
    resolver: zodResolver(recommendationsSchema),
    defaultValues: {
      directrices_trato: actor?.directrices_trato || '',
      exigencias_contractuales: actor?.exigencias_contractuales || false,
      detalles_exigencias: actor?.detalles_exigencias || '',
      criticidad: actor?.criticidad || '',
      fecha_revision: actor?.fecha_revision ? format(new Date(actor.fecha_revision), 'yyyy-MM-dd') : '',
      responsable_relacion: actor?.responsable_relacion || '',
    },
  });

  const watchExigencias = form.watch('exigencias_contractuales');

  useEffect(() => {
    if (actor) {
      form.reset({
        directrices_trato: actor.directrices_trato || '',
        exigencias_contractuales: actor.exigencias_contractuales || false,
        detalles_exigencias: actor.detalles_exigencias || '',
        criticidad: actor.criticidad || '',
        fecha_revision: actor.fecha_revision ? format(new Date(actor.fecha_revision), 'yyyy-MM-dd') : '',
        responsable_relacion: actor.responsable_relacion || '',
      });
    }
  }, [actor, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof recommendationsSchema>) => {
      const { error } = await supabase
        .from('actors')
        .update({
          directrices_trato: values.directrices_trato || null,
          exigencias_contractuales: values.exigencias_contractuales,
          detalles_exigencias: values.exigencias_contractuales ? (values.detalles_exigencias || null) : null,
          criticidad: values.criticidad || null,
          fecha_revision: values.fecha_revision || null,
          responsable_relacion: values.responsable_relacion || null,
        })
        .eq('actor_id', actor.actor_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Recomendaciones guardadas',
        description: 'La información ha sido actualizada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'Hubo un problema al guardar las recomendaciones.',
      });
      console.error(error);
    }
  });

  const onSubmit = (values: z.infer<typeof recommendationsSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recomendaciones y Gestión de Relación</DialogTitle>
          <DialogDescription>
            Configura las directrices específicas para el trato con {actor?.nombre_actor}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            
            <FormField
              control={form.control}
              name="directrices_trato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Directrices de Trato Específico</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej: Solo contactar vía email, prefiere reuniones matutinas..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="criticidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de Criticidad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione la criticidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsable_relacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable Interno</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del responsable" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_revision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Próxima Revisión</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="exigencias_contractuales"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Exigencias Contractuales / Acuerdos
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {watchExigencias && (
              <FormField
                control={form.control}
                name="detalles_exigencias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles de las Exigencias</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Especifique los detalles..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar Recomendaciones'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
