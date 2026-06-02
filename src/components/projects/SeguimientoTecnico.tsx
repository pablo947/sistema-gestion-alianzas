import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, ClipboardList, Target, TrendingUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { IndicadorTecnico } from "./types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface SeguimientoTecnicoProps {
  form: UseFormReturn<any>;
}

const AREAS_DISPONIBLES = [
  "Educación",
  "Emprendimiento",
  "Desarrollo Rural",
  "Proyectos Especiales",
  "Innovación",
  "Comunicaciones"
];

const TIPOS_INDICADOR = ["gestión", "impacto", "resultado"] as const;
const FRECUENCIAS = ["Semanal", "Mensual", "Trimestral", "Semestral", "Anual"] as const;

const TAB_CONFIG = [
  { value: "gestión", label: "Gestión", icon: ClipboardList },
  { value: "resultado", label: "Resultado", icon: Target },
  { value: "impacto", label: "Impacto", icon: TrendingUp },
] as const;

export function SeguimientoTecnico({ form }: SeguimientoTecnicoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndicador, setEditingIndicador] = useState<IndicadorTecnico | null>(null);
  const [activeTab, setActiveTab] = useState<string>("gestión");
  const [formData, setFormData] = useState<Partial<IndicadorTecnico>>({
    codigo: "",
    indicador: "",
    tipo: "gestión",
    areas_reportan: [],
    meta: "",
    avance: 0,
    frecuencia_reporte: "Mensual"
  });

  const indicadores: IndicadorTecnico[] = form.watch('metas') || [];

  const gestionIndicators = indicadores.filter(i => i.tipo === "gestión");
  const resultadoIndicators = indicadores.filter(i => i.tipo === "resultado");
  const impactoIndicators = indicadores.filter(i => i.tipo === "impacto");

  const countByType: Record<string, number> = {
    "gestión": gestionIndicators.length,
    "resultado": resultadoIndicators.length,
    "impacto": impactoIndicators.length,
  };

  const indicatorsByType: Record<string, IndicadorTecnico[]> = {
    "gestión": gestionIndicators,
    "resultado": resultadoIndicators,
    "impacto": impactoIndicators,
  };

  const openCreateDialog = () => {
    setEditingIndicador(null);
    setFormData({
      codigo: "",
      indicador: "",
      tipo: activeTab as any,
      areas_reportan: [],
      meta: "",
      avance: 0,
      frecuencia_reporte: "Mensual"
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (indicador: IndicadorTecnico) => {
    setEditingIndicador(indicador);
    setFormData(indicador);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingIndicador) {
      const updatedIndicadores = indicadores.map(ind =>
        ind.id === editingIndicador.id ? { ...formData, id: editingIndicador.id } as IndicadorTecnico : ind
      );
      form.setValue('metas', updatedIndicadores);
    } else {
      const newIndicador: IndicadorTecnico = {
        ...formData,
        id: Date.now().toString()
      } as IndicadorTecnico;
      form.setValue('metas', [...indicadores, newIndicador]);
    }
    setIsDialogOpen(false);
  };

  const removeIndicador = (id: string) => {
    form.setValue('metas', indicadores.filter(ind => ind.id !== id));
  };

  const toggleArea = (area: string) => {
    const currentAreas = formData.areas_reportan || [];
    const updatedAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    setFormData(prev => ({ ...prev, areas_reportan: updatedAreas }));
  };

  const handleAvanceChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numericValue = value === '' ? 0 : parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, avance: numericValue }));
    }
  };

  const renderIndicatorTable = (items: IndicadorTecnico[]) => {
    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          No hay indicadores en esta categoría.
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Código</TableHead>
              <TableHead className="min-w-[280px]">Indicador</TableHead>
              <TableHead className="w-[90px]">Meta</TableHead>
              <TableHead className="w-[90px]">Avance</TableHead>
              <TableHead className="w-[110px]">Frecuencia</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((indicador) => (
              <TableRow key={indicador.id}>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{indicador.codigo}</Badge>
                </TableCell>
                <TableCell className="whitespace-normal break-words text-sm">
                  {indicador.indicador}
                </TableCell>
                <TableCell className="text-sm">{indicador.meta}</TableCell>
                <TableCell className="text-sm">{indicador.avance}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{indicador.frecuencia_reporte}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEditDialog(indicador)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeIndicador(indicador.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-medium">Seguimiento Técnico</FormLabel>
        <Button type="button" onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Indicador
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              {label} ({countByType[value]})
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_CONFIG.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-3 space-y-0">
            {renderIndicatorTable(indicatorsByType[value])}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndicador ? "Editar Indicador" : "Nuevo Indicador"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Código</FormLabel>
                <Input
                  value={formData.codigo || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ej: IND-001"
                />
              </div>
              <div>
                <FormLabel>Tipo</FormLabel>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_INDICADOR.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <FormLabel>Indicador</FormLabel>
              <Input
                value={formData.indicador || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, indicador: e.target.value }))}
                placeholder="Descripción del indicador"
              />
            </div>

            <div>
              <FormLabel>Áreas que Reportan</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {AREAS_DISPONIBLES.map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${area}`}
                      checked={formData.areas_reportan?.includes(area)}
                      onCheckedChange={() => toggleArea(area)}
                    />
                    <label htmlFor={`edit-${area}`} className="text-sm">{area}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Meta</FormLabel>
                <Input
                  value={formData.meta || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta: e.target.value }))}
                  placeholder="Valor objetivo"
                />
              </div>
              <div>
                <FormLabel>Avance</FormLabel>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formData.avance?.toString() || "0"}
                  onChange={(e) => handleAvanceChange(e.target.value)}
                  placeholder="0"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div>
              <FormLabel>Frecuencia de Reporte</FormLabel>
              <Select
                value={formData.frecuencia_reporte}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frecuencia_reporte: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRECUENCIAS.map(freq => (
                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave}>
                {editingIndicador ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
