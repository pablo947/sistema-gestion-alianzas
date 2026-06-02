import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { EJES } from "@/lib/ejes";

interface ProjectSelectionFieldsProps {
  form: UseFormReturn<any>;
}


export function ProjectSelectionFields({ form }: ProjectSelectionFieldsProps) {
  const { data: actors = [], isLoading: isLoadingActors } = useQuery({
    queryKey: ['actors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('actor_id, nombre_actor')
        .order('nombre_actor');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="eje_estrategico"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Eje Estratégico *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el eje estratégico" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EJES.map((eje) => (

                  <SelectItem key={eje} value={eje}>{eje}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="actor_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actores Involucrados</FormLabel>
            <FormControl>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {isLoadingActors ? (
                  <div className="text-sm text-muted-foreground">Cargando actores...</div>
                ) : actors && actors.length > 0 ? (
                  actors.map((actor) => (
                    <div key={actor.actor_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={actor.actor_id}
                        checked={field.value?.includes(actor.actor_id) || false}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, actor.actor_id]);
                          } else {
                            field.onChange(currentValue.filter((id: string) => id !== actor.actor_id));
                          }
                        }}
                      />
                      <label
                        htmlFor={actor.actor_id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {actor.nombre_actor}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No hay actores disponibles</div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado del Proyecto</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Planificado">Planificado</SelectItem>
                <SelectItem value="Ejecución">Ejecución</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
