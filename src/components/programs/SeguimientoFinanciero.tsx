import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";

interface SeguimientoFinancieroProps {
  form: UseFormReturn<any>;
}

export function SeguimientoFinanciero({ form }: SeguimientoFinancieroProps) {
  const presupuestoTotal = form.watch('presupuesto_total') || 0;
  const presupuestoEjecutado = form.watch('presupuesto_ejecutado') || 0;
  
  const calcularPorcentajeEjecucion = () => {
    if (presupuestoTotal === 0) return 0;
    return Math.round((presupuestoEjecutado / presupuestoTotal) * 100);
  };

  const porcentajeEjecucion = calcularPorcentajeEjecucion();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-medium">Seguimiento Financiero</FormLabel>
        <Badge variant={porcentajeEjecucion > 100 ? "destructive" : "default"}>
          {porcentajeEjecucion}% ejecutado
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="presupuesto_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presupuesto Total</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="presupuesto_ejecutado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presupuesto Ejecutado</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {presupuestoEjecutado > presupuestoTotal && presupuestoTotal > 0 && (
        <div className="text-sm text-destructive">
          ⚠️ El presupuesto ejecutado supera el presupuesto total
        </div>
      )}
    </div>
  );
}