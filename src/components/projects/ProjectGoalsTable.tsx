import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Meta } from "./types";

interface ProjectGoalsTableProps {
  form: UseFormReturn<any>;
}

export function ProjectGoalsTable({ form }: ProjectGoalsTableProps) {
  const metas: Meta[] = form.watch('metas') || [];

  const addMeta = () => {
    const newMeta: Meta = {
      id: Date.now().toString(),
      indicador: '',
      meta: '',
      unidad: '',
      avance_actual: 0,
      fecha_limite: ''
    };
    form.setValue('metas', [...metas, newMeta]);
  };

  const removeMeta = (id: string) => {
    form.setValue('metas', metas.filter(meta => meta.id !== id));
  };

  const updateMeta = (id: string, field: keyof Meta, value: any) => {
    const updatedMetas = metas.map(meta => 
      meta.id === id ? { ...meta, [field]: value } : meta
    );
    form.setValue('metas', updatedMetas);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Tabla de Metas e Indicadores</FormLabel>
        <Button type="button" onClick={addMeta} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Meta
        </Button>
      </div>
      
      {metas.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Avance Actual</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell>
                    <Input
                      value={meta.indicador}
                      onChange={(e) => updateMeta(meta.id, 'indicador', e.target.value)}
                      placeholder="Indicador"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={meta.meta}
                      onChange={(e) => updateMeta(meta.id, 'meta', e.target.value)}
                      placeholder="Meta"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={meta.unidad}
                      onChange={(e) => updateMeta(meta.id, 'unidad', e.target.value)}
                      placeholder="Unidad"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={meta.avance_actual}
                      onChange={(e) => updateMeta(meta.id, 'avance_actual', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={meta.fecha_limite}
                      onChange={(e) => updateMeta(meta.id, 'fecha_limite', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMeta(meta.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}