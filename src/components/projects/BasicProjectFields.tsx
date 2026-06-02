
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface BasicProjectFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicProjectFields({ form }: BasicProjectFieldsProps) {
  console.log("BasicProjectFields - Rendering, should NOT include 'resultados' field");
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Título del Proyecto *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ingrese el título del proyecto" 
                {...field} 
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="objetivos"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Objetivos</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describa los objetivos del proyecto"
                className="min-h-[120px] mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fecha_inicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Fecha de Inicio</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fecha_cierre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Fecha de Finalización</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
