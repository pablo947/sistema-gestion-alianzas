import { useState } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { DEPARTAMENTOS_OPTIONS, MUNICIPIOS_POR_DEPARTAMENTO } from "./constants";
import { LugarActuacion } from "./types";

interface LugaresActuacionFieldsProps {
  control: Control<any>;
  setValue: (name: string, value: any) => void;
}

export function LugaresActuacionFields({ control, setValue }: LugaresActuacionFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lugares_actuacion",
  });

  // Watch all lugares_actuacion values to get current departments
  const watchedLugares = useWatch({
    control,
    name: "lugares_actuacion",
    defaultValue: []
  });

  const addLugarActuacion = () => {
    append({ departamento: "", municipios: [] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">Lugares de Actuación</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLugarActuacion}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar lugar
        </Button>
      </div>

      {fields.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No hay lugares de actuación definidos. 
              <br />
              Haz clic en "Agregar lugar" para empezar.
            </p>
          </CardContent>
        </Card>
      )}

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Lugar {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`lugares_actuacion.${index}.departamento`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset municipios when department changes
                      setValue(`lugares_actuacion.${index}.municipios`, []);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTAMENTOS_OPTIONS.map((departamento) => (
                        <SelectItem key={departamento} value={departamento}>
                          {departamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`lugares_actuacion.${index}.municipios`}
              render={({ field }) => {
                const selectedDepartamento = watchedLugares?.[index]?.departamento;
                const availableMunicipios = selectedDepartamento ? 
                  MUNICIPIOS_POR_DEPARTAMENTO[selectedDepartamento as keyof typeof MUNICIPIOS_POR_DEPARTAMENTO] || [] : 
                  [];

                return (
                  <FormItem>
                    <FormLabel>Municipios</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {!selectedDepartamento ? (
                          <p className="text-sm text-muted-foreground">
                            Selecciona un departamento primero
                          </p>
                        ) : availableMunicipios.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No hay municipios disponibles para este departamento
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {availableMunicipios.map((municipio) => (
                              <div key={municipio} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${index}-${municipio}`}
                                  checked={field.value?.includes(municipio) || false}
                                  onCheckedChange={(checked) => {
                                    const updatedMunicipios = checked
                                      ? [...(field.value || []), municipio]
                                      : (field.value || []).filter((m: string) => m !== municipio);
                                    field.onChange(updatedMunicipios);
                                  }}
                                />
                                <label
                                  htmlFor={`${index}-${municipio}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {municipio}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}