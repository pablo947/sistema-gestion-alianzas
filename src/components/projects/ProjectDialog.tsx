
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProjectFormFields } from "./ProjectFormFields";
import { ProjectDialogProps } from "./types";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";

import { EJES } from "@/lib/ejes";

const projectSchema = z.object({
  nombre: z.string().min(1, "El título es requerido"),
  objetivos: z.string().optional(),
  eje_estrategico: z.enum(EJES, { errorMap: () => ({ message: "El eje es requerido" }) }),
  actor_ids: z.array(z.string()).default([]),
  estado: z.enum(["Planificado", "Ejecución", "Finalizado"]).optional(),
  fecha_inicio: z.string().optional(),
  fecha_cierre: z.string().optional(),
  presupuesto_total: z.number().min(0).default(0),
  presupuesto_ejecutado: z.number().min(0).default(0),
  metas: z.array(z.object({
    id: z.string(),
    codigo: z.string(),
    indicador: z.string(),
    tipo: z.enum(["gestión", "impacto", "resultado"]),
    areas_reportan: z.array(z.string()),
    meta: z.string(),
    avance: z.number(),
    frecuencia_reporte: z.enum(["Semanal", "Mensual", "Trimestral", "Semestral", "Anual"])
  })).optional()
}).refine(
  (data) => {
    if (data.presupuesto_total > 0) {
      return data.presupuesto_ejecutado <= data.presupuesto_total;
    }
    return true;
  },
  { message: "El presupuesto ejecutado no puede ser mayor al presupuesto total", path: ["presupuesto_ejecutado"] }
).refine(
  (data) => {
    if (data.fecha_inicio && data.fecha_cierre) {
      return new Date(data.fecha_inicio) <= new Date(data.fecha_cierre);
    }
    return true;
  },
  { message: "La fecha de finalización debe ser posterior a la fecha de inicio", path: ["fecha_cierre"] }
);

type ProjectFormData = z.infer<typeof projectSchema>;

const defaultProjectValues: Partial<ProjectFormData> = {
  nombre: "",
  objetivos: "",
  actor_ids: [],
  estado: "Planificado",
  fecha_inicio: "",
  fecha_cierre: "",
  presupuesto_total: 0,
  presupuesto_ejecutado: 0,
  metas: [],
};


export function ProjectDialog({ open, onOpenChange, project, onSuccess }: ProjectDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEditProjects, canDeleteProjects } = usePermissions();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultProjectValues
  });

  useEffect(() => {
    if (project) {
      const getProjectActors = async () => {
        const { data: programActors } = await (supabase as any)
          .from('actor_programs')
          .select('actor_id')
          .eq('program_id', project.programa_id);

        const actorIds = (programActors || []).map((pa: any) => pa.actor_id);

        form.reset({
          nombre: project.nombre || "",
          objetivos: project.objetivos || "",
          eje_estrategico: (project as any).eje_estrategico || undefined,
          actor_ids: actorIds,
          estado: (project.estado as "Planificado" | "Ejecución" | "Finalizado") || "Planificado",
          fecha_inicio: project.fecha_inicio || "",
          fecha_cierre: project.fecha_cierre || "",
          presupuesto_total: project.presupuesto_total || 0,
          presupuesto_ejecutado: project.presupuesto_ejecutado || 0,
          metas: Array.isArray(project.metas) ? project.metas : []
        });

      };
      getProjectActors();
    } else {
      form.reset(defaultProjectValues);
    }
  }, [project, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const { data: newProgram, error } = await (supabase as any)
        .from('programs')
        .insert({
          nombre: data.nombre,
          objetivos: data.objetivos || null,
          eje_estrategico: data.eje_estrategico,

          actor_id: null,
          estado: data.estado || "Planificado",
          fecha_inicio: data.fecha_inicio || null,
          fecha_cierre: data.fecha_cierre || null,
          presupuesto_total: data.presupuesto_total || 0,
          presupuesto_ejecutado: data.presupuesto_ejecutado || 0,
          metas: data.metas || [],
          avance: {}
        })
        .select('programa_id')
        .single();

      if (error) throw error;

      if (data.actor_ids && data.actor_ids.length > 0 && newProgram) {
        const relationships = data.actor_ids.map(actorId => ({
          actor_id: actorId,
          program_id: (newProgram as any).programa_id
        }));
        const { error: relationError } = await (supabase as any).from('actor_programs').insert(relationships);
        if (relationError) throw relationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      queryClient.invalidateQueries({ queryKey: ['actor-programs'] });
      toast({ title: "Programa creado", description: "El programa ha sido creado exitosamente." });
      onSuccess();
      onOpenChange(false);
      form.reset(defaultProjectValues);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Hubo un error al crear el programa.", variant: "destructive" });
      console.error('Error creating program:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (!project) throw new Error("Programa no encontrado");

      const { error } = await (supabase as any)
        .from('programs')
        .update({
          nombre: data.nombre,
          objetivos: data.objetivos || null,
          eje_estrategico: data.eje_estrategico,

          actor_id: null,
          estado: data.estado || "Planificado",
          fecha_inicio: data.fecha_inicio || null,
          fecha_cierre: data.fecha_cierre || null,
          presupuesto_total: data.presupuesto_total || 0,
          presupuesto_ejecutado: data.presupuesto_ejecutado || 0,
          metas: data.metas || [],
          updated_at: new Date().toISOString()
        })
        .eq('programa_id', project.programa_id);

      if (error) throw error;

      await (supabase as any).from('actor_programs').delete().eq('program_id', project.programa_id);

      if (data.actor_ids && data.actor_ids.length > 0) {
        const relationships = data.actor_ids.map(actorId => ({
          actor_id: actorId,
          program_id: project.programa_id
        }));
        const { error: relationError } = await (supabase as any).from('actor_programs').insert(relationships);
        if (relationError) throw relationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      queryClient.invalidateQueries({ queryKey: ['actor-programs'] });
      toast({ title: "Programa actualizado", description: "El programa ha sido actualizado exitosamente." });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Hubo un error al actualizar el programa.", variant: "destructive" });
      console.error('Error updating program:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Programa no encontrado");
      const { error } = await (supabase as any).from('programs').delete().eq('programa_id', project.programa_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: "Programa eliminado", description: "El programa ha sido eliminado exitosamente." });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Hubo un error al eliminar el programa.", variant: "destructive" });
      console.error('Error deleting program:', error);
    }
  });

  const onSubmit = (data: ProjectFormData) => {
    if (project) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-h-[92vh]">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {project ? "Editar Programa / Iniciativa" : "Crear Nuevo Programa / Iniciativa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[calc(92vh-76px)] flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <ProjectFormFields form={form} />
            </div>

            <div className="flex flex-col gap-3 border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {project && canDeleteProjects() && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Eliminando..." : "Eliminar Programa"}
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {canEditProjects() ? 'Cancelar' : 'Cerrar'}
                </Button>
                {canEditProjects() && (
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Guardando..."
                      : project ? "Actualizar" : "Crear"
                    }
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
